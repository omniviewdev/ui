package main

import (
	"context"
	"encoding/json"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"
)

const (
	lspMaxMessage   = 32768
	lspMaxDocuments = 16
	lspMaxPending   = 8
)

type rpcMessage struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
}
type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
type rpcResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Result  interface{}     `json:"result,omitempty"`
	Error   *rpcError       `json:"error,omitempty"`
}

func rpcResult(id json.RawMessage, result interface{}) []byte {
	// result:null is required for shutdown, not an omitted result member.
	b, _ := json.Marshal(struct {
		JSONRPC string          `json:"jsonrpc"`
		ID      json.RawMessage `json:"id"`
		Result  interface{}     `json:"result"`
	}{"2.0", id, result})
	return b
}
func rpcFailure(id json.RawMessage, code int, message string) []byte {
	if len(id) == 0 {
		id = json.RawMessage("null")
	}
	b, _ := json.Marshal(rpcResponse{JSONRPC: "2.0", ID: id, Error: &rpcError{code, message}})
	return b
}
func parseRPC(data []byte) (rpcMessage, int) {
	var m rpcMessage
	if len(data) > lspMaxMessage || !utf8.Valid(data) || !json.Valid(data) {
		return m, -32700
	}
	if json.Unmarshal(data, &m) != nil || m.JSONRPC != "2.0" || m.Method == "" {
		return rpcMessage{}, -32600
	}
	if len(m.ID) > 0 {
		var str string
		if json.Unmarshal(m.ID, &str) != nil {
			if _, err := strconv.ParseInt(string(m.ID), 10, 64); err != nil {
				return rpcMessage{}, -32600
			}
		}
	}
	if len(m.Params) > 0 && string(m.Params) != "null" && m.Params[0] != '{' {
		return m, -32602
	}
	return m, 0
}

type lspDocument struct {
	text       string
	version    int
	generation uint64
}
type lspSession struct {
	mu          sync.Mutex
	service     *Service
	initialized bool
	ready       bool
	shutdown    bool
	exited      bool
	profile     string
	snippets    bool
	encoding    string
	documents   map[string]lspDocument
	pending     map[string]context.CancelFunc
	generation  uint64
}

func newLSPSession(service *Service) *lspSession {
	return &lspSession{service: service, encoding: "utf-16", documents: make(map[string]lspDocument), pending: make(map[string]context.CancelFunc)}
}
func (s *lspSession) close() { s.mu.Lock(); defer s.mu.Unlock(); s.closeLocked() }
func (s *lspSession) closeLocked() {
	s.exited = true
	clear(s.documents)
	for _, cancel := range s.pending {
		cancel()
	}
}
func (s *lspSession) dispatch(ctx context.Context, data []byte) []byte { return s.prepare(ctx, data)() }
func immediate(data []byte) func() []byte                              { return func() []byte { return data } }
func validURI(uri string) bool {
	if len(uri) == 0 || len(uri) > 2048 {
		return false
	}
	u, err := url.Parse(uri)
	return err == nil && u.IsAbs()
}
func objectParams(data json.RawMessage, v interface{}) bool {
	return len(data) > 0 && data[0] == '{' && json.Unmarshal(data, v) == nil
}
func requestKey(id json.RawMessage) string {
	var text string
	if json.Unmarshal(id, &text) == nil {
		return "s:" + text
	}
	return "n:" + string(id)
}

