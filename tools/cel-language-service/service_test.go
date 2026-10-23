package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func testService(t *testing.T) *Service {
	t.Helper()
	s, err := NewService()
	if err != nil {
		t.Fatal(err)
	}
	return s
}
func request(text, profile string) Request {
	return Request{Document: Document{Text: text, Version: 7}, Cursor: Cursor{Offset: len(text), Unit: "utf8-byte"}, ContextKey: "test-context", FixtureProfile: profile}
}
func labels(r Response) []string {
	out := []string{}
	for _, c := range r.Completions {
		out = append(out, c.Label)
	}
	return out
}
func contains(xs []string, s string) bool {
	for _, x := range xs {
		if x == s {
			return true
		}
	}
	return false
}

// Catches canned evaluations, loss of same-container correlation, and profile-specific evaluator branches.
func TestRealFixtureEvaluation(t *testing.T) {
	s := testService(t)
	cases := []struct {
		profile, expression string
		want                []bool
	}{
		{"pod", `resource.status.phase == "Running"`, []bool{true, false, true}},
		{"pod", `resource.metadata.labels["app.kubernetes.io/name"] == "frontend"`, []bool{true, false, false}},
		{"pod", `resource.spec.containers.exists(c, c.name == "web" && c.image.startsWith(imagePrefix))`, []bool{true, false, false}},
		{"pod", `resource.spec.containers.exists(c, c.name == "web" && c.ports.exists(p, p.name == "metrics" && p.containerPort == 9090))`, []bool{false, false, false}},
		{"pod", `has(resource.status.podIP)`, []bool{true, false, true}},
		{"pod", `resource.spec.containers.exists(c, c.resources.requests["cpu"] == "500m")`, []bool{true, false, false}},
		{"pod", `resource.spec.containers.exists(c, c.ports.exists(p, p.containerPort >= minimumPort))`, []bool{true, false, false}},
		{"pod", `resource.status.conditions.exists(c, c.type == "Ready" && c.status == "True")`, []bool{true, false, true}},
		{"cloud", `resource.cpuCount >= minimumCpu && resource.tags.exists(t, t.key == "env" && t.value == "prod")`, []bool{true, false}},
		{"vm", `resource.hardware.cpu >= minimumCpu && resource.powerState == "running"`, []bool{true, false}},
		{"cloud", `resource.generation == 9007199254740993`, []bool{true, false}},
	}
	for _, tc := range cases {
		t.Run(tc.profile+tc.expression, func(t *testing.T) {
			r := s.Evaluate(context.Background(), request(tc.expression, tc.profile))
			if r.Status != "ready" {
				t.Fatalf("%s: %+v", r.Status, r)
			}
			if len(r.Results) != len(tc.want) {
				t.Fatalf("results %+v", r.Results)
			}
			for i, w := range tc.want {
				if r.Results[i].Error != "" || r.Results[i].Matched == nil || *r.Results[i].Matched != w {
					t.Fatalf("row %d want %v: %+v", i, w, r.Results[i])
				}
			}
		})
	}
}

// Catches accepting invalid overloads, absent fields as false, and upstream unsafe mixed doubles.
func TestCheckingAndExplicitNumericProfile(t *testing.T) {
	s := testService(t)
	for _, expr := range []string{`resource.spec.containers.exists(c, c.image.startsWith(12))`, `resource.notAField == 1`, `1.0 == dyn(1)`, `double(resource.metadata.generation) > 0.0`, `resource.metadata.generation`, `resource.spec.containers.exists(c, c.cpuRequestMilli > 0)`, `resource.status.ready`} {
		r := s.Check(context.Background(), request(expr, "pod"))
		if len(r.Diagnostics) == 0 {
			t.Errorf("accepted %s", expr)
		}
	}
	r := s.Evaluate(context.Background(), request(`resource.status.podIP == "10.0.0.1"`, "pod"))
	if r.Results[1].Error == "" {
		t.Fatal("absent field became a nonmatch")
	}
}

