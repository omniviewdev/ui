/** Static Storybook/test fixtures only. Never imported by production components. */
import type {
  QueryExplain,
  ResourceIndexAdvice,
  ResourceIndexDefinition,
  ResourceIndexInventory,
  RelationshipCatalog,
  RelationshipPreviewData,
  RelationshipRuleDraft,
} from './types';

export const exampleExplain: QueryExplain = {
  queryLabel: 'Cloud machines tagged production',
  scope: 'cloud / account-blue / region-west',
  coverage: 'Partial: 400 of unknown total',
  freshness: 'Snapshot only; refresh required',
  selectionReason: 'Selective tag lookup',
  measuredAt: '2026-10-18T10:00:00Z',
  stages: [
    {
      id: 'candidates',
      label: 'Candidate lookup',
      description: 'Host selected a document path index for the observed selection.',
      indexIds: ['cloud-tags'],
      work: [
        {
          label: 'Candidate count',
          kind: 'actual',
          value: '12 candidates',
          basis: 'Observed during this execution',
        },
        {
          label: 'Lookup duration',
          kind: 'estimated',
          value: '4 ms',
          basis: 'Host sample of 80 resources',
        },
      ],
    },
    {
      id: 'residual',
      label: 'Residual predicate',
      description: 'Host evaluated remaining conditions on candidates.',
      indexIds: [],
      work: [
        {
          label: 'Residual evaluations',
          kind: 'actual',
          value: '12 evaluations',
          basis: 'Observed during this execution',
        },
        {
          label: 'Retained resources scanned',
          kind: 'actual',
          value: '0 full scans',
          basis: 'This plan and coverage only',
        },
      ],
    },
  ],
  diagnostics: [
    {
      id: 'partial',
      severity: 'warning',
      message: 'Counts describe retained coverage, not a complete provider inventory.',
    },
  ],
};

export const exampleProposal: ResourceIndexDefinition = {
  id: 'image-index',
  label: 'cloud-image-id',
  provider: 'cloud',
  resourceType: 'machine',
  scope: 'account-blue / region-west',
  path: 'image.id',
  valueType: 'string',
  schema: 'schema-cloud@3',
  storage: 'memory',
  dataPolicy: 'Memory-only derived keys; no raw document persistence',
};

export const exampleIndex: ResourceIndexInventory = {
  ...exampleProposal,
  id: 'cloud-tags',
  label: 'cloud-tags',
  path: 'tags[*].value',
  kind: 'document',
  state: 'ready',
  coverage: 'Partial retained scope: 400 resources',
  freshness: 'Snapshot captured at 10:00 UTC; refresh required',
  generation: 'generation-8',
  memory: { kind: 'actual', value: '8 KiB', basis: 'Retained heap sample' },
  disk: { kind: 'not-applicable', reason: 'Memory-only index; no disk storage' },
  references: [{ id: 'fleet', label: 'Fleet view', queryLabel: 'Production machines' }],
  fallback: 'Scan retained observations if unavailable',
  quota: 'Memory budget 2 MiB; no persistence allocation',
  actions: ['rebuild', 'drop'],
};

export const exampleAdvice: ResourceIndexAdvice = {
  id: 'image-advice',
  viewLabel: 'Image inventory',
  queryLabel: 'Machines by image',
  proposalId: exampleProposal.id,
  indexIds: [],
  recommendation: 'Consider a scoped image identifier index for this measured workload.',
  confidence: 'Medium',
  basis: '20 host-observed executions within retained snapshot coverage',
  benefit: {
    label: 'Candidate reduction',
    kind: 'estimated',
    value: '400 → 12 candidates',
    basis: 'Selective workload sample; not a speedup guarantee',
  },
  writeCost: {
    label: 'Update overhead',
    kind: 'estimated',
    value: '1 key per changed machine',
    basis: 'Observed scalar image identifier shape',
  },
  memory: {
    kind: 'estimated',
    value: '16 KiB',
    basis: 'Host sample extrapolation; excludes allocator overhead',
  },
  disk: { kind: 'not-applicable', reason: 'Memory-only proposal' },
};

