package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func rpcCall(t *testing.T, s *lspSession, method string, params string) map[string]json.RawMessage {
	t.Helper()
	raw := s.dispatch(context.Background(), []byte(`{"jsonrpc":"2.0","id":1,"method":"`+method+`","params":`+params+`}`))
	var out map[string]json.RawMessage
	if err := json.Unmarshal(raw, &out); err != nil {
		t.Fatal(err, string(raw))
	}
	return out
}
func rpcNotify(s *lspSession, method, params string) {
	s.dispatch(context.Background(), []byte(`{"jsonrpc":"2.0","method":"`+method+`","params":`+params+`}`))
}
func rpcCode(out map[string]json.RawMessage) int {
	var e struct {
		Code int `json:"code"`
	}
	json.Unmarshal(out["error"], &e)
	return e.Code
}
func initializedSession(t *testing.T, profile string) *lspSession {
	t.Helper()
	s := newLSPSession(testService(t))
	out := rpcCall(t, s, "initialize", `{"capabilities":{},"initializationOptions":{"profileId":"`+profile+`"}}`)
	if rpcCode(out) != 0 {
		t.Fatalf("initialize: %s", out)
	}
	rpcNotify(s, "initialized", `{}`)
	return s
}
func openDocument(s *lspSession, uri, text string, version int) {
	b, _ := json.Marshal(map[string]interface{}{"textDocument": map[string]interface{}{"uri": uri, "languageId": "cel", "text": text, "version": version}})
	rpcNotify(s, "textDocument/didOpen", string(b))
}

