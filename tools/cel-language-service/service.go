package main

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"cel.dev/cel-go/cel"
	"cel.dev/cel-go/common/types"
	exprpb "google.golang.org/genproto/googleapis/api/expr/v1alpha1"
)

type Document struct {
	Text    string `json:"text"`
	Version int    `json:"version"`
}
type Cursor struct {
	Offset int    `json:"offset"`
	Unit   string `json:"unit"`
}
type BoundValue struct {
	Kind  string `json:"kind"`
	Value string `json:"value"`
}
type Request struct {
	Document       Document              `json:"document"`
	Cursor         Cursor                `json:"cursor"`
	ContextKey     string                `json:"contextKey"`
	FixtureProfile string                `json:"fixtureProfile"`
	Bindings       map[string]BoundValue `json:"bindings,omitempty"`
}
type Range struct {
	Start int    `json:"start"`
	End   int    `json:"end"`
	Unit  string `json:"unit"`
}
type Edit struct {
	Range Range  `json:"range"`
	Text  string `json:"text"`
}
type Completion struct {
	ID               string `json:"id"`
	Label            string `json:"label"`
	Kind             string `json:"kind"`
	Type             string `json:"type,omitempty"`
	Description      string `json:"description,omitempty"`
	Detail           string `json:"detail,omitempty"`
	FilterText       string `json:"filterText,omitempty"`
	SortText         string `json:"sortText,omitempty"`
	InsertTextFormat string `json:"insertTextFormat,omitempty"`
	Edit             Edit   `json:"edit"`
}
type Diagnostic struct {
	ID       string `json:"id"`
	Severity string `json:"severity"`
	Message  string `json:"message"`
	Range    Range  `json:"range"`
}
type Hover struct {
	Range    Range  `json:"range"`
	Contents string `json:"contents"`
}
type SignatureParameter struct {
	Label         string `json:"label"`
	Documentation string `json:"documentation,omitempty"`
}
type Signature struct {
	Label           string               `json:"label"`
	Documentation   string               `json:"documentation,omitempty"`
	Parameters      []SignatureParameter `json:"parameters"`
	ActiveParameter int                  `json:"activeParameter"`
}
type EvaluationResult struct {
	FixtureID string `json:"fixtureId"`
	Label     string `json:"label"`
	Provider  string `json:"provider"`
	Resource  string `json:"resource"`
	Matched   *bool  `json:"matched,omitempty"`
	Error     string `json:"error,omitempty"`
}
type Response struct {
	DocumentVersion int                `json:"documentVersion"`
	ContextKey      string             `json:"contextKey"`
	Status          string             `json:"status"`
	Message         string             `json:"message,omitempty"`
	Completions     []Completion       `json:"completions"`
	Diagnostics     []Diagnostic       `json:"diagnostics"`
	Incomplete      bool               `json:"incomplete,omitempty"`
	Hover           *Hover             `json:"hover,omitempty"`
	Signature       *Signature         `json:"signature,omitempty"`
	Results         []EvaluationResult `json:"results"`
}
type Service struct {
	catalog *Catalog
	slots   chan struct{}
}