// Catches fixed suggestion lists, wrong receiver types, lost map-key escaping, and leaked macro locals.
func TestContextualCompletions(t *testing.T) {
	s := testService(t)
	cases := []struct{ text, profile, want, not string }{
		{"cccc", "pod", "", "minimumCpu"}, {"cp", "pod", "minimumCpu", "desiredPhase"},
		{"resource.spec.containers", "pod", "", "minimumCpu"},
		{"resource.spec.containers[0].im", "pod", "image", "cpuCount"},
		{"resource.status.", "pod", "phase", "minimumCpu"},
		{"resource.status.phase.st", "pod", "startsWith", "minimumCpu"},
		{"resource.metadata.generation.", "pod", "", "startsWith"},
		{`resource.metadata.labels["app`, "pod", "app.kubernetes.io/name", "minimumCpu"},
		{`resource.metadata.labels["quo`, "pod", `quote"key`, "minimumCpu"},
		{`resource.status.phase == "Run`, "pod", "Running", "minimumCpu"},
		{"resource.spec.containers.exists(c, c.im", "pod", "image", "phase"},
		{"resource.spec.containers.exists(c, c.ports.exists(p, p.cont", "pod", "containerPort", "image"},
		{"resource.spec.containers.exists(c, true) && c.", "pod", "", "image"},
		{"resource.hardware.", "vm", "cpu", "phase"},
	}
	for _, tc := range cases {
		t.Run(tc.text, func(t *testing.T) {
			r := s.Complete(context.Background(), request(tc.text, tc.profile))
			got := labels(r)
			if tc.want != "" && !contains(got, tc.want) {
				t.Errorf("want %s in %v", tc.want, got)
			}
			if tc.not != "" && contains(got, tc.not) {
				t.Errorf("unexpected %s in %v", tc.not, got)
			}
			for _, c := range r.Completions {
				if c.Edit.Range.Start < 0 || c.Edit.Range.End > len(tc.text) {
					t.Fatal("invalid replacement range")
				}
			}
		})
	}
	r := s.Complete(context.Background(), request(`"🦀" == "🦀" && resource.st`, "pod"))
	for _, c := range r.Completions {
		if c.Label == "status" && c.Edit.Range.Start != len(`"🦀" == "🦀" && resource.`) {
			t.Fatal("not UTF8 offsets")
		}
	}
}

func TestHoverAndSignatureUseRealDeclarations(t *testing.T) {
	s := testService(t)
	r := s.Hover(context.Background(), request("resource.status.phase", "pod"))
	if r.Hover == nil || !strings.Contains(r.Hover.Contents, "string") {
		t.Fatalf("hover %+v", r)
	}
	q := s.Signature(context.Background(), request(`resource.status.phase.startsWith(`, "pod"))
	if q.Signature == nil || !strings.Contains(q.Signature.Label, "string") {
		t.Fatalf("signature %+v", q)
	}
}

