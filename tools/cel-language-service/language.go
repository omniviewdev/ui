package main

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"unicode"
	"unicode/utf8"

	"cel.dev/cel-go/cel"
	"cel.dev/cel-go/common/decls"
	"cel.dev/cel-go/common/types"
	"google.golang.org/protobuf/reflect/protoreflect"
)

type token struct {
	text, kind string
	start, end int
	closed     bool
}

// This lexer locates incomplete edit spans only. All type inference, checking and evaluation use CEL.
func lex(text string) []token {
	out := []token{}
	for i := 0; i < len(text); {
		r, n := utf8.DecodeRuneInString(text[i:])
		if unicode.IsSpace(r) {
			i += n
			continue
		}
		if strings.HasPrefix(text[i:], "//") {
			for i < len(text) && text[i] != '\n' {
				i++
			}
			continue
		}
		start := i
		literal := i
		raw := false
		if text[literal] == 'b' || text[literal] == 'B' {
			literal++
		}
		if literal < len(text) && (text[literal] == 'r' || text[literal] == 'R') {
			raw = true
			literal++
		}
		if literal < len(text) && (text[literal] == '"' || text[literal] == '\'') {
			quote := text[literal : literal+1]
			if strings.HasPrefix(text[literal:], strings.Repeat(quote, 3)) {
				quote = strings.Repeat(quote, 3)
			}
			i = literal + len(quote)
			closed := false
			for i < len(text) {
				if len(quote) == 1 && (text[i] == '\n' || text[i] == '\r') {
					break
				}
				if !raw && text[i] == '\\' {
					i += min(2, len(text)-i)
					continue
				}
				if strings.HasPrefix(text[i:], quote) {
					i += len(quote)
					closed = true
					break
				}
				_, n = utf8.DecodeRuneInString(text[i:])
				i += n
			}
			out = append(out, token{text[start:i], "string", start, i, closed})
			continue
		}
		if unicode.IsLetter(r) || r == '_' {
			i += n
			for i < len(text) {
				r, n = utf8.DecodeRuneInString(text[i:])
				if !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '_' {
					break
				}
				i += n
			}
			out = append(out, token{text[start:i], "ident", start, i, true})
			continue
		}
		if unicode.IsDigit(r) {
			i += n
			for i < len(text) && ((text[i] >= '0' && text[i] <= '9') || strings.ContainsRune("abcdefABCDEFxXuU.eE", rune(text[i]))) {
				i++
			}
			out = append(out, token{text[start:i], "number", start, i, true})
			continue
		}
		i += n
		if i < len(text) && (text[start:i+1] == "&&" || text[start:i+1] == "||" || text[start:i+1] == "==" || text[start:i+1] == "!=" || text[start:i+1] == "<=" || text[start:i+1] == ">=") {
			i++
		}
		out = append(out, token{text[start:i], "punct", start, i, true})
	}
	return out
}
func source(ts []token) string {
	var b strings.Builder
	for i, t := range ts {
		if i > 0 {
			b.WriteByte(' ')
		}
		b.WriteString(t.text)
	}
	return b.String()
}
func receiver(ts []token) []token {
	depth := 0
	for i := len(ts) - 1; i >= 0; i-- {
		switch ts[i].text {
		case "]", ")", "}":
			depth++
		case "[", "(", "{":
			if depth == 0 {
				return ts[i+1:]
			}
			depth--
		case ",", "&&", "||", "==", "!=", "<=", ">=", "!", "<", ">", "+", "-", "*", "/", "%", "?", ":", "in":
			if depth == 0 {
				return ts[i+1:]
			}
		}
	}
	return ts
}
func infer(env *cel.Env, ts []token) *cel.Type {
	if len(ts) == 0 {
		return nil
	}
	a, iss := env.Compile(source(ts))
	if iss != nil && iss.Err() != nil {
		return nil
	}
	return a.OutputType()
}