// Catches out-of-order requests and advertising unsupported editor operations.
func TestLSPInitializationAndOrdering(t *testing.T) {
	s := newLSPSession(testService(t))
	if got := rpcCode(rpcCall(t, s, "textDocument/completion", `{}`)); got != -32002 {
		t.Fatalf("before init %d", got)
	}
	out := rpcCall(t, s, "initialize", `{"capabilities":{"general":{"positionEncodings":["utf-8","utf-16"]}},"initializationOptions":{"profileId":"cloud"}}`)
	var result struct {
		Capabilities map[string]json.RawMessage `json:"capabilities"`
	}
	json.Unmarshal(out["result"], &result)
	if string(result.Capabilities["positionEncoding"]) != `"utf-8"` || string(result.Capabilities["textDocumentSync"]) != `{"openClose":true,"change":1}` {
		t.Fatalf("capabilities: %s", out["result"])
	}
	for _, name := range []string{"renameProvider", "documentFormattingProvider", "semanticTokensProvider"} {
		if _, ok := result.Capabilities[name]; ok {
			t.Fatal(name)
		}
	}
	if rpcCode(rpcCall(t, s, "initialize", `{}`)) != -32600 {
		t.Fatal("duplicate initialize")
	}
	if rpcCode(rpcCall(t, s, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///a"}}`)) != -32002 {
		t.Fatal("requires initialized")
	}
	rpcNotify(s, "initialized", `{}`)
	if rpcCode(rpcCall(t, s, "unknown", `{}`)) != -32601 {
		t.Fatal("unknown method")
	}
	if rpcCode(rpcCall(t, s, "shutdown", `null`)) != 0 {
		t.Fatal("shutdown")
	}
	if rpcCode(rpcCall(t, s, "textDocument/diagnostic", `{}`)) != -32600 {
		t.Fatal("work after shutdown")
	}
	rpcNotify(s, "exit", `null`)
	if !s.exited {
		t.Fatal("exit")
	}
}

// Catches cross-session text leaks, ignored stale versions, missing close, and semantic stubs.
func TestLSPDocumentsAndSemanticResults(t *testing.T) {
	a, b := initializedSession(t, "cloud"), initializedSession(t, "pod")
	openDocument(a, "file:///a", "cp", 1)
	openDocument(b, "file:///a", "cccc", 1)
	params := `{"textDocument":{"uri":"file:///a"},"position":{"line":0,"character":2}}`
	out := rpcCall(t, a, "textDocument/completion", params)
	if !bytes.Contains(out["result"], []byte(`"label":"cpuCount"`)) {
		t.Fatalf("cloud completion: %s", out)
	}
	out = rpcCall(t, b, "textDocument/completion", params)
	if bytes.Contains(out["result"], []byte(`"label":"cpuCount"`)) {
		t.Fatal("session leaked")
	}
	rpcNotify(a, "textDocument/didChange", `{"textDocument":{"uri":"file:///a","version":2},"contentChanges":[{"text":"true"}]}`)
	rpcNotify(a, "textDocument/didChange", `{"textDocument":{"uri":"file:///a","version":1},"contentChanges":[{"text":"broken"}]}`)
	out = rpcCall(t, a, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///a"}}`)
	if string(out["result"]) != `{"kind":"full","items":[]}` {
		t.Fatalf("stale change applied: %s", out)
	}
	openDocument(a, "file:///hover", "resource.cpuCount > 0", 1)
	out = rpcCall(t, a, "textDocument/hover", `{"textDocument":{"uri":"file:///hover"},"position":{"line":0,"character":12}}`)
	if !bytes.Contains(out["result"], []byte("int")) {
		t.Fatalf("hover: %s", out)
	}
	openDocument(b, "file:///sig", "resource.status.phase.startsWith(", 1)
	out = rpcCall(t, b, "textDocument/signatureHelp", `{"textDocument":{"uri":"file:///sig"},"position":{"line":0,"character":33}}`)
	if !bytes.Contains(out["result"], []byte("startsWith")) {
		t.Fatalf("signature: %s", out)
	}
	openDocument(b, "file:///bad", "resource.noSuchField == true", 1)
	out = rpcCall(t, b, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///bad"}}`)
	if !bytes.Contains(out["result"], []byte(`"severity":1`)) {
		t.Fatalf("diagnostic: %s", out)
	}
	rpcNotify(a, "textDocument/didClose", `{"textDocument":{"uri":"file:///a"}}`)
	if rpcCode(rpcCall(t, a, "textDocument/completion", params)) != -32602 {
		t.Fatal("closed doc retained")
	}
}

// Catches byte/UTF16 confusion, split surrogate positions and CRLF newline drift.
func TestLSPPositionBoundaries(t *testing.T) {
	text := "é😀x\r\nz"
	for _, tc := range []struct {
		enc    string
		pos    lspPosition
		offset int
	}{{"utf-16", lspPosition{0, 3}, 6}, {"utf-8", lspPosition{0, 6}, 6}, {"utf-16", lspPosition{1, 1}, 10}, {"utf-16", lspPosition{0, 99}, 7}} {
		got, err := positionOffset(text, tc.pos, tc.enc)
		if err != nil || got != tc.offset {
			t.Fatalf("%+v got %d %v", tc, got, err)
		}
		p := offsetPosition(text, tc.offset, tc.enc)
		if tc.pos.Character != 99 && p != tc.pos {
			t.Fatalf("roundtrip %+v", p)
		}
	}
	if _, err := positionOffset(text, lspPosition{0, 2}, "utf-16"); err == nil {
		t.Fatal("split surrogate")
	}
	if _, err := positionOffset(text, lspPosition{0, 3}, "utf-8"); err == nil {
		t.Fatal("split utf8")
	}
}

// Cancellation must produce a terminal response even before semantic execution starts.
func TestLSPCancellationAndChangedContent(t *testing.T) {
	s := initializedSession(t, "pod")
	openDocument(s, "file:///a", "resource.", 1)
	work := s.prepare(context.Background(), []byte(`{"jsonrpc":"2.0","id":"cancel-me","method":"textDocument/completion","params":{"textDocument":{"uri":"file:///a"},"position":{"line":0,"character":9}}}`))
	rpcNotify(s, "$/cancelRequest", `{"id":"cancel-me"}`)
	var out map[string]json.RawMessage
	json.Unmarshal(work(), &out)
	if rpcCode(out) != -32800 {
		t.Fatalf("cancel response: %s", out)
	}
	work = s.prepare(context.Background(), []byte(`{"jsonrpc":"2.0","id":2,"method":"textDocument/completion","params":{"textDocument":{"uri":"file:///a"},"position":{"line":0,"character":9}}}`))
	rpcNotify(s, "textDocument/didChange", `{"textDocument":{"uri":"file:///a","version":2},"contentChanges":[{"text":"true"}]}`)
	json.Unmarshal(work(), &out)
	if rpcCode(out) != -32801 {
		t.Fatalf("stale response: %s", out)
	}
}

func TestLSPHTTPServerIssuedSessions(t *testing.T) {
	handler := testService(t).Handler()
	post := func(token, body string) *httptest.ResponseRecorder {
		w := httptest.NewRecorder()
		r := httptest.NewRequest(http.MethodPost, "/lsp", strings.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		if token != "" {
			r.Header.Set(lspSessionHeader, token)
		}
		handler.ServeHTTP(w, r)
		return w
	}
	init := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"initializationOptions":{"profileId":"pod"}}}`
	w := post("", init)
	token := w.Header().Get(lspSessionHeader)
	if w.Code != 200 || token == "" {
		t.Fatalf("initialize %d %s", w.Code, w.Body)
	}
	if w = post("guessed", init); w.Code != 404 {
		t.Fatal("accepted unknown session", w.Code)
	}
	if w = post(token, `{"jsonrpc":"2.0","method":"initialized","params":{}}`); w.Code != 204 {
		t.Fatal(w.Code)
	}
	post(token, `{"jsonrpc":"2.0","id":2,"method":"shutdown"}`)
	if w = post(token, `{"jsonrpc":"2.0","method":"exit"}`); w.Code != 204 {
		t.Fatal(w.Code)
	}
	if w = post(token, `{"jsonrpc":"2.0","id":3,"method":"shutdown"}`); w.Code != 404 {
		t.Fatal("session retained", w.Code)
	}
}

// Real Content-Length exchange catches stdout contamination and custom HTTP coupling.
func TestLSPStdioFraming(t *testing.T) {
	messages := []string{`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"initializationOptions":{"profileId":"pod"}}}`, `{"jsonrpc":"2.0","method":"initialized","params":{}}`, `{"jsonrpc":"2.0","id":2,"method":"shutdown"}`, `{"jsonrpc":"2.0","method":"exit"}`}
	var input, output bytes.Buffer
	for _, m := range messages {
		fmt.Fprintf(&input, "Content-Length: %d\r\n\r\n%s", len(m), m)
	}
	if err := serveStdio(context.Background(), testService(t), &input, &output); err != nil {
		t.Fatal(err)
	}
	reader := newFrameReader(&output)
	for _, id := range []int{1, 2} {
		frame, err := reader.read()
		if err != nil {
			t.Fatal(err)
		}
		var response struct {
			ID int `json:"id"`
		}
		json.Unmarshal(frame, &response)
		if response.ID != id {
			t.Fatalf("response %s", frame)
		}
	}
	if _, err := reader.read(); err != io.EOF {
		t.Fatal("extra frame", err)
	}
	for _, bad := range []string{"Content-Length: 999999\r\n\r\n", "Content-Length: 1\r\nContent-Length: 1\r\n\r\nx", strings.Repeat("x", 8193)} {
		if _, err := newFrameReader(strings.NewReader(bad)).read(); err == nil {
			t.Fatal("unbounded/ambiguous frame")
		}
	}
}

// Catches resource-limit bypasses and malformed JSON becoming successful work.
func TestLSPValidationAndBounds(t *testing.T) {
	s := initializedSession(t, "pod")
	for _, tc := range []struct {
		body string
		code int
	}{
		{`{`, -32700}, {`[]`, -32600}, {`{"jsonrpc":"2.0","id":{},"method":"initialize"}`, -32600},
		{`{"jsonrpc":"2.0","id":2,"method":"textDocument/completion","params":[]}`, -32602},
	} {
		var out map[string]json.RawMessage
		json.Unmarshal(s.dispatch(context.Background(), []byte(tc.body)), &out)
		if rpcCode(out) != tc.code {
			t.Fatalf("%s: %s", tc.body, out)
		}
	}
	for i := range lspMaxDocuments {
		openDocument(s, fmt.Sprintf("file:///%d", i), "true", 1)
	}
	openDocument(s, "file:///overflow", "true", 1)
	if rpcCode(rpcCall(t, s, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///overflow"}}`)) != -32602 {
		t.Fatal("document limit bypassed")
	}
	rpcNotify(s, "textDocument/didClose", `{"textDocument":{"uri":"file:///0"}}`)
	openDocument(s, "file:///oversize", strings.Repeat("x", 8193), 1)
	if rpcCode(rpcCall(t, s, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///oversize"}}`)) != -32602 {
		t.Fatal("byte limit bypassed")
	}
	rpcNotify(s, "textDocument/didChange", `{"textDocument":{"uri":"file:///1","version":2},"contentChanges":[{"range":{"start":{"line":0,"character":0},"end":{"line":0,"character":1}},"text":"broken"}]}`)
	if out := rpcCall(t, s, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///1"}}`); bytes.Contains(out["result"], []byte(`"severity"`)) {
		t.Fatal("incremental change accepted")
	}
	works := make([]func() []byte, 0, lspMaxPending)
	for i := range lspMaxPending {
		works = append(works, s.prepare(context.Background(), []byte(fmt.Sprintf(`{"jsonrpc":"2.0","id":%d,"method":"textDocument/diagnostic","params":{"textDocument":{"uri":"file:///1"}}}`, 100+i))))
	}
	if rpcCode(rpcCall(t, s, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///1"}}`)) != -32000 {
		t.Fatal("pending limit bypassed")
	}
	for _, work := range works {
		work()
	}
	if rpcCode(rpcCall(t, s, "textDocument/diagnostic", `{"textDocument":{"uri":"file:///1"}}`)) != 0 {
		t.Fatal("pending slots leaked")
	}
	for _, path := range []string{"/complete", "/check", "/hover", "/signature"} {
		w := httptest.NewRecorder()
		s.service.Handler().ServeHTTP(w, httptest.NewRequest(http.MethodPost, path, strings.NewReader(`{}`)))
		if w.Code != 404 {
			t.Fatal("obsolete route", path, w.Code)
		}
	}
}

func TestLSPIdleExpiryAndSessionCapacity(t *testing.T) {
	h := newLSPHTTP(testService(t))
	s := initializedSession(t, "pod")
	openDocument(s, "file:///a", "true", 1)
	e := &httpLSPSession{session: s, lastUsed: time.Now().Add(-lspSessionIdle - time.Second), timer: time.NewTimer(time.Hour)}
	h.sessions["old"] = e
	h.expire("old", e)
	if len(h.sessions) != 0 || !s.exited || len(s.documents) != 0 {
		t.Fatal("idle session retained documents")
	}
	active := &httpLSPSession{session: initializedSession(t, "pod"), lastUsed: time.Now(), timer: time.NewTimer(time.Hour)}
	h.sessions["active"] = active
	h.expire("active", active)
	if len(h.sessions) != 1 || active.session.exited {
		t.Fatal("stale timer expired active session")
	}
	h.remove("active", active)
	for i := range lspMaxSessions {
		token := fmt.Sprint(i)
		entry := &httpLSPSession{session: newLSPSession(h.service), timer: time.NewTimer(time.Hour)}
		h.sessions[token] = entry
	}
	defer func() {
		for token, entry := range h.sessions {
			h.remove(token, entry)
		}
	}()
	r := httptest.NewRequest(http.MethodPost, "/lsp", strings.NewReader(`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"initializationOptions":{"profileId":"pod"}}}`))
	r.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	if w.Code != 429 {
		t.Fatal("session capacity bypassed", w.Code)
	}
}

func TestLSPNotificationSilenceAndSnippetNegotiation(t *testing.T) {
	for _, support := range []bool{false, true} {
		s := newLSPSession(testService(t))
		caps := `{}`
		if support {
			caps = `{"textDocument":{"completion":{"completionItem":{"snippetSupport":true}}}}`
		}
		out := rpcCall(t, s, "initialize", `{"capabilities":`+caps+`,"initializationOptions":{"profileId":"pod"}}`)
		if rpcCode(out) != 0 {
			t.Fatal(out)
		}
		rpcNotify(s, "initialized", `{}`)
		for _, method := range []string{"$/ignored", "unknownNotification", "textDocument/didChange"} {
			data := []byte(`{"jsonrpc":"2.0","method":"` + method + `","params":[]}`)
			if got := s.dispatch(context.Background(), data); len(got) != 0 {
				t.Fatalf("notification produced response: %s", got)
			}
		}
		openDocument(s, "file:///snippet", "has", 1)
		out = rpcCall(t, s, "textDocument/completion", `{"textDocument":{"uri":"file:///snippet"},"position":{"line":0,"character":3}}`)
		var result struct {
			Items []struct {
				Label  string `json:"label"`
				Format int    `json:"insertTextFormat"`
				Edit   struct {
					Text string `json:"newText"`
				} `json:"textEdit"`
			} `json:"items"`
		}
		if err := json.Unmarshal(out["result"], &result); err != nil {
			t.Fatal(err)
		}
		found := false
		for _, item := range result.Items {
			if item.Label == "has" {
				found = true
				if support {
					if item.Format != 2 || item.Edit.Text != "has(${1:resource})" {
						t.Fatalf("snippet: %+v", item)
					}
				} else if item.Format != 1 || item.Edit.Text != "has(resource)" {
					t.Fatalf("plain text: %+v", item)
				}
			}
		}
		if !found {
			t.Fatal("missing real has completion")
		}
	}
	var invalid map[string]json.RawMessage
	json.Unmarshal(newLSPSession(testService(t)).dispatch(context.Background(), []byte(`{"jsonrpc":"1.0","id":{},"method":"x"}`)), &invalid)
	if rpcCode(invalid) != -32600 || string(invalid["id"]) != "null" {
		t.Fatalf("invalid envelope response: %s", invalid)
	}
}

func TestLSPHTTPNotificationNeverReturnsRPCResponse(t *testing.T) {
	h := testService(t).Handler()
	for _, body := range []string{`{"jsonrpc":"2.0","method":"$/ignored","params":[]}`, `{"jsonrpc":"2.0","method":"initialized","params":{}}`} {
		w := httptest.NewRecorder()
		r := httptest.NewRequest(http.MethodPost, "/lsp", strings.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		h.ServeHTTP(w, r)
		if w.Code != 204 || w.Body.Len() != 0 {
			t.Fatalf("notification response: %d %s", w.Code, w.Body)
		}
	}
}
