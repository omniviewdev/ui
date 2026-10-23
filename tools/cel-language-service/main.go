package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"mime"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"
	"unicode/utf8"
)

func loopbackHost(host string) bool {
	return host == "127.0.0.1" || host == "localhost" || host == "::1"
}
func (s *Service) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/lsp", newLSPHTTP(s))
	mux.HandleFunc("/profiles", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "GET required", 405)
			return
		}
		json.NewEncoder(w).Encode(struct {
			Profiles []ProfileInfo `json:"profiles"`
			Engine   string        `json:"engine"`
			Limits   []string      `json:"limits"`
		}{s.catalog.infos(), "cel.dev/cel-go v0.32.0 (Apache-2.0, unmodified)", []string{"32 KiB JSON request; 8192 UTF8 document bytes; parse recursion 64; 4 concurrent requests; 1 second request deadline; 200 ms evaluation deadline; 10000 CEL runtime cost; 100 completions; fixture-only complete representations", numericProfile}})
	})
	routes := map[string]func(context.Context, Request) Response{"/evaluate": s.Evaluate}
	for path, operation := range routes {
		mux.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodPost {
				http.Error(w, "POST required", http.StatusMethodNotAllowed)
				return
			}
			contentType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
			if err != nil || contentType != "application/json" {
				http.Error(w, "application/json required", http.StatusUnsupportedMediaType)
				return
			}
			select {
			case s.slots <- struct{}{}:
				defer func() { <-s.slots }()
			default:
				http.Error(w, "development service concurrency limit", http.StatusTooManyRequests)
				return
			}
			r.Body = http.MaxBytesReader(w, r.Body, 32768)
			req, err := decodeRequest(r.Body)
			if err != nil {
				http.Error(w, "invalid bounded JSON: "+err.Error(), http.StatusBadRequest)
				return
			}
			ctx, cancel := context.WithTimeout(r.Context(), time.Second)
			defer cancel()
			json.NewEncoder(w).Encode(operation(ctx, req))
		})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		if origin := r.Header.Get("Origin"); origin != "" {
			u, err := url.Parse(origin)
			if err != nil || (u.Scheme != "http" && u.Scheme != "https") || !loopbackHost(u.Hostname()) || u.User != nil || u.Path != "" || u.RawQuery != "" || u.Fragment != "" {
				http.Error(w, "only loopback browser origins permitted", http.StatusForbidden)
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, "+lspSessionHeader)
			w.Header().Set("Access-Control-Expose-Headers", lspSessionHeader)
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		mux.ServeHTTP(w, r)
	})
}

// Pointer fields distinguish a required JSON value from encoding/json's zero
// defaults. In particular, a supplied null binding map never means "use defaults".
func decodeRequest(body io.Reader) (Request, error) {
	data, err := io.ReadAll(body)
	if err != nil {
		return Request{}, err
	}
	if !utf8.Valid(data) {
		return Request{}, fmt.Errorf("JSON must be valid UTF8")
	}
	type wireDocument struct {
		Text    *string `json:"text"`
		Version *int    `json:"version"`
	}
	type wireCursor struct {
		Offset *int    `json:"offset"`
		Unit   *string `json:"unit"`
	}
	type wireRequest struct {
		Document       *wireDocument   `json:"document"`
		Cursor         *wireCursor     `json:"cursor"`
		ContextKey     *string         `json:"contextKey"`
		FixtureProfile *string         `json:"fixtureProfile"`
		Bindings       json.RawMessage `json:"bindings"`
	}
	var wire *wireRequest
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.DisallowUnknownFields()
	if err = decoder.Decode(&wire); err != nil {
		return Request{}, err
	}
	if err = decoder.Decode(&struct{}{}); err != io.EOF {
		return Request{}, fmt.Errorf("exactly one JSON request required")
	}
	if wire == nil || wire.Document == nil || wire.Document.Text == nil || wire.Document.Version == nil || wire.Cursor == nil || wire.Cursor.Offset == nil || wire.Cursor.Unit == nil || wire.ContextKey == nil || wire.FixtureProfile == nil {
		return Request{}, fmt.Errorf("document, cursor, contextKey and fixtureProfile require all declared fields")
	}
	req := Request{Document: Document{*wire.Document.Text, *wire.Document.Version}, Cursor: Cursor{*wire.Cursor.Offset, *wire.Cursor.Unit}, ContextKey: *wire.ContextKey, FixtureProfile: *wire.FixtureProfile}
	if wire.Bindings != nil {
		var bindings map[string]struct {
			Kind  *string `json:"kind"`
			Value *string `json:"value"`
		}
		decoder = json.NewDecoder(bytes.NewReader(wire.Bindings))
		decoder.DisallowUnknownFields()
		if err = decoder.Decode(&bindings); err != nil {
			return Request{}, err
		}
		if bindings == nil {
			return Request{}, fmt.Errorf("supplied bindings must be an object")
		}
		req.Bindings = make(map[string]BoundValue, len(bindings))
		for name, value := range bindings {
			if value.Kind == nil || value.Value == nil {
				return Request{}, fmt.Errorf("binding %s requires string kind and value", name)
			}
			req.Bindings[name] = BoundValue{*value.Kind, *value.Value}
		}
	}
	return req, nil
}
func main() {
	address := flag.String("listen", "127.0.0.1:6130", "Loopback development listener")
	stdio := flag.Bool("stdio", false, "Serve LSP Content-Length frames on stdin/stdout instead of HTTP")
	flag.Parse()
	host, _, err := net.SplitHostPort(*address)
	if err != nil || (!loopbackHost(host) || host == "localhost") {
		log.Fatal("listen must use an explicit loopback IP address")
	}
	s, err := NewService()
	if err != nil {
		log.Fatal(err)
	}
	if *stdio {
		if err := serveStdio(context.Background(), s, os.Stdin, os.Stdout); err != nil {
			log.Fatal(err)
		}
		return
	}
	listener, err := net.Listen("tcp", *address)
	if err != nil {
		log.Fatal(err)
	}
	server := &http.Server{Handler: s.Handler(), ReadHeaderTimeout: 2 * time.Second, ReadTimeout: 3 * time.Second, WriteTimeout: 3 * time.Second, IdleTimeout: 30 * time.Second, MaxHeaderBytes: 8192}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		server.Shutdown(shutdown)
	}()
	fmt.Printf("CEL development service ready http://%s (fixture-only; integer-only; not production host integration)\n", listener.Addr())
	if err = server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