// Rebuild declarations only when entering a macro scope, so shadowing has the
// same meaning as in CEL's checker rather than becoming overlapping globals.
func scopedEnvironment(p *Profile, locals map[string]*cel.Type) (*cel.Env, error) {
	opts := []cel.EnvOption{cel.CustomTypeProvider(p.Env.CELTypeProvider()), cel.CustomTypeAdapter(p.Env.CELTypeAdapter()), cel.ParserRecursionLimit(64), cel.ParserExpressionSizeLimit(8192), cel.CrossTypeNumericComparisons(false)}
	if _, shadowed := locals["resource"]; !shadowed {
		opts = append(opts, cel.Variable("resource", cel.ObjectType("omniview.dev."+p.Root)))
	}
	for _, param := range p.Info.Parameters {
		if _, shadowed := locals[param.Name]; !shadowed {
			opts = append(opts, cel.Variable(param.Name, parameterType(param.Type)))
		}
	}
	for _, name := range sortedKeys(locals) {
		opts = append(opts, cel.Variable(name, locals[name]))
	}
	return cel.NewEnv(opts...)
}
func scopeEnv(p *Profile, ts []token) (*cel.Env, map[string]*cel.Type) {
	env := p.Env
	locals := map[string]*cel.Type{}
	stack := []int{}
	for i, t := range ts {
		if t.text == "(" {
			stack = append(stack, i)
		} else if t.text == ")" && len(stack) > 0 {
			stack = stack[:len(stack)-1]
		}
	}
	for _, open := range stack {
		if open < 2 || ts[open-1].kind != "ident" || ts[open-2].text != "." {
			continue
		}
		name := ts[open-1].text
		if name != "exists" && name != "all" && name != "exists_one" && name != "map" && name != "filter" {
			continue
		}
		if len(ts) <= open+2 || ts[open+1].kind != "ident" || ts[open+2].text != "," {
			continue
		}
		typ := infer(env, receiver(ts[:open-2]))
		if typ == nil {
			continue
		}
		var elem *cel.Type
		switch typ.Kind() {
		case types.ListKind, types.MapKind:
			elem = typ.Parameters()[0]
		default:
			continue
		}
		local := ts[open+1].text
		previous, existed := locals[local]
		locals[local] = elem
		next, err := scopedEnvironment(p, locals)
		if err != nil {
			if existed {
				locals[local] = previous
			} else {
				delete(locals, local)
			}
			continue
		}
		env = next
	}
	return env, locals
}
func matchScore(name, prefix string) int {
	a, b := strings.ToLower(name), strings.ToLower(prefix)
	if b == "" {
		return 1
	}
	if strings.HasPrefix(a, b) {
		return 1000 - len(name)
	}
	j := 0
	for _, r := range a {
		if j < len(b) && r == rune(b[j]) {
			j++
		}
	}
	if j == len(b) {
		return 100 - len(name)
	}
	return -1
}
func fieldDocumentation(c *Catalog, typ *cel.Type, name string) string {
	d := c.Definitions[strings.TrimPrefix(typ.TypeName(), "omniview.dev.")]
	for _, f := range d.Fields {
		if f.Name == name {
			suffix := ""
			if f.Optional {
				suffix = " Optional: check has(...) before reading; absent is not null or false."
			}
			return f.Description + suffix
		}
	}
	return "Declared schema field."
}
func overloadMatches(o *decls.OverloadDecl, typ *cel.Type) bool {
	return o.IsMemberFunction() && len(o.ArgTypes()) > 0 && typ != nil && o.ArgTypes()[0].IsAssignableType(typ)
}
func functionSignature(name string, o *decls.OverloadDecl) *Signature {
	args := o.ArgTypes()
	receiver := ""
	if o.IsMemberFunction() {
		receiver = args[0].String() + "."
		args = args[1:]
	}
	ps := []SignatureParameter{}
	labels := []string{}
	for i, t := range args {
		label := fmt.Sprintf("arg%d: %s", i+1, t.String())
		ps = append(ps, SignatureParameter{Label: label})
		labels = append(labels, label)
	}
	return &Signature{Label: receiver + name + "(" + strings.Join(labels, ", ") + ") -> " + o.ResultType().String(), Parameters: ps, Documentation: "CEL standard-library overload " + o.ID() + ". Evaluated by the service, not the editor."}
}
func functionCandidate(name string, f *decls.FunctionDecl, o *decls.OverloadDecl, span Range) Completion {
	sig := functionSignature(name, o)
	doc := f.Description()
	if doc == "" {
		doc = sig.Documentation
	}
	insert := name + "()"
	format := "plain"
	if len(sig.Parameters) > 0 {
		insert = name + "(${1})"
		format = "snippet"
	}
	return Completion{ID: "function:" + name, Label: name, Kind: "function", Type: o.ResultType().String(), Description: doc, Detail: sig.Label, InsertTextFormat: format, Edit: Edit{span, insert}}
}
func (s *Service) fieldCandidates(env *cel.Env, typ *cel.Type, span Range) []Completion {
	out := []Completion{}
	if typ == nil || typ.Kind() != types.StructKind {
		return out
	}
	provider := env.CELTypeProvider()
	names, _ := provider.FindStructFieldNames(typ.TypeName())
	for _, name := range names {
		f, ok := provider.FindStructFieldType(typ.TypeName(), name)
		if !ok {
			continue
		}
		out = append(out, Completion{ID: "field:" + typ.TypeName() + "." + name, Label: name, Kind: "field", Type: f.Type.String(), Description: fieldDocumentation(s.catalog, typ, name), Edit: Edit{span, name}})
	}
	return out
}
func (s *Service) memberCandidates(env *cel.Env, typ *cel.Type, span Range) []Completion {
	out := s.fieldCandidates(env, typ, span)
	if typ == nil {
		return out
	}
	functions := env.Functions()
	for _, name := range sortedKeys(functions) {
		f := functions[name]
		if strings.HasPrefix(name, "_") || strings.Contains(name, "@") {
			continue
		}
		for _, o := range f.OverloadDecls() {
			if overloadMatches(o, typ) {
				out = append(out, functionCandidate(name, f, o, span))
				break
			}
		}
	}
	if typ.Kind() == types.ListKind || typ.Kind() == types.MapKind {
		seen := map[string]bool{}
		for _, macro := range env.Macros() {
			name := macro.Function()
			if !macro.IsReceiverStyle() || seen[name] {
				continue
			}
			seen[name] = true
			out = append(out, Completion{ID: "macro:" + name, Label: name, Kind: "function", Type: "CEL macro", Description: "CEL " + name + " macro. The first argument declares a local element variable (map keys for maps); the expression is checked in that scope.", Detail: name + "(variable, expression)", InsertTextFormat: "snippet", Edit: Edit{span, name + "(${1:item}, ${2:true})"}})
		}
	}
	return out
}
func decodeString(env *cel.Env, t token) string {
	if len(t.text) == 0 {
		return ""
	}
	raw := t.text
	if !t.closed {
		raw += raw[:1]
	}
	// CEL's own parser defines literal escapes; Go's strconv.Unquote differs
	// for single quotes and valid CEL escapes such as backslash-question-mark.
	literal, issues := env.Parse(raw)
	if issues != nil && issues.Err() != nil {
		return t.text[1:]
	}
	return literal.Expr().GetConstExpr().GetStringValue()
}