func NewService() (*Service, error) {
	c, e := newCatalog()
	return &Service{catalog: c, slots: make(chan struct{}, 4)}, e
}
func rng(a, b int) Range { return Range{a, b, "utf8-byte"} }
func envelope(r Request) Response {
	return Response{DocumentVersion: r.Document.Version, ContextKey: r.ContextKey, Status: "ready", Completions: []Completion{}, Diagnostics: []Diagnostic{}, Results: []EvaluationResult{}}
}
func fail(r Request, err error) Response {
	out := envelope(r)
	out.Status = "error"
	out.Message = err.Error()
	return out
}
func (s *Service) validate(ctx context.Context, r Request) (*Profile, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if len(r.Document.Text) > 8192 || !utf8.ValidString(r.Document.Text) {
		return nil, fmt.Errorf("document exceeds 8192 UTF8 bytes or is invalid UTF8")
	}
	if len(r.ContextKey) > 256 || r.Document.Version < 0 {
		return nil, fmt.Errorf("invalid document identity")
	}
	if r.Cursor.Unit != "utf8-byte" || r.Cursor.Offset < 0 || r.Cursor.Offset > len(r.Document.Text) || !utf8.ValidString(r.Document.Text[:r.Cursor.Offset]) {
		return nil, fmt.Errorf("cursor must be a UTF8 byte boundary")
	}
	p := s.catalog.Profiles[r.FixtureProfile]
	if p == nil {
		return nil, fmt.Errorf("unknown fixture profile")
	}
	return p, nil
}
func bytePosition(text string, line, column int) int {
	offset := 0
	for i, l := range strings.Split(text, "\n") {
		if i == line-1 {
			for _, r := range l {
				if column <= 0 {
					break
				}
				offset += utf8.RuneLen(r)
				column--
			}
			return min(offset, len(text))
		}
		offset += len(l) + 1
	}
	return len(text)
}
func numericIssue(e *exprpb.Expr) bool {
	if e == nil {
		return false
	}
	if _, ok := e.GetConstExpr().GetConstantKind().(*exprpb.Constant_DoubleValue); ok {
		return true
	}
	if c := e.GetCallExpr(); c != nil {
		if c.Function == "double" {
			return true
		}
		if numericIssue(c.Target) {
			return true
		}
		for _, a := range c.Args {
			if numericIssue(a) {
				return true
			}
		}
	}
	if numericIssue(e.GetSelectExpr().GetOperand()) {
		return true
	}
	for _, v := range e.GetListExpr().GetElements() {
		if numericIssue(v) {
			return true
		}
	}
	for _, v := range e.GetStructExpr().GetEntries() {
		if numericIssue(v.GetMapKey()) || numericIssue(v.Value) {
			return true
		}
	}
	if c := e.GetComprehensionExpr(); c != nil {
		for _, v := range []*exprpb.Expr{c.IterRange, c.AccuInit, c.LoopCondition, c.LoopStep, c.Result} {
			if numericIssue(v) {
				return true
			}
		}
	}
	return false
}
func compile(p *Profile, r Request) (*cel.Ast, []Diagnostic) {
	ast, issues := p.Env.Compile(r.Document.Text)
	ds := []Diagnostic{}
	if issues != nil && issues.Err() != nil {
		for i, e := range issues.Errors() {
			a := bytePosition(r.Document.Text, e.Location.Line(), e.Location.Column())
			end := a
			if a < len(r.Document.Text) {
				_, size := utf8.DecodeRuneInString(r.Document.Text[a:])
				end += size
			}
			ds = append(ds, Diagnostic{fmt.Sprint("cel-", i), "error", e.Message, rng(a, end)})
		}
		return nil, ds
	}
	if numericIssue(ast.Expr()) {
		return nil, []Diagnostic{{"numeric-profile", "error", numericProfile, rng(0, len(r.Document.Text))}}
	}
	if ast.OutputType() != cel.BoolType {
		return nil, []Diagnostic{{"predicate-type", "error", "Resource predicates must return bool; got " + ast.OutputType().String(), rng(0, len(r.Document.Text))}}
	}
	return ast, ds
}
func (s *Service) Check(ctx context.Context, r Request) Response {
	p, err := s.validate(ctx, r)
	if err != nil {
		return fail(r, err)
	}
	out := envelope(r)
	_, out.Diagnostics = compile(p, r)
	if err := ctx.Err(); err != nil {
		return fail(r, err)
	}
	if len(out.Diagnostics) > 0 {
		out.Status = "error"
		out.Message = "CEL checking failed"
	}
	return out
}
func validateBindings(p *Profile, r Request) (map[string]interface{}, error) {
	out := map[string]interface{}{}
	if r.Bindings == nil {
		return out, nil
	}
	if len(r.Bindings) != len(p.Info.Parameters) {
		return nil, fmt.Errorf("bindings must supply exactly all declared parameters")
	}
	for _, param := range p.Info.Parameters {
		v, ok := r.Bindings[param.Name]
		if !ok || v.Kind != param.Type || len(v.Value) > 1024 {
			return nil, fmt.Errorf("invalid binding %s", param.Name)
		}
		switch v.Kind {
		case "int64":
			n, e := strconv.ParseInt(v.Value, 10, 64)
			if e != nil || strconv.FormatInt(n, 10) != v.Value {
				return nil, fmt.Errorf("%s requires canonical exact int64 decimal string", param.Name)
			}
			out[param.Name] = n
		case "bool":
			if v.Value != "true" && v.Value != "false" {
				return nil, fmt.Errorf("invalid bool binding")
			}
			out[param.Name] = v.Value == "true"
		case "string":
			out[param.Name] = v.Value
		default:
			return nil, fmt.Errorf("unsupported binding type")
		}
	}
	return out, nil
}
func (s *Service) Evaluate(ctx context.Context, r Request) Response {
	p, err := s.validate(ctx, r)
	if err != nil {
		return fail(r, err)
	}
	bindings, err := validateBindings(p, r)
	if err != nil {
		return fail(r, err)
	}
	out := envelope(r)
	ast, ds := compile(p, r)
	out.Diagnostics = ds
	if ast == nil {
		out.Status = "error"
		out.Message = "CEL checking failed; no fixtures evaluated"
		return out
	}
	if err := ctx.Err(); err != nil {
		return fail(r, err)
	}
	program, err := p.Env.Program(ast, cel.CostLimit(10000), cel.InterruptCheckFrequency(16))
	if err != nil {
		return fail(r, err)
	}
	ctx, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
	defer cancel()
	for _, f := range p.Fixtures {
		if err := ctx.Err(); err != nil {
			return fail(r, err)
		}
		row := EvaluationResult{FixtureID: f.Summary.ID, Label: f.Summary.Label, Provider: f.Summary.Provider, Resource: f.Summary.Resource}
		activation := p.bindings(f)
		for k, v := range bindings {
			activation[k] = v
		}
		value, _, evalErr := program.ContextEval(ctx, activation)
		if evalErr != nil {
			row.Error = evalErr.Error()
		} else if b, ok := value.(types.Bool); ok {
			v := bool(b)
			row.Matched = &v
		} else {
			row.Error = "CEL predicate did not produce bool"
		}
		out.Results = append(out.Results, row)
	}
	return out
}