// Catches unbounded bodies, invalid cursor boundaries, ignored cancellation, and permissive HTTP decoding.
func TestBoundsAndHTTP(t *testing.T) {
	s := testService(t)
	canceled, cancel := context.WithCancel(context.Background())
	cancel()
	if r := s.Evaluate(canceled, request("true", "pod")); r.Status != "error" {
		t.Fatalf("ignored cancellation %+v", r)
	}
	for _, r := range []Request{request(strings.Repeat("x", 8193), "pod"), request("true", "missing"), {Document: Document{Text: "🦀"}, Cursor: Cursor{Offset: 1, Unit: "utf8-byte"}, FixtureProfile: "pod"}} {
		if got := s.Check(context.Background(), r); got.Status != "error" {
			t.Fatalf("accepted invalid request %+v", r)
		}
	}
	handler := s.Handler()
	for _, body := range []string{`{"fixtureProfile":"pod","unknown":true}`, strings.Repeat("x", 40000), `{} {}`} {
		w := httptest.NewRecorder()
		r := httptest.NewRequest(http.MethodPost, "/evaluate", strings.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		handler.ServeHTTP(w, r)
		if w.Code != 400 {
			t.Errorf("accepted malformed body %d", w.Code)
		}
	}
	payload, _ := json.Marshal(request("true", "pod"))
	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/evaluate", strings.NewReader(string(payload)))
	r.Header.Set("Content-Type", "application/json")
	handler.ServeHTTP(w, r)
	if w.Code != 200 || !strings.Contains(w.Body.String(), `"matched":true`) {
		t.Fatalf("HTTP %d %s", w.Code, w.Body.String())
	}
	w = httptest.NewRecorder()
	handler.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/profiles", nil))
	if w.Code != 200 || !strings.Contains(w.Body.String(), "pod-web") {
		t.Fatal(w.Body.String())
	}
}

func TestBindingAdmissionAndRuntimeCost(t *testing.T) {
	s := testService(t)
	r := request(`resource.generation == minimumCpu`, "cloud")
	r.Bindings = map[string]BoundValue{"minimumCpu": {"int64", "9007199254740993"}, "minimumPort": {"int64", "1000"}, "imagePrefix": {"string", "nginx:"}, "desiredPhase": {"string", "Running"}}
	out := s.Evaluate(context.Background(), r)
	if len(out.Results) != 2 || out.Results[0].Matched == nil || !*out.Results[0].Matched || out.Results[1].Matched == nil || *out.Results[1].Matched {
		t.Fatalf("exact bindings %+v", out)
	}
	for _, bad := range []string{"9007199254740993.0", "9223372036854775808", "01", "-0", "1e3"} {
		r.Bindings["minimumCpu"] = BoundValue{"int64", bad}
		if got := s.Evaluate(context.Background(), r); got.Status != "error" {
			t.Errorf("accepted %s", bad)
		}
	}
	expensive := `[1,2,3,4,5,6,7,8,9,10].all(a, [1,2,3,4,5,6,7,8,9,10].all(b, [1,2,3,4,5,6,7,8,9,10].all(c, [1,2,3,4,5,6,7,8,9,10].all(d, a+b+c+d > 0))))`
	out = s.Evaluate(context.Background(), request(expensive, "pod"))
	if len(out.Results) == 0 || !strings.Contains(out.Results[0].Error, "cost limit") {
		t.Fatalf("cost not enforced %+v", out)
	}
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/profiles", nil)
	req.Header.Set("Origin", "https://attacker.example")
	s.Handler().ServeHTTP(w, req)
	if w.Code != 403 {
		t.Fatal("non-loopback browser origin accepted")
	}
}

// Catches accidental success on a supplied null/partial binding map and lossy bool/int decoding.
func TestBindingsAreExactDeclarations(t *testing.T) {
	s := testService(t)
	r := request("true", "pod")
	for _, bindings := range []map[string]BoundValue{
		{},
		{"minimumCpu": {"int64", "4"}},
		{"minimumCpu": {"int64", "4"}, "minimumPort": {"int64", "1000"}, "imagePrefix": {"string", "nginx:"}, "extra": {"string", "Running"}},
	} {
		r.Bindings = bindings
		if out := s.Evaluate(context.Background(), r); out.Status != "error" {
			t.Fatalf("accepted bindings: %+v", bindings)
		}
	}
	p := &Profile{Info: ProfileInfo{Parameters: []Parameter{{Name: "enabled", Type: "bool"}}}}
	for _, value := range []string{"TRUE", "1", "", " true"} {
		if _, err := validateBindings(p, Request{Bindings: map[string]BoundValue{"enabled": {"bool", value}}}); err == nil {
			t.Fatalf("accepted bool %q", value)
		}
	}
	for _, value := range []string{"true", "false"} {
		got, err := validateBindings(p, Request{Bindings: map[string]BoundValue{"enabled": {"bool", value}}})
		if err != nil || got["enabled"] != (value == "true") {
			t.Fatalf("canonical bool %q: %v %v", value, got, err)
		}
	}
}

// Catches JSON null/default coercion, unknown nested fields and non-JSON browser requests.
func TestStrictRequestJSON(t *testing.T) {
	handler := testService(t).Handler()
	for _, body := range []string{
		`null`,
		`{"document":null,"cursor":{"offset":0,"unit":"utf8-byte"},"contextKey":"x","fixtureProfile":"pod"}`,
		`{"document":{"text":"true"},"cursor":{"offset":4,"unit":"utf8-byte"},"contextKey":"x","fixtureProfile":"pod"}`,
		`{"document":{"text":"true","version":1,"extra":0},"cursor":{"offset":4,"unit":"utf8-byte"},"contextKey":"x","fixtureProfile":"pod"}`,
		`{"document":{"text":"true","version":1},"cursor":{"offset":4,"unit":"utf8-byte"},"contextKey":"x","fixtureProfile":"pod","bindings":null}`,
	} {
		w := httptest.NewRecorder()
		r := httptest.NewRequest(http.MethodPost, "/evaluate", strings.NewReader(body))
		r.Header.Set("Content-Type", "application/json")
		handler.ServeHTTP(w, r)
		if w.Code != http.StatusBadRequest {
			t.Errorf("accepted malformed JSON %s: %d %s", body, w.Code, w.Body.String())
		}
	}
	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/evaluate", strings.NewReader(`{}`))
	r.Header.Set("Content-Type", "text/plain")
	handler.ServeHTTP(w, r)
	if w.Code != http.StatusUnsupportedMediaType {
		t.Fatalf("accepted non-JSON request: %d", w.Code)
	}
}

// Catches root/local shadow conflicts, comments masquerading as member syntax, and split keyword operators.
func TestCompletionScopeAndSourceBoundaries(t *testing.T) {
	s := testService(t)
	for _, tc := range []struct{ text, want string }{
		{`resource.spec.containers.exists(c, c.ports.exists(c, c.cont`, "containerPort"},
		{`resource.spec.containers.exists(resource, resource.im`, "image"},
		{"resource.spec.containers.exists(c, // ) .\n c.im", "image"},
		{`("env" in resource.metadata.labels ? resource.status.phase : "Pending").st`, "startsWith"},
	} {
		got := s.Complete(context.Background(), request(tc.text, "pod"))
		if !contains(labels(got), tc.want) {
			t.Errorf("%s: want %s, got %+v", tc.text, tc.want, got)
		}
	}
	r := request(`resource.spec.containers[0].image`, "pod")
	r.Cursor.Offset = len(`resource.spec.containers[0].im`)
	out := s.Complete(context.Background(), r)
	for _, c := range out.Completions {
		if c.Label == "image" && (c.Edit.Range.Start != len(`resource.spec.containers[0].`) || c.Edit.Range.End != len(r.Document.Text)) {
			t.Fatalf("did not replace whole identifier: %+v", c)
		}
	}
}

func TestEveryPublishedExampleEvaluates(t *testing.T) {
	s := testService(t)
	for _, profile := range s.catalog.infos() {
		for _, example := range profile.Examples {
			out := s.Evaluate(context.Background(), request(example.Expression, profile.ID))
			if out.Status != "ready" || len(out.Results) != len(profile.Fixtures) {
				t.Fatalf("%s/%s: %+v", profile.ID, example.ID, out)
			}
			for _, row := range out.Results {
				if row.Error != "" || row.Matched == nil {
					t.Errorf("%s/%s: %+v", profile.ID, example.ID, row)
				}
			}
		}
	}
}

func TestObservedStringEditsReplaceSuffixAndPreserveEscaping(t *testing.T) {
	s := testService(t)
	for _, tc := range []struct {
		text            string
		cursor          int
		label, expected string
	}{
		{`resource.status.phase == "Running"`, len(`resource.status.phase == "Run`), "Running", `resource.status.phase == "Running"`},
		{`resource.status.phase == "Run`, len(`resource.status.phase == "Run`), "Running", `resource.status.phase == "Running"`},
		{`resource.status.phase == "Running`, len(`resource.status.phase == "Run`), "Running", `resource.status.phase == "Running"`},
		{"resource.status.phase == \"Running\n && true", len(`resource.status.phase == "Run`), "Running", "resource.status.phase == \"Running\"\n && true"},
		{`resource.metadata.labels["quo"] == "safe"`, len(`resource.metadata.labels["quo`), `quote"key`, `resource.metadata.labels["quote\"key"] == "safe"`},
	} {
		r := request(tc.text, "pod")
		r.Cursor.Offset = tc.cursor
		found := false
		for _, c := range s.Complete(context.Background(), r).Completions {
			if c.Label != tc.label {
				continue
			}
			found = true
			result := tc.text[:c.Edit.Range.Start] + c.Edit.Text + tc.text[c.Edit.Range.End:]
			if result != tc.expected {
				t.Errorf("got edit %s, want %s", result, tc.expected)
			}
			if checked := s.Check(context.Background(), request(result, "pod")); checked.Status != "ready" {
				t.Errorf("edit produced invalid CEL: %+v", checked)
			}
		}
		if !found {
			t.Fatalf("missing observed %s for %s", tc.label, tc.text)
		}
	}
}

// Catches decoded labels being used as raw-source filters, including equivalent escape spellings.
func TestObservedFilterTextPreservesEscapedSourcePrefix(t *testing.T) {
	s := testService(t)
	for _, tc := range []struct{ text, prefix, filter, expected string }{
		{`resource.metadata.labels["quote\""] == "safe"`, `resource.metadata.labels["quote\"`, `quote\"key`, `resource.metadata.labels["quote\"key"] == "safe"`},
		{`resource.metadata.labels["quote\u0022"] == "safe"`, `resource.metadata.labels["quote\u0022`, `quote\u0022key`, `resource.metadata.labels["quote\"key"] == "safe"`},
		{`resource.metadata.labels['quote"'] == 'safe'`, `resource.metadata.labels['quote"`, `quote"key`, `resource.metadata.labels['quote"key'] == 'safe'`},
		{`resource.metadata.labels['quote\"'] == 'safe'`, `resource.metadata.labels['quote\"`, `quote\"key`, `resource.metadata.labels['quote"key'] == 'safe'`},
	} {
		r := request(tc.text, "pod")
		r.Cursor.Offset = len(tc.prefix)
		out := s.Complete(context.Background(), r)
		found := false
		for _, candidate := range out.Completions {
			if candidate.Label != `quote"key` {
				continue
			}
			found = true
			if candidate.FilterText != tc.filter {
				t.Errorf("filter %q want %q", candidate.FilterText, tc.filter)
			}
			rawPrefix := tc.text[candidate.Edit.Range.Start:r.Cursor.Offset]
			if !strings.HasPrefix(candidate.FilterText, rawPrefix) {
				t.Errorf("filter %q does not preserve raw prefix %q", candidate.FilterText, rawPrefix)
			}
			edited := tc.text[:candidate.Edit.Range.Start] + candidate.Edit.Text + tc.text[candidate.Edit.Range.End:]
			if edited != tc.expected {
				t.Errorf("edit %s want %s", edited, tc.expected)
			}
			if checked := s.Check(context.Background(), request(edited, "pod")); checked.Status != "ready" {
				t.Errorf("invalid escaped edit: %+v", checked)
			}
		}
		if !found {
			t.Fatalf("escaped completion missing: %s %+v", tc.prefix, out)
		}
	}
}

// Catches case-insensitive or subsequence matches losing their original escape spelling.
func TestObservedFuzzyFilterMatchesRawEscapedPrefix(t *testing.T) {
	s := testService(t)
	for _, prefix := range []string{`Quote\u0022`, `Q\u0022`, `Q\"`, `q\u0022k`} {
		text := `resource.metadata.labels["` + prefix + `"] == "safe"`
		r := request(text, "pod")
		r.Cursor.Offset = len(`resource.metadata.labels["`) + len(prefix)
		out := s.Complete(context.Background(), r)
		found := false
		for _, candidate := range out.Completions {
			if candidate.Label != `quote"key` {
				continue
			}
			found = true
			if !strings.HasPrefix(candidate.FilterText, prefix) {
				t.Errorf("host-admitted filter %q cannot match raw prefix %q", candidate.FilterText, prefix)
			}
			edited := text[:candidate.Edit.Range.Start] + candidate.Edit.Text + text[candidate.Edit.Range.End:]
			if edited != `resource.metadata.labels["quote\"key"] == "safe"` {
				t.Errorf("fuzzy matching changed inserted value: %s", edited)
			}
			if checked := s.Check(context.Background(), request(edited, "pod")); checked.Status != "ready" {
				t.Errorf("invalid escaped edit: %+v", checked)
			}
		}
		if !found {
			t.Fatalf("missing fuzzy candidate for %s: %+v", prefix, out)
		}
	}
}

// Catches dropping the HTTP request context or allowing work above the advertised admission limit.
func TestHTTPContextAndConcurrentAdmission(t *testing.T) {
	s := testService(t)
	handler := s.Handler()
	payload, err := json.Marshal(request("true", "pod"))
	if err != nil {
		t.Fatal(err)
	}
	canceled, cancel := context.WithCancel(context.Background())
	cancel()
	r := httptest.NewRequest(http.MethodPost, "/evaluate", strings.NewReader(string(payload))).WithContext(canceled)
	r.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	var response Response
	if err = json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if response.Status != "error" || !strings.Contains(response.Message, "canceled") || len(response.Results) != 0 {
		t.Fatalf("HTTP cancellation ignored: %+v", response)
	}
	for range cap(s.slots) {
		s.slots <- struct{}{}
	}
	r = httptest.NewRequest(http.MethodPost, "/evaluate", strings.NewReader(string(payload)))
	r.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("concurrency not bounded: %d", w.Code)
	}
	for range cap(s.slots) {
		<-s.slots
	}
	r = httptest.NewRequest(http.MethodOptions, "/evaluate", nil)
	r.Header.Set("Origin", "http://127.0.0.1:6140")
	w = httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	if w.Code != http.StatusNoContent || w.Header().Get("Access-Control-Allow-Origin") != "http://127.0.0.1:6140" {
		t.Fatalf("loopback preflight: %d %v", w.Code, w.Header())
	}
}