func stringSourceContent(value string, quote byte) string {
	escaped := strconv.Quote(value)
	content := escaped[1 : len(escaped)-1]
	if quote == '\'' {
		content = strings.ReplaceAll(content, `\"`, `"`)
		content = strings.ReplaceAll(content, "'", `\'`)
	}
	return content
}

// Observations traverse only the bounded admitted fixtures, not a user inventory.
func observed(p *Profile, ts []token) []protoreflect.Value {
	if len(ts) == 0 || ts[0].text != "resource" {
		return nil
	}
	values := []protoreflect.Value{}
	for _, f := range p.Fixtures {
		values = append(values, protoreflect.ValueOfMessage(f.Value.ProtoReflect()))
	}
	for i := 1; i < len(ts); {
		if ts[i].text == "." && i+1 < len(ts) {
			name := ts[i+1].text
			next := []protoreflect.Value{}
			for _, v := range values {
				m, ok := v.Interface().(protoreflect.Message)
				if !ok {
					continue
				}
				fd := m.Descriptor().Fields().ByName(protoreflect.Name(name))
				if fd != nil && (fd.IsMap() || fd.IsList() || m.Has(fd)) {
					next = append(next, m.Get(fd))
				}
			}
			values = next
			i += 2
			continue
		}
		if ts[i].text == "[" && i+2 < len(ts) && ts[i+2].text == "]" {
			next := []protoreflect.Value{}
			for _, v := range values {
				switch x := v.Interface().(type) {
				case protoreflect.Map:
					key := protoreflect.ValueOfString(decodeString(p.Env, ts[i+1])).MapKey()
					if x.Has(key) {
						next = append(next, x.Get(key))
					}
				case protoreflect.List:
					n, e := strconv.Atoi(ts[i+1].text)
					if e == nil && n >= 0 && n < x.Len() {
						next = append(next, x.Get(n))
					}
				}
			}
			values = next
			i += 3
			continue
		}
		return nil
	}
	return values
}
func (s *Service) Complete(ctx context.Context, r Request) Response {
	p, err := s.validate(ctx, r)
	if err != nil {
		return fail(r, err)
	}
	out := envelope(r)
	ts := lex(r.Document.Text[:r.Cursor.Offset])
	env, locals := scopeEnv(p, ts)
	start, end := r.Cursor.Offset, r.Cursor.Offset
	prefix := ""
	base := ts
	stringMode := false
	stringClosed := false
	var stringToken token
	if len(ts) > 0 {
		last := ts[len(ts)-1]
		if last.kind == "ident" && last.end == r.Cursor.Offset {
			prefix, start, base = last.text, last.start, ts[:len(ts)-1]
		} else if last.kind == "string" && last.end == r.Cursor.Offset && !last.closed {
			// Observed value edits are offered only inside ordinary string literals.
			// Raw, bytes and triple literals still pass unchanged to the CEL checker.
			if (last.text[0] != '"' && last.text[0] != '\'') || strings.HasPrefix(last.text, `"""`) || strings.HasPrefix(last.text, "'''") {
				out.Status = "empty"
				return out
			}
			stringMode, stringToken = true, last
			prefix, start, base = decodeString(env, last), last.start+1, ts[:len(ts)-1]
		}
	}
	if !stringMode {
		for end < len(r.Document.Text) {
			rune, size := utf8.DecodeRuneInString(r.Document.Text[end:])
			if !unicode.IsLetter(rune) && !unicode.IsDigit(rune) && rune != '_' {
				break
			}
			end += size
		}
	} else {
		remaining := lex(r.Document.Text[stringToken.start:])
		if len(remaining) > 0 {
			end = stringToken.start + remaining[0].end
			stringClosed = remaining[0].closed
			if stringClosed {
				end--
			}
		}
	}
	span := rng(start, end)
	candidates := []Completion{}
	if stringMode {
		observations := map[string]bool{}
		if len(base) > 0 && base[len(base)-1].text == "[" {
			for _, v := range observed(p, receiver(base[:len(base)-1])) {
				if m, ok := v.Interface().(protoreflect.Map); ok {
					m.Range(func(k protoreflect.MapKey, v protoreflect.Value) bool { observations[k.String()] = true; return true })
				}
			}
		} else if len(base) > 0 && (base[len(base)-1].text == "==" || base[len(base)-1].text == "!=") {
			for _, v := range observed(p, receiver(base[:len(base)-1])) {
				if text, ok := v.Interface().(string); ok {
					observations[text] = true
				}
			}
		}
		for _, value := range sortedKeys(observations) {
			insert := stringSourceContent(value, stringToken.text[0])
			// Matching is decided below in decoded-value space. Preserve the raw
			// typed prefix for every admitted match, including fuzzy/case matches,
			// so Monaco does not apply a second, incompatible escape-aware filter.
			filter := r.Document.Text[start:r.Cursor.Offset] + insert
			if strings.HasPrefix(value, prefix) {
				filter = r.Document.Text[start:r.Cursor.Offset] + stringSourceContent(value[len(prefix):], stringToken.text[0])
			}
			if !stringClosed {
				insert += stringToken.text[:1]
			}
			candidates = append(candidates, Completion{ID: "observed:" + value, Label: value, FilterText: filter, Kind: "value", Type: "string", Description: "Bounded observed fixture value or map key, not an exhaustive catalog fact.", Edit: Edit{span, insert}})
		}
	} else if len(base) > 0 && base[len(base)-1].text == "." {
		candidates = s.memberCandidates(env, infer(env, receiver(base[:len(base)-1])), span)
	} else {
		if _, shadowed := locals["resource"]; !shadowed {
			candidates = append(candidates, Completion{ID: "resource", Label: "resource", Kind: "parameter", Type: p.Root, Description: p.Info.Description, Edit: Edit{span, "resource"}})
			// Root field shorthand is an authoring edit, not a bare CEL declaration.
			// Do not offer it when a macro-local resource shadows the profile root.
			for _, field := range s.fieldCandidates(env, cel.ObjectType("omniview.dev."+p.Root), span) {
				field.Edit.Text = "resource." + field.Label
				field.Detail = field.Edit.Text + ": " + field.Type
				candidates = append(candidates, field)
			}
		}
		for _, v := range p.Info.Parameters {
			if _, shadowed := locals[v.Name]; !shadowed {
				candidates = append(candidates, Completion{ID: "parameter:" + v.Name, Label: v.Name, Kind: "parameter", Type: v.Type, Description: v.Description, Edit: Edit{span, v.Name}})
			}
		}
		for _, name := range sortedKeys(locals) {
			candidates = append(candidates, Completion{ID: "local:" + name, Label: name, Kind: "parameter", Type: locals[name].String(), Description: "Macro-local variable, valid only in this expression scope.", Edit: Edit{span, name}})
		}
		functions := env.Functions()
		for _, name := range sortedKeys(functions) {
			if strings.HasPrefix(name, "_") || strings.Contains(name, "@") || name == "double" {
				continue
			}
			f := functions[name]
			for _, o := range f.OverloadDecls() {
				if !o.IsMemberFunction() {
					candidates = append(candidates, functionCandidate(name, f, o, span))
					break
				}
			}
		}
		for _, macro := range env.Macros() {
			if !macro.IsReceiverStyle() {
				name := macro.Function()
				candidates = append(candidates, Completion{ID: "macro:" + name, Label: name, Kind: "function", Type: "bool", Description: "CEL field-presence macro. Absent optional fields are not null or false.", Detail: name + "(field)", InsertTextFormat: "snippet", Edit: Edit{span, name + "(${1:resource})"}})
			}
		}
	}
	for _, c := range candidates {
		score := matchScore(c.Label, prefix)
		if score >= 0 {
			c.SortText = fmt.Sprintf("%05d:%s", 2000-score, c.Label)
			if c.FilterText == "" {
				c.FilterText = c.Label
			}
			out.Completions = append(out.Completions, c)
		}
	}
	sort.Slice(out.Completions, func(i, j int) bool { return out.Completions[i].SortText < out.Completions[j].SortText })
	if len(out.Completions) > 100 {
		out.Completions = out.Completions[:100]
		out.Incomplete = true
	}
	if len(out.Completions) == 0 {
		out.Status = "empty"
	}
	if err := ctx.Err(); err != nil {
		return fail(r, err)
	}
	return out
}
func (s *Service) Hover(ctx context.Context, r Request) Response {
	p, err := s.validate(ctx, r)
	if err != nil {
		return fail(r, err)
	}
	out := envelope(r)
	end := r.Cursor.Offset
	for end < len(r.Document.Text) {
		c, n := utf8.DecodeRuneInString(r.Document.Text[end:])
		if !unicode.IsLetter(c) && !unicode.IsDigit(c) && c != '_' {
			break
		}
		end += n
	}
	ts := lex(r.Document.Text[:end])
	if len(ts) == 0 {
		return out
	}
	last := ts[len(ts)-1]
	env, _ := scopeEnv(p, ts)
	typ := infer(env, receiver(ts))
	if typ != nil {
		doc := "Declared CEL value."
		if len(ts) >= 2 && ts[len(ts)-2].text == "." {
			parent := infer(env, receiver(ts[:len(ts)-2]))
			if parent != nil {
				doc = fieldDocumentation(s.catalog, parent, last.text)
			}
		}
		out.Hover = &Hover{rng(last.start, last.end), "**" + last.text + "**: `" + typ.String() + "`\n\n" + doc}
	}
	return out
}
func (s *Service) Signature(ctx context.Context, r Request) Response {
	p, err := s.validate(ctx, r)
	if err != nil {
		return fail(r, err)
	}
	out := envelope(r)
	ts := lex(r.Document.Text[:r.Cursor.Offset])
	env, _ := scopeEnv(p, ts)
	stack := []int{}
	for i, t := range ts {
		if t.text == "(" {
			stack = append(stack, i)
		} else if t.text == ")" && len(stack) > 0 {
			stack = stack[:len(stack)-1]
		}
	}
	if len(stack) == 0 {
		return out
	}
	open := stack[len(stack)-1]
	if open < 1 {
		return out
	}
	name := ts[open-1].text
	member := open >= 2 && ts[open-2].text == "."
	var typ *cel.Type
	if member {
		typ = infer(env, receiver(ts[:open-2]))
	}
	if f := env.Functions()[name]; f != nil {
		for _, o := range f.OverloadDecls() {
			if (!member && !o.IsMemberFunction()) || overloadMatches(o, typ) {
				out.Signature = functionSignature(name, o)
				break
			}
		}
	}
	if out.Signature == nil {
		for _, macro := range env.Macros() {
			if macro.Function() != name || macro.IsReceiverStyle() != member {
				continue
			}
			if member && (typ == nil || (typ.Kind() != types.ListKind && typ.Kind() != types.MapKind)) {
				continue
			}
			parameters := []SignatureParameter{{Label: "field", Documentation: "Declared field to test for presence; absent values are not null."}}
			if member {
				elem := typ.Parameters()[0].String()
				parameters = []SignatureParameter{{Label: "variable: " + elem, Documentation: "Macro-local element variable (key for a map)."}, {Label: "expression", Documentation: "Expression checked in the local variable scope."}}
				if macro.ArgCount() == 3 {
					parameters = append(parameters, SignatureParameter{Label: "transform", Documentation: "Result expression for elements admitted by the predicate."})
				}
			}
			labels := make([]string, len(parameters))
			for i, p := range parameters {
				labels[i] = p.Label
			}
			out.Signature = &Signature{Label: name + "(" + strings.Join(labels, ", ") + ")", Documentation: "CEL standard macro; argument expressions are checked and evaluated by cel-go.", Parameters: parameters}
			break
		}
	}
	if out.Signature != nil {
		depth := 0
		for _, t := range ts[open+1:] {
			switch t.text {
			case "(", "[", "{":
				depth++
			case ")", "]", "}":
				depth--
			case ",":
				if depth == 0 {
					out.Signature.ActiveParameter++
				}
			}
		}
		if len(out.Signature.Parameters) > 0 {
			out.Signature.ActiveParameter = min(out.Signature.ActiveParameter, len(out.Signature.Parameters)-1)
		}
	}
	return out
}