export const exampleCatalog: RelationshipCatalog = {
  sourceTypes: [
    {
      id: 'vm',
      label: 'Virtual machine',
      provider: 'hypervisor',
      fields: [
        { id: 'external-id', label: 'Cloud identifier', type: 'string' },
        { id: 'image', label: 'Image identifier', type: 'string' },
      ],
    },
  ],
  targetTypes: [
    {
      id: 'machine',
      label: 'Cloud machine',
      provider: 'cloud',
      fields: [
        { id: 'native-id', label: 'Native identifier', type: 'string' },
        { id: 'generation', label: 'Generation', type: 'uint64' },
      ],
    },
  ],
  scopeMappings: [
    {
      id: 'same-account',
      label: 'Explicit account map',
      description: 'hypervisor-lab / cluster-a → cloud / account-blue / region-west',
      state: 'available',
    },
    {
      id: 'cross-account',
      label: 'Cross-account image map',
      description: 'hypervisor-lab / cluster-a → cloud / image-account / region-east',
      state: 'available',
    },
    {
      id: 'restricted',
      label: 'Restricted account',
      description: 'Account mapping denied by host policy',
      state: 'denied',
    },
    {
      id: 'offline',
      label: 'Offline inventory',
      description: 'Source unavailable; no fallback inferred',
      state: 'unavailable',
    },
  ],
  operators: [
    {
      id: 'equal',
      label: 'Equals (typed)',
      description: 'Host checks matching types; no implicit coercion.',
    },
    {
      id: 'contains',
      label: 'Contains (typed)',
      description: 'Host checks collection membership compatibility.',
    },
  ],
};

export const exampleRule: RelationshipRuleDraft = {
  id: 'image-link',
  name: 'Image link',
  sourceTypeId: 'vm',
  targetTypeId: 'machine',
  scopeMappingId: 'same-account',
  cardinality: 'one-to-one',
  conditions: [
    {
      id: 'condition-1',
      sourceFieldId: 'external-id',
      operatorId: 'equal',
      targetFieldId: 'native-id',
    },
  ],
  enabled: true,
  origin: 'user',
};

export const examplePreview: RelationshipPreviewData = {
  scope: 'Explicit hypervisor-lab → cloud account-blue mapping',
  coverage: 'Partial cloud inventory; bounded retained observations',
  limit: 4,
  truncated: true,
  summary:
    '1 matched, 1 ambiguous, 1 denied, 1 unavailable example; unmatched resources may exist outside this window.',
  diagnostics: [
    { id: 'ambiguous', severity: 'warning', message: 'Multiple targets share the configured key' },
  ],
  edges: [
    {
      id: 'match',
      source: { label: 'VM alpha', navigationId: 'vm-alpha' },
      target: { label: 'Cloud machine alpha', navigationId: 'cloud-alpha' },
      state: 'matched',
      detail: 'Configured identifiers match within the permitted mapping.',
      provenance: {
        origin: 'provider',
        ruleLabel: 'Built-in ownership',
        condition: 'Provider-declared relationship',
        scopeMapping: 'Account-blue mapping',
      },
    },
    {
      id: 'ambiguous',
      source: { label: 'VM beta', navigationId: 'vm-beta' },
      target: { label: '2 candidate machines' },
      state: 'ambiguous',
      detail: 'No automatic identity selection; host reports multiple candidates.',
      provenance: {
        origin: 'user',
        ruleLabel: 'Image link',
        condition: 'external-id equals native-id',
        scopeMapping: 'Account-blue mapping',
      },
    },
    {
      id: 'denied',
      source: { label: 'Restricted source' },
      target: { label: 'Restricted target' },
      state: 'denied',
      detail: 'Target scope access denied; protected identifiers withheld.',
      provenance: {
        origin: 'user',
        ruleLabel: 'Image link',
        condition: 'Host withheld protected evaluation details',
        scopeMapping: 'Restricted mapping',
      },
    },
    {
      id: 'unavailable',
      source: { label: 'Offline source' },
      state: 'unavailable',
      detail: 'Source unavailable; absence does not mean no relationship.',
      provenance: {
        origin: 'user',
        ruleLabel: 'Image link',
        condition: 'Evaluation unavailable',
        scopeMapping: 'Offline mapping',
      },
    },
  ],
};
