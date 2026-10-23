package main

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

const lspSessionHeader = "X-CEL-LSP-Session"
const lspMaxSessions = 64
const lspSessionIdle = 30 * time.Minute

type httpLSPSession struct {
	session  *lspSession
	timer    *time.Timer
	lastUsed time.Time
}
type lspHTTP struct {
	mu       sync.Mutex
	service  *Service
	sessions map[string]*httpLSPSession
}

func newLSPHTTP(s *Service) *lspHTTP {
	return &lspHTTP{service: s, sessions: make(map[string]*httpLSPSession)}
}
func (h *lspHTTP) remove(token string, entry *httpLSPSession) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.sessions[token] != entry {
		return
	}
	delete(h.sessions, token)
	entry.timer.Stop()
	entry.session.close()
}
func (h *lspHTTP) expire(token string, entry *httpLSPSession) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.sessions[token] != entry {
		return
	}
	if remaining := time.Until(entry.lastUsed.Add(lspSessionIdle)); remaining > 0 {
		entry.timer.Reset(remaining)
		return
	}
	delete(h.sessions, token)
	entry.session.close()
}
func (h *lspHTTP) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", 405)
		return
	}
	media, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || media != "application/json" {
		http.Error(w, "application/json required", 415)
		return
	}
	body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, lspMaxMessage))
	if err != nil {
		http.Error(w, "JSON-RPC message exceeds 32 KiB", 413)
		return
	}
	token := r.Header.Get(lspSessionHeader)
	h.mu.Lock()
	var entry *httpLSPSession
	if token != "" {
		entry = h.sessions[token]
		if entry == nil {
			h.mu.Unlock()
			http.Error(w, "unknown or expired LSP session", 404)
			return
		}
		entry.lastUsed = time.Now()
		entry.timer.Reset(lspSessionIdle)
	} else {
		m, code := parseRPC(body)
		if (code == 0 || code == -32602) && len(m.ID) == 0 {
			h.mu.Unlock()
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if code != 0 {
			h.mu.Unlock()
			w.Write(rpcFailure(m.ID, code, "Invalid JSON-RPC request"))
			return
		}
		if m.Method != "initialize" {
			h.mu.Unlock()
			w.Write(rpcFailure(m.ID, -32002, "Initialize without a session header first"))
			return
		}
		if len(h.sessions) >= lspMaxSessions {
			h.mu.Unlock()
			http.Error(w, "development session limit", 429)
			return
		}
		var bytes [24]byte
		if _, err = rand.Read(bytes[:]); err != nil {
			h.mu.Unlock()
			http.Error(w, "session creation failed", 500)
			return
		}
		token = hex.EncodeToString(bytes[:])
		entry = &httpLSPSession{session: newLSPSession(h.service), lastUsed: time.Now()}
		entry.timer = time.AfterFunc(lspSessionIdle, func() { h.expire(token, entry) })
		h.sessions[token] = entry
	}
	h.mu.Unlock()
	response := entry.session.dispatch(r.Context(), body)
	entry.session.mu.Lock()
	exited, initialized := entry.session.exited, entry.session.initialized
	entry.session.mu.Unlock()
	if exited || !initialized {
		h.remove(token, entry)
	} else {
		w.Header().Set(lspSessionHeader, token)
	}
	if len(response) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.Write(response)
}

type frameReader struct{ reader *bufio.Reader }

func newFrameReader(r io.Reader) *frameReader { return &frameReader{bufio.NewReaderSize(r, 8192)} }
func (r *frameReader) read() ([]byte, error) {
	length := -1
	total := 0
	for {
		line, err := r.reader.ReadSlice('\n')
		if err != nil {
			if err == io.EOF && total == 0 && len(line) == 0 {
				return nil, io.EOF
			}
			return nil, fmt.Errorf("incomplete or oversized LSP headers: %w", err)
		}
		total += len(line)
		if total > 8192 {
			return nil, fmt.Errorf("LSP headers exceed 8 KiB")
		}
		if len(line) < 2 || line[len(line)-2] != '\r' {
			return nil, fmt.Errorf("LSP headers require CRLF")
		}
		line = line[:len(line)-2]
		if len(line) == 0 {
			break
		}
		name, value, ok := strings.Cut(string(line), ":")
		if !ok {
			return nil, fmt.Errorf("invalid LSP header")
		}
		switch strings.ToLower(name) {
		case "content-length":
			if length >= 0 {
				return nil, fmt.Errorf("duplicate Content-Length")
			}
			n, err := strconv.Atoi(strings.TrimSpace(value))
			if err != nil || n <= 0 || n > lspMaxMessage {
				return nil, fmt.Errorf("Content-Length must be 1..32768")
			}
			length = n
		case "content-type":
			media, params, err := mime.ParseMediaType(strings.TrimSpace(value))
			if err != nil || media != "application/vscode-jsonrpc" || (params["charset"] != "" && !strings.EqualFold(params["charset"], "utf-8") && !strings.EqualFold(params["charset"], "utf8")) {
				return nil, fmt.Errorf("LSP Content-Type must use UTF8 JSON-RPC")
			}
		}
	}
	if length < 0 {
		return nil, fmt.Errorf("Content-Length required")
	}
	data := make([]byte, length)
	_, err := io.ReadFull(r.reader, data)
	return data, err
}
func semanticMethod(method string) bool {
	switch method {
	case "textDocument/completion", "textDocument/hover", "textDocument/signatureHelp", "textDocument/diagnostic":
		return true
	}
	return false
}

func serveStdio(ctx context.Context, service *Service, input io.Reader, output io.Writer) error {
	session := newLSPSession(service)
	defer session.close()
	reader := newFrameReader(input)
	var writers sync.Mutex
	var tasks sync.WaitGroup
	workers := make(chan struct{}, lspMaxPending)
	var writeError error
	emit := func(data []byte) {
		if len(data) == 0 {
			return
		}
		writers.Lock()
		defer writers.Unlock()
		if writeError != nil {
			return
		}
		_, writeError = fmt.Fprintf(output, "Content-Length: %d\r\n\r\n%s", len(data), data)
	}
	defer tasks.Wait()
	for {
		data, err := reader.read()
		if err != nil {
			session.close()
			tasks.Wait()
			if err == io.EOF {
				return writeError
			}
			return err
		}
		work := session.prepare(ctx, data)
		if semanticMethod(rpcMethod(data)) {
			select {
			case workers <- struct{}{}:
				tasks.Add(1)
				go func() { defer tasks.Done(); defer func() { <-workers }(); emit(work()) }()
			default:
				emit(work())
			}
		} else {
			emit(work())
		}
		session.mu.Lock()
		exited, shutdown := session.exited, session.shutdown
		session.mu.Unlock()
		if exited {
			tasks.Wait()
			if writeError != nil {
				return writeError
			}
			if !shutdown {
				return fmt.Errorf("exit before shutdown")
			}
			return nil
		}
	}
}

// Keep method extraction independent of session state; malformed requests still
// receive their ordinary JSON-RPC error through prepare.
func rpcMethod(data []byte) string { var m rpcMessage; json.Unmarshal(data, &m); return m.Method }
