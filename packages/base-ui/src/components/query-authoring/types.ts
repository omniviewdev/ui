import type { ReactNode } from 'react';

/** Local presentation contracts, not a host wire protocol. Source offsets are zero-based,
 * half-open UTF-8 byte offsets. The adapter converts DOM UTF-16 offsets explicitly. */
export interface QueryRange {
  start: number;
  end: number;
  unit: 'utf8-byte';
}
export interface QueryEdit {
  range: QueryRange;
  text: string;
}
export interface QueryDocument {
  text: string;
  version: number;
  /** Optional editor-owned identity; authoring adapters must isolate distinct models. */
  uri?: string;
}
export interface QueryCompletion {
  id: string;
  label: string;
  kind: 'field' | 'operator' | 'value' | 'parameter' | 'function';
  type?: string;
  description?: string;
  /** Presentation-only candidate matching and host relevance order. */
  filterText?: string;
  sortText?: string;
  /** Snippets use Monaco/LSP tab-stop syntax; plain edits are the default. */
  insertTextFormat?: 'plain' | 'snippet';
  /** Host-provided union/branch applicability. Never inferred by the component. */
  condition?: string;
  detail?: string;
  disabledReason?: string;
  edit: QueryEdit;
}
export interface QueryDiagnostic {
  id: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  range: QueryRange;
  fix?: QueryEdit;
}
export type QueryServiceStatus = 'ready' | 'empty' | 'error' | 'denied' | 'unavailable';
export interface QueryAvailability {
  status: 'ready' | 'loading' | 'error' | 'denied' | 'unavailable';
  message?: string;
}
export interface QueryLanguageRequest {
  document: QueryDocument;
  cursor: { offset: number; unit: 'utf8-byte' };
  contextKey: string;
  signal: AbortSignal;
}
export interface QueryLanguageResponse {
  documentVersion: number;
  contextKey: string;
  status: QueryServiceStatus;
  message?: string;
  completions: readonly QueryCompletion[];
  diagnostics: readonly QueryDiagnostic[];
  /** Suggestions are bounded observations, not exhaustive inventory/schema facts. */
  incomplete?: boolean;
}
export type QueryLanguageService = (
  request: QueryLanguageRequest,
) => Promise<QueryLanguageResponse>;

export interface QueryHoverResponse {
  documentVersion: number;
  contextKey: string;
  status: QueryServiceStatus;
  message?: string;
  /** Untrusted Markdown documentation for a checked source range. */
  hover?: { range: QueryRange; contents: string };
}
export interface QuerySignatureResponse {
  documentVersion: number;
  contextKey: string;
  status: QueryServiceStatus;
  message?: string;
  signature?: {
    label: string;
    documentation?: string;
    parameters: readonly { label: string; documentation?: string }[];
    activeParameter: number;
  };
}
export type QueryHoverService = (request: QueryLanguageRequest) => Promise<QueryHoverResponse>;
export type QuerySignatureService = (
  request: QueryLanguageRequest,
) => Promise<QuerySignatureResponse>;

/** Dependency-injected code surface. Base UI owns controls and drafts, never Monaco. */
export interface QueryEditorRenderProps {
  document: QueryDocument;
  onChange: (text: string) => void;
  contextKey: string;
  request?: QueryLanguageService;
  availability?: QueryAvailability;
  disabled?: boolean;
  onSubmit?: () => void;
  label?: string;
  placeholder?: string;
  debounceMs?: number;
  maxSuggestions?: number;
}

/** Numeric and timestamp drafts remain text. Host validation/admission owns conversion,
 * exactness, ranges, timezone policy, nullability, defaults and execution binding. */
export type QueryValue =
  | { kind: 'string' | 'integer' | 'number' | 'timestamp'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'enum'; value: string }
  | { kind: 'list'; value: readonly string[] }
  | { kind: 'record'; value: Readonly<Record<string, QueryValue | undefined>> };
export interface QueryValueOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  disabledReason?: string;
}
export interface QueryOptionRequest {
  contextKey: string;
  search: string;
  signal: AbortSignal;
}
export interface QueryOptionResponse {
  contextKey: string;
  status: QueryServiceStatus;
  options: readonly QueryValueOption[];
  message?: string;
  incomplete?: boolean;
}
interface QueryValueDefinitionBase {
  placeholder?: string;
  description?: string;
  options?: readonly QueryValueOption[];
  loadOptions?: (request: QueryOptionRequest) => Promise<QueryOptionResponse>;
  /** Host explanation of supported constraints, rendered without reimplementing validation. */
  constraint?: string;
}
/** Host-defined compound inputs preserve correlations (for example a tag key/value
 * pair). Their field IDs are opaque and do not imply paths or query semantics. */
export type QueryValueDefinition = QueryValueDefinitionBase &
  (
    | { kind: Exclude<QueryValue['kind'], 'record'> }
    | {
        kind: 'record';
        fields: readonly {
          id: string;
          label: string;
          definition: QueryValueDefinition;
          required?: boolean;
        }[];
      }
  );
export interface QueryOperator {
  id: string;
  label: string;
  description?: string;
  /** Omit for host-defined state clauses such as present/absent/null. */
  value?: QueryValueDefinition;
  disabledReason?: string;
}
export interface QueryField {
  id: string;
  label: string;
  type: string;
  description?: string;
  condition?: string;
  disabledReason?: string;
  operators: readonly QueryOperator[];
}
export interface QueryClause {
  kind: 'clause';
  id: string;
  field?: string;
  operator?: string;
  value?: QueryValue;
  negated?: boolean;
}
export interface QueryGroup {
  kind: 'group';
  id: string;
  combinator: 'and' | 'or';
  children: readonly QueryNode[];
  negated?: boolean;
}
export type QueryNode = QueryClause | QueryGroup;
export interface QueryBuilderDiagnostic {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
export interface QueryBuilderAnalysis {
  status: QueryServiceStatus;
  message?: string;
  diagnostics: readonly QueryBuilderDiagnostic[];
  preview?: string;
  explanation?: string;
}
export interface QueryAuthoringValue {
  mode: 'code' | 'builder';
  code: QueryDocument;
  builder: QueryGroup;
}
export interface QueryConversionContext {
  contextKey: string;
  signal: AbortSignal;
}
export type QueryConversionResult<T> =
  | { status: 'ready'; value: T; message?: string }
  | { status: 'unsupported' | 'error' | 'denied' | 'unavailable'; message: string };
export interface QueryVariable {
  id: string;
  label: string;
  definition: QueryValueDefinition;
  description?: string;
  required?: boolean;
  sensitive?: boolean;
  disabledReason?: string;
  defaultValue?: QueryValue;
  error?: string;
}
export interface QueryScopeOption {
  id: string;
  label: string;
  description?: string;
  disabledReason?: string;
}
export interface QueryAuthoringLabels {
  code?: string;
  builder?: string;
  run?: string;
  clear?: string;
}
export interface QueryPresentationState {
  status:
    | 'idle'
    | 'loading'
    | 'live'
    | 'snapshot'
    | 'stale'
    | 'partial'
    | 'error'
    | 'denied'
    | 'unavailable';
  message: string;
  detail?: ReactNode;
}