// Catches omitted root fields, weak parameter matches outranking prefix fields,
// and shorthand edits that accidentally introduce undeclared bare CEL names.
func TestRootFieldsInsertQualifiedPaths(t *testing.T) {
	s := testService(t)
	root := s.Complete(context.Background(), request("cp", "cloud"))
	if len(root.Completions) < 2 || root.Completions[0].Label != "cpuCount" || !contains(labels(root), "minimumCpu") {
		t.Fatalf("root ranking: %+v", root)
	}
	field := root.Completions[0]
	if field.Kind != "field" || field.FilterText != "cpuCount" || field.Edit.Text != "resource.cpuCount" || field.Edit.Range != rng(0, 2) {
		t.Fatalf("invalid root edit: %+v", field)
	}
	if checked := s.Check(context.Background(), request(field.Edit.Text+" >= 4", "cloud")); checked.Status != "ready" {
		t.Fatalf("qualified edit not checked: %+v", checked)
	}
	if checked := s.Check(context.Background(), request("cpuCount >= 4", "cloud")); checked.Status != "error" {
		t.Fatal("bare field incorrectly declared as a variable")
	}
	for _, tc := range []struct{ text, label, path string }{
		{"me", "metadata", "resource.metadata"},
		{"sp", "spec", "resource.spec"},
		{"st", "status", "resource.status"},
	} {
		out := s.Complete(context.Background(), request(tc.text, "pod"))
		found := false
		for _, candidate := range out.Completions {
			if candidate.Label == tc.label {
				found = true
				if candidate.Edit.Text != tc.path || candidate.Edit.Range != rng(0, len(tc.text)) {
					t.Fatalf("invalid Pod root edit: %+v", candidate)
				}
			}
		}
		if !found {
			t.Fatalf("missing Pod root field %s: %+v", tc.label, out)
		}
	}
	for _, profile := range []string{"pod", "cloud", "vm"} {
		if out := s.Complete(context.Background(), request("cccc", profile)); len(out.Completions) != 0 {
			t.Fatalf("unrelated root completions: %+v", out)
		}
	}
	member := s.Complete(context.Background(), request("resource.cp", "cloud"))
	if len(member.Completions) == 0 || member.Completions[0].Label != "cpuCount" || member.Completions[0].Edit.Text != "cpuCount" || member.Completions[0].Edit.Range != rng(9, 11) {
		t.Fatalf("member edit changed: %+v", member)
	}
	shadowed := s.Complete(context.Background(), request("resource.tags.exists(resource, cp", "cloud"))
	for _, candidate := range shadowed.Completions {
		if candidate.Label == "cpuCount" {
			t.Fatalf("offered invalid shadowed resource path: %+v", candidate)
		}
	}
}