// prepare applies lifecycle/document notifications synchronously. Only immutable
// semantic snapshots run concurrently, so stdio ordering and HTTP isolation share
// exactly the same implementation, including cancellation and stale responses.
func (s *lspSession) prepare(parent context.Context, data []byte) func() []byte {
	m, code := parseRPC(data)
	if code != 0 {
		if code == -32602 && len(m.ID) == 0 {
			return immediate(nil)
		}
		return immediate(rpcFailure(m.ID, code, "Invalid JSON-RPC request"))
	}
	request := len(m.ID) > 0
	failure := func(code int, message string) func() []byte {
		if !request {
			return immediate(nil)
		}
		return immediate(rpcFailure(m.ID, code, message))
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if m.Method == "$/cancelRequest" {
		if request {
			return failure(-32600, "cancelRequest is a notification")
		}
		var p struct {
			ID json.RawMessage `json:"id"`
		}
		if objectParams(m.Params, &p) {
			if cancel := s.pending[requestKey(p.ID)]; cancel != nil {
				cancel()
			}
		}
		return immediate(nil)
	}
	if m.Method == "exit" && !request {
		s.closeLocked()
		return immediate(nil)
	}
	if s.exited {
		return failure(-32600, "Session exited")
	}
	if m.Method == "initialize" {
		if !request || s.initialized {
			return failure(-32600, "Initialize must be the first request")
		}
		var p struct {
			Capabilities *struct {
				General struct {
					PositionEncodings []string `json:"positionEncodings"`
				} `json:"general"`
				TextDocument struct {
					Completion struct {
						CompletionItem struct {
							SnippetSupport bool `json:"snippetSupport"`
						} `json:"completionItem"`
					} `json:"completion"`
				} `json:"textDocument"`
			} `json:"capabilities"`
			Options *struct {
				ProfileID    string `json:"profileId"`
				ResourceType string `json:"resourceType"`
			} `json:"initializationOptions"`
		}
		if !objectParams(m.Params, &p) || p.Capabilities == nil || p.Options == nil || s.service.catalog.Profiles[p.Options.ProfileID] == nil || len(p.Options.ResourceType) > 256 {
			return failure(-32602, "initializationOptions.profileId must select a known development fixture profile")
		}
		for _, enc := range p.Capabilities.General.PositionEncodings {
			if enc == "utf-8" || enc == "utf-16" {
				s.encoding = enc
				break
			}
		}
		s.profile = p.Options.ProfileID
		s.snippets = p.Capabilities.TextDocument.Completion.CompletionItem.SnippetSupport
		s.initialized = true
		capabilities := map[string]interface{}{
			"positionEncoding": s.encoding, "textDocumentSync": struct {
				OpenClose bool `json:"openClose"`
				Change    int  `json:"change"`
			}{true, 1},
			"completionProvider": map[string]interface{}{"triggerCharacters": []string{".", "[", "\"", "'"}, "resolveProvider": false},
			"hoverProvider":      true, "signatureHelpProvider": map[string]interface{}{"triggerCharacters": []string{"(", ","}},
			"diagnosticProvider": map[string]interface{}{"interFileDependencies": false, "workspaceDiagnostics": false},
		}
		return immediate(rpcResult(m.ID, map[string]interface{}{"capabilities": capabilities, "serverInfo": map[string]string{"name": "omniview-cel", "version": "0.1.0"}}))
	}
	if !s.initialized {
		return failure(-32002, "Server not initialized")
	}
	if s.shutdown {
		return failure(-32600, "Server has shut down")
	}
	if m.Method == "initialized" && !request {
		s.ready = true
		return immediate(nil)
	}
	if !s.ready {
		return failure(-32002, "initialized notification required")
	}
	if m.Method == "shutdown" {
		if !request {
			return immediate(nil)
		}
		s.shutdown = true
		for _, cancel := range s.pending {
			cancel()
		}
		return immediate(rpcResult(m.ID, nil))
	}
	if m.Method == "textDocument/didOpen" {
		if request {
			return failure(-32600, "didOpen is a notification")
		}
		var p struct {
			Document *struct {
				URI        string  `json:"uri"`
				LanguageID string  `json:"languageId"`
				Version    *int    `json:"version"`
				Text       *string `json:"text"`
			} `json:"textDocument"`
		}
		if !objectParams(m.Params, &p) || p.Document == nil {
			return immediate(nil)
		}
		d := p.Document
		_, exists := s.documents[d.URI]
		if exists || len(s.documents) >= lspMaxDocuments || !validURI(d.URI) || d.LanguageID != "cel" || d.Version == nil || *d.Version < 0 || d.Text == nil || len(*d.Text) > 8192 || !utf8.ValidString(*d.Text) {
			return immediate(nil)
		}
		s.generation++
		s.documents[d.URI] = lspDocument{*d.Text, *d.Version, s.generation}
		return immediate(nil)
	}
	if m.Method == "textDocument/didChange" {
		if request {
			return failure(-32600, "didChange is a notification")
		}
		var p struct {
			Document *struct {
				URI     string `json:"uri"`
				Version *int   `json:"version"`
			} `json:"textDocument"`
			Changes []struct {
				Text        *string         `json:"text"`
				Range       json.RawMessage `json:"range"`
				RangeLength json.RawMessage `json:"rangeLength"`
			} `json:"contentChanges"`
		}
		if !objectParams(m.Params, &p) || p.Document == nil || p.Document.Version == nil || len(p.Changes) != 1 {
			return immediate(nil)
		}
		old, ok := s.documents[p.Document.URI]
		change := p.Changes[0]
		if !ok || *p.Document.Version <= old.version || change.Text == nil || len(change.Range) > 0 || len(change.RangeLength) > 0 || len(*change.Text) > 8192 || !utf8.ValidString(*change.Text) {
			return immediate(nil)
		}
		s.generation++
		s.documents[p.Document.URI] = lspDocument{*change.Text, *p.Document.Version, s.generation}
		return immediate(nil)
	}
	if m.Method == "textDocument/didClose" {
		if request {
			return failure(-32600, "didClose is a notification")
		}
		var p struct {
			Document *struct {
				URI string `json:"uri"`
			} `json:"textDocument"`
		}
		if objectParams(m.Params, &p) && p.Document != nil {
			delete(s.documents, p.Document.URI)
		}
		return immediate(nil)
	}
	switch m.Method {
	case "textDocument/completion", "textDocument/hover", "textDocument/signatureHelp", "textDocument/diagnostic":
	default:
		return failure(-32601, "Method not found")
	}
	if !request {
		return immediate(nil)
	}
	var p struct {
		Document *struct {
			URI string `json:"uri"`
		} `json:"textDocument"`
		Position *struct {
			Line      *int `json:"line"`
			Character *int `json:"character"`
		} `json:"position"`
	}
	if !objectParams(m.Params, &p) || p.Document == nil {
		return failure(-32602, "textDocument required")
	}
	doc, ok := s.documents[p.Document.URI]
	if !ok {
		return failure(-32602, "Document is not open")
	}
	offset := 0
	if m.Method != "textDocument/diagnostic" {
		if p.Position == nil || p.Position.Line == nil || p.Position.Character == nil {
			return failure(-32602, "position required")
		}
		var err error
		offset, err = positionOffset(doc.text, lspPosition{*p.Position.Line, *p.Position.Character}, s.encoding)
		if err != nil {
			return failure(-32602, err.Error())
		}
	}
	key := requestKey(m.ID)
	if _, duplicate := s.pending[key]; duplicate {
		return failure(-32600, "Request ID already pending")
	}
	if len(s.pending) >= lspMaxPending {
		return failure(-32000, "Session request limit")
	}
	ctx, cancel := context.WithTimeout(parent, time.Second)
	s.pending[key] = cancel
	req := Request{Document: Document{doc.text, doc.version}, Cursor: Cursor{offset, "utf8-byte"}, FixtureProfile: s.profile}
	encoding := s.encoding
	snippets := s.snippets
	uri := p.Document.URI
	return func() []byte {
		defer cancel()
		defer func() { s.mu.Lock(); delete(s.pending, key); s.mu.Unlock() }()
		if ctx.Err() != nil {
			return rpcFailure(m.ID, -32800, "Request cancelled")
		}
		select {
		case s.service.slots <- struct{}{}:
			defer func() { <-s.service.slots }()
		default:
			return rpcFailure(m.ID, -32000, "Development service concurrency limit")
		}
		var response Response
		switch m.Method {
		case "textDocument/completion":
			response = s.service.Complete(ctx, req)
		case "textDocument/hover":
			response = s.service.Hover(ctx, req)
		case "textDocument/signatureHelp":
			response = s.service.Signature(ctx, req)
		case "textDocument/diagnostic":
			response = s.service.Check(ctx, req)
		}
		if !snippets {
			for i := range response.Completions {
				c := &response.Completions[i]
				if c.InsertTextFormat == "snippet" {
					c.Edit.Text = plainSnippet(c.Edit.Text)
					c.InsertTextFormat = "plain"
				}
			}
		}
		s.mu.Lock()
		current, open := s.documents[uri]
		stale := !open || current.generation != doc.generation
		s.mu.Unlock()
		if ctx.Err() != nil {
			return rpcFailure(m.ID, -32800, "Request cancelled")
		}
		if stale {
			return rpcFailure(m.ID, -32801, "Document changed during request")
		}
		return rpcResult(m.ID, lspSemanticResult(m.Method, doc.text, encoding, response))
	}
}
func markup(value string) map[string]string {
	return map[string]string{"kind": "plaintext", "value": value}
}
func lspSemanticResult(method, text, encoding string, r Response) interface{} {
	switch method {
	case "textDocument/completion":
		items := make([]interface{}, 0, len(r.Completions))
		for _, c := range r.Completions {
			kind := 6
			switch c.Kind {
			case "field":
				kind = 5
			case "function":
				kind = 3
			case "value":
				kind = 12
			}
			detail := c.Detail
			if detail == "" {
				detail = c.Type
			}
			format := 1
			if c.InsertTextFormat == "snippet" {
				format = 2
			}
			item := map[string]interface{}{"label": c.Label, "kind": kind, "detail": detail, "documentation": markup(c.Description), "insertTextFormat": format, "textEdit": map[string]interface{}{"range": wireRange(text, c.Edit.Range, encoding), "newText": c.Edit.Text}}
			if c.Type != "" {
				item["labelDetails"] = map[string]string{"description": c.Type}
			}
			if c.FilterText != "" {
				item["filterText"] = c.FilterText
			}
			if c.SortText != "" {
				item["sortText"] = c.SortText
			}
			items = append(items, item)
		}
		return map[string]interface{}{"isIncomplete": r.Incomplete, "items": items}
	case "textDocument/hover":
		if r.Hover == nil {
			return nil
		}
		return map[string]interface{}{"contents": markup(r.Hover.Contents), "range": wireRange(text, r.Hover.Range, encoding)}
	case "textDocument/signatureHelp":
		if r.Signature == nil {
			return nil
		}
		sig := r.Signature
		parameters := make([]interface{}, 0, len(sig.Parameters))
		for _, p := range sig.Parameters {
			parameters = append(parameters, map[string]interface{}{"label": p.Label, "documentation": markup(p.Documentation)})
		}
		return map[string]interface{}{"signatures": []interface{}{map[string]interface{}{"label": sig.Label, "documentation": markup(sig.Documentation), "parameters": parameters}}, "activeSignature": 0, "activeParameter": sig.ActiveParameter}
	case "textDocument/diagnostic":
		items := make([]interface{}, 0, len(r.Diagnostics))
		for _, d := range r.Diagnostics {
			severity := 1
			if d.Severity == "warning" {
				severity = 2
			}
			items = append(items, map[string]interface{}{"range": wireRange(text, d.Range, encoding), "severity": severity, "code": d.ID, "source": "cel", "message": d.Message})
		}
		return struct {
			Kind  string        `json:"kind"`
			Items []interface{} `json:"items"`
		}{"full", items}
	}
	return nil
}

// The CEL engine emits only numbered placeholders with optional plain defaults,
// not arbitrary client snippets. Clients without snippet support receive those
// defaults as plain insertion text rather than literal placeholder syntax.
func plainSnippet(text string) string {
	var out strings.Builder
	for {
		start := strings.Index(text, "${")
		if start < 0 {
			out.WriteString(text)
			return out.String()
		}
		end := strings.IndexByte(text[start+2:], '}')
		if end < 0 {
			out.WriteString(text)
			return out.String()
		}
		end += start + 2
		out.WriteString(text[:start])
		if _, value, ok := strings.Cut(text[start+2:end], ":"); ok {
			out.WriteString(value)
		}
		text = text[end+1:]
	}
}
