/** Presentation contracts only. The host owns planning, validation, matching and index lifecycle. */
export interface InspectorDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface InspectorEvidence {
  label: string;
  kind: 'actual' | 'estimated' | 'unavailable';
  value: string;
  basis: string;
}

export type IndexFootprint =
  | { kind: 'actual' | 'estimated'; value: string; basis: string }
  | { kind: 'unavailable' | 'not-applicable'; reason: string };

export interface QueryExplain {
  queryLabel: string;
  scope: string;
  coverage: string;
  freshness: string;
  selectionReason: string;
  measuredAt?: string;
  stages: readonly {
    id: string;
    label: string;
    description: string;
    indexIds: readonly string[];
    work: readonly InspectorEvidence[];
  }[];
  diagnostics: readonly InspectorDiagnostic[];
}

export interface ResourceIndexDefinition {
  id: string;
  label: string;
  provider: string;
  resourceType: string;
  scope: string;
  path: string;
  valueType: string;
  schema: string;
  storage: 'memory' | 'persisted';
  dataPolicy: string;
}

export interface ResourceIndexInventory extends ResourceIndexDefinition {
  kind: 'metadata' | 'document';
  state:
    | 'ready'
    | 'building'
    | 'catching-up'
    | 'stale'
    | 'failed'
    | 'canceled'
    | 'unavailable'
    | 'denied';
  coverage: string;
  freshness: string;
  generation?: string;
  memory: IndexFootprint;
  disk: IndexFootprint;
  quota?: string;
  references: readonly { id: string; label: string; queryLabel: string }[];
  fallback: string;
  failure?: string;
  operation?: { id: string; label: string; progress?: number; cancellable: boolean };
  /** Host-authorized actions; absence never means allowed. */
  actions: readonly ('rebuild' | 'drop')[];
}

export interface ResourceIndexAdvice {
  id: string;
  viewLabel: string;
  queryLabel: string;
  proposalId?: string;
  indexIds: readonly string[];
  recommendation: string;
  confidence: string;
  basis: string;
  benefit: InspectorEvidence;
  memory: IndexFootprint;
  disk: IndexFootprint;
  writeCost: InspectorEvidence;
  beforeAfter?: { before: string; after: string; basis: string };
}

export type ResourceIndexAction =
  | { kind: 'create'; definition: ResourceIndexDefinition }
  | { kind: 'rebuild' | 'drop'; indexId: string }
  | { kind: 'cancel'; operationId: string };

export interface InspectorAsyncContext {
  /** Abort stops waiting for this request. The host decides whether underlying work can stop. */
  signal: AbortSignal;
}

export interface RelationshipFieldOption {
  id: string;
  label: string;
  type: string;
}

export interface RelationshipTypeOption {
  id: string;
  label: string;
  provider: string;
  fields: readonly RelationshipFieldOption[];
}

export interface RelationshipCatalog {
  sourceTypes: readonly RelationshipTypeOption[];
  targetTypes: readonly RelationshipTypeOption[];
  scopeMappings: readonly {
    id: string;
    label: string;
    description: string;
    state: 'available' | 'denied' | 'unavailable';
  }[];
  /** Host-supplied operators; compatibility is validated by the host, never inferred here. */
  operators: readonly { id: string; label: string; description: string }[];
}

export interface RelationshipCondition {
  id: string;
  sourceFieldId: string;
  operatorId: string;
  targetFieldId: string;
}

export type RelationshipCardinality = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

export interface RelationshipRuleDraft {
  id: string;
  name: string;
  sourceTypeId: string;
  targetTypeId: string;
  scopeMappingId: string;
  cardinality: RelationshipCardinality;
  conditions: readonly RelationshipCondition[];
  enabled: boolean;
  origin: 'user' | 'provider';
}

export interface RelationshipValidation {
  state: 'unchecked' | 'pending' | 'valid' | 'invalid' | 'denied' | 'unavailable';
  diagnostics: readonly InspectorDiagnostic[];
}

export interface RelationshipEndpoint {
  label: string;
  /** Opaque host navigation target, not an inferred identity. Omit for protected endpoints. */
  navigationId?: string;
}

export interface RelationshipPreviewData {
  scope: string;
  coverage: string;
  limit: number;
  truncated: boolean;
  summary: string;
  diagnostics: readonly InspectorDiagnostic[];
  edges: readonly {
    id: string;
    source: RelationshipEndpoint;
    target?: RelationshipEndpoint;
    state: 'matched' | 'unmatched' | 'ambiguous' | 'denied' | 'unavailable';
    detail: string;
    provenance: {
      origin: 'provider' | 'user';
      ruleLabel: string;
      condition: string;
      scopeMapping: string;
    };
  }[];
}
