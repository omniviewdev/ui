import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Popover } from '../popover';
import { QueryAuthoring } from './QueryAuthoring';
import { QueryInput } from './QueryInput';
import { QueryBuilder } from './QueryBuilder';
import { QueryVariables } from './QueryVariables';
import { QueryValueInput } from './QueryValueInput';
import { utf16ToUtf8 } from './offsets';
import type {
  QueryAuthoringValue,
  QueryAvailability,
  QueryClause,
  QueryCompletion,
  QueryDocument,
  QueryField,
  QueryGroup,
  QueryLanguageRequest,
  QueryLanguageResponse,
  QueryOptionRequest,
  QueryOptionResponse,
  QueryValue,
  QueryVariable,
} from './types';

const meta = {
  title: 'Components/Query Authoring',
  component: QueryAuthoring,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Controlled provider-neutral query authoring. These stories use explicitly named, bounded fixtures—not a CEL evaluator, schema service, production binding or inventory integration. Conversion succeeds only for the exact published fixture pair. UTF-8 edits are translated to DOM UTF-16 offsets.',
      },
    },
  },
} satisfies Meta<typeof QueryAuthoring>;
export default meta;
type Story = StoryObj;

const empty: QueryGroup = { kind: 'group', id: 'root', combinator: 'and', children: [] };
const vm: QueryGroup = {
  ...empty,
  children: [
    {
      kind: 'clause',
      id: 'cpu',
      field: 'cpu',
      operator: 'gte',
      value: { kind: 'integer', value: '4' },
    },
    {
      kind: 'clause',
      id: 'state',
      field: 'state',
      operator: 'eq',
      value: { kind: 'enum', value: 'running' },
    },
  ],
};
const source = 'resource.cpu >= 4 && resource.state == "running"';
const tagMatch: QueryClause = {
  kind: 'clause',
  id: 'tag',
  field: 'tag',
  operator: 'tagMatches',
  value: {
    kind: 'record',
    value: {
      key: { kind: 'string', value: 'environment' },
      value: { kind: 'string', value: 'production' },
    },
  },
};
const fields: readonly QueryField[] = [
  {
    id: 'name',
    label: 'Display name',
    type: 'string',
    description: 'Provider-declared display name, not an identity requirement.',
    operators: [
      { id: 'eq', label: 'equals', value: { kind: 'string' } },
      {
        id: 'present',
        label: 'is present',
        description: 'Host-defined descendant presence; this is not a null test.',
      },
    ],
  },
  {
    id: 'cpu',
    label: 'CPU count',
    type: 'integer',
    description: 'Allocated virtual processors.',
    operators: [
      {
        id: 'gte',
        label: 'at least',
        description: 'Value condition includes host-defined required presence/non-null guards.',
        value: { kind: 'integer', constraint: 'Whole integer ≥ 1; validated by the host.' },
      },
      {
        id: 'ne',
        label: 'present value is not equal to',
        description: 'Present-value inequality is distinct from whole-condition NOT.',
        value: { kind: 'integer' },
      },
      {
        id: 'absent',
        label: 'is absent',
        description: 'Known absence, not unavailable or denied data.',
      },
      { id: 'null', label: 'is null', description: 'Present and explicitly null, not absent.' },
    ],
  },
  {
    id: 'state',
    label: 'State',
    type: 'string',
    operators: [
      {
        id: 'eq',
        label: 'equals',
        value: {
          kind: 'enum',
          options: [
            {
              id: 'running',
              label: 'Running',
              value: 'running',
              description: 'Reported by the source.',
            },
            { id: 'stopped', label: 'Stopped', value: 'stopped' },
          ],
        },
      },
    ],
  },
  {
    id: 'tag',
    label: 'Tag entry',
    type: 'tag-array condition',
    description:
      'Host-declared correlated key/value operation; the UI does not flatten tag arrays.',
    operators: [
      {
        id: 'tagMatches',
        label: 'has matching key/value entry',
        description:
          'Host-declared same-element correlation. The key and value must match one tag entry, not different array elements.',
        value: {
          kind: 'record',
          fields: [
            {
              id: 'key',
              label: 'Tag key',
              required: true,
              definition: { kind: 'string', placeholder: 'environment' },
            },
            {
              id: 'value',
              label: 'Tag value',
              definition: { kind: 'string', placeholder: 'production' },
            },
          ],
        },
      },
    ],
  },
  {
    id: 'branch-size',
    label: 'SSD capacity',
    type: 'integer',
    condition: 'storage.kind is SSD; branch membership established by host',
    operators: [{ id: 'gte', label: 'at least', value: { kind: 'integer' } }],
  },
  {
    id: 'secret',
    label: 'Private attribute',
    type: 'string',
    disabledReason: 'Not authorized for this field.',
    operators: [],
  },
];

async function fixtureOptions({
  contextKey,
  search,
  signal,
}: QueryOptionRequest): Promise<QueryOptionResponse> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 250);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
  const options = [
    { id: 'west', value: 'west', label: 'West region' },
    { id: 'east', value: 'east', label: 'East region' },
  ].filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  return { contextKey, status: options.length ? 'ready' : 'empty', options, incomplete: true };
}

async function fixtureLanguage(request: QueryLanguageRequest): Promise<QueryLanguageResponse> {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 160);
    request.signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
  const middle = request.document.text === 'resource.na == "prod"';
  const range = middle
    ? { start: 9, end: 11, unit: 'utf8-byte' as const }
    : { start: request.cursor.offset, end: request.cursor.offset, unit: 'utf8-byte' as const };
  const completions: QueryCompletion[] = [
    {
      id: 'name',
      label: 'name',
      kind: 'field',
      type: 'string',
      description: 'Provider-declared display name.',
      edit: { range, text: 'name' },
    },
    {
      id: 'cpu',
      label: 'cpu',
      kind: 'field',
      type: 'integer',
      description: 'Virtual CPU count.',
      edit: { range, text: 'cpu' },
    },
    {
      id: 'ssd',
      label: 'storage.capacity',
      kind: 'field',
      type: 'integer',
      condition: 'storage.kind is SSD',
      description: 'Conditional branch-specific field.',
      edit: { range, text: 'storage.capacity' },
    },
    {
      id: 'operator',
      label: 'equals',
      kind: 'operator',
      type: 'string comparison',
      description: 'Exact equality for admitted string values.',
      edit: { range, text: ' == ' },
    },
    {
      id: 'value',
      label: 'production',
      kind: 'value',
      type: 'string',
      description: 'Bounded observed value; not a schema guarantee.',
      edit: { range, text: '"production"' },
    },
    {
      id: 'parameter',
      label: 'minimumCpu',
      kind: 'parameter',
      type: 'integer',
      description: 'Typed parameter binding, not source interpolation.',
      edit: { range, text: 'minimumCpu' },
    },
    {
      id: 'denied',
      label: 'privateKey',
      kind: 'field',
      type: 'string',
      disabledReason: 'Field is denied in this fixture.',
      edit: { range, text: 'privateKey' },
    },
  ];
  return {
    documentVersion: request.document.version,
    contextKey: request.contextKey,
    status: 'ready',
    completions,
    diagnostics: middle
      ? [
          {
            id: 'partial',
            severity: 'warning',
            message: 'Incomplete field name (fixture diagnostic)',
            range,
            fix: { range, text: 'name' },
          },
        ]
      : [],
    incomplete: true,
  };
}

function AuthoringDemo() {
  const [value, setValue] = useState<QueryAuthoringValue>({
    mode: 'code',
    code: { text: source, version: 1 },
    builder: empty,
  });
  const [scope, setScope] = useState('vm');
  const [runs, setRuns] = useState(0);
  return (
    <div style={{ maxWidth: 1100 }}>
      <p>
        Interactive fixture only. The exact initial expression has a reviewed fixture builder pair.
        Other expressions remain in code mode unchanged.
      </p>
      <QueryAuthoring
        value={value}
        onChange={setValue}
        fields={fields}
        contextKey={`fixture:${scope}`}
        request={fixtureLanguage}
        scope={scope}
        onScopeChange={setScope}
        scopes={[
          { id: 'cloud', label: 'Cloud account', description: 'Flat attributes and tag arrays.' },
          {
            id: 'container',
            label: 'Container engine',
            description: 'State and labels; optional updates.',
          },
          { id: 'vm', label: 'Hypervisor', description: 'Snapshot-only VM source; no live claim.' },
          { id: 'denied', label: 'Restricted scope', disabledReason: 'Access denied' },
        ]}
        onRun={() => setRuns((count) => count + 1)}
        onRefresh={() => setRuns((count) => count + 1)}
        onClear={() =>
          setValue({
            mode: 'code',
            code: { text: '', version: value.code.version + 1 },
            builder: empty,
          })
        }
        toBuilder={async (document) =>
          document.text === source
            ? { status: 'ready', value: vm }
            : {
                status: 'unsupported',
                message:
                  'Only the exact published fixture expression is convertible in this demo. A production host must supply conversion.',
              }
        }
        toCode={async (builder) =>
          JSON.stringify(builder) === JSON.stringify(vm)
            ? { status: 'ready', value: source }
            : {
                status: 'unsupported',
                message:
                  'This edited builder has no published fixture source pair. Production serialization belongs to the host.',
              }
        }
        builderProps={{
          allowNegation: true,
          explanation:
            'Fixture pair: running VMs with at least four CPUs. Editing demonstrates draft controls; it does not evaluate resources.',
          preview:
            value.mode === 'builder' && JSON.stringify(value.builder) === JSON.stringify(vm)
              ? source
              : 'Edited draft — host preview required.',
          examples: [
            {
              label: 'VM hardware',
              description: 'At least four CPUs and running state.',
              value: vm,
            },
            {
              label: 'Cloud tag array',
              description:
                'Edit a key/value pair that the host treats as one correlated tag operation.',
              value: {
                ...empty,
                children: [tagMatch],
              },
            },
          ],
        }}
        state={{
          status: 'snapshot',
          message: `Snapshot-only fixture · ${runs} run/refresh requests`,
          detail: 'No production lease or resource execution is connected in this story.',
        }}
      />
      <details>
        <summary>Controlled authoring draft</summary>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </details>
    </div>
  );
}
export const Interactive: Story = { render: () => <AuthoringDemo /> };

function InputDemo({ text = 'resource.na == "prod"', rows = 1 }: { text?: string; rows?: number }) {
  const [document, setDocument] = useState<QueryDocument>({ text, version: 1 });
  return (
    <div style={{ maxWidth: 850 }}>
      <QueryInput
        document={document}
        onChange={(next) => setDocument({ text: next, version: document.version + 1 })}
        contextKey="fixture:input"
        request={fixtureLanguage}
        rows={rows}
      />
      <p>
        Focus or Control+Space to open. Arrow keys navigate, Enter inserts, Escape dismisses, Tab
        leaves. Shift+Enter inserts a newline. The initial partial field has an exact middle
        replacement and diagnostic fix.
      </p>
      <output>{document.text}</output>
    </div>
  );
}
export const MidExpressionCompletion: Story = { render: () => <InputDemo /> };
export const MultilineUnicode: Story = {
  render: () => <InputDemo text={'// 😀 e\u0301 終\nresource.'} rows={4} />,
};
export const InsidePopover: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger render={<Button />}>Open query popover</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Popup style={{ width: 650, maxWidth: '90vw' }}>
            <Popover.Title>Query inside a popover</Popover.Title>
            <InputDemo />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};

function StateDemo() {
  const [status, setStatus] = useState<
    'ready' | 'empty' | 'loading' | 'error' | 'denied' | 'unavailable'
  >('ready');
  const [document, setDocument] = useState<QueryDocument>({ text: 'resource.', version: 1 });
  const availability: QueryAvailability | undefined =
    status === 'loading'
      ? { status: 'loading', message: 'Authoring context is loading…' }
      : status === 'denied'
        ? { status: 'denied', message: 'You do not have permission to author this scope.' }
        : undefined;
  return (
    <div style={{ maxWidth: 850 }}>
      <label>
        Service state{' '}
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          {['ready', 'empty', 'loading', 'error', 'denied', 'unavailable'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <QueryInput
        document={document}
        onChange={(text) => setDocument({ text, version: document.version + 1 })}
        contextKey={`fixture:${status}`}
        availability={availability}
        request={async (request) =>
          status === 'ready' || status === 'loading'
            ? fixtureLanguage(request)
            : {
                documentVersion: request.document.version,
                contextKey: request.contextKey,
                status,
                completions: [],
                diagnostics: [],
                message: `${status === 'empty' ? 'No matching field/key/value suggestions' : status === 'denied' ? 'Access denied' : status === 'unavailable' ? 'Schema service offline; draft is retained' : 'Authoring request failed'}. Fixture state.`,
              }
        }
      />
    </div>
  );
}
export const ServiceStates: Story = { render: () => <StateDemo /> };

function BuilderDemo() {
  const [value, setValue] = useState<QueryGroup>({
    ...vm,
    children: [
      ...vm.children,
      {
        kind: 'group',
        id: 'branches',
        combinator: 'or',
        children: [
          {
            kind: 'clause',
            id: 'branch',
            field: 'branch-size',
            operator: 'gte',
            value: { kind: 'integer', value: '9007199254740993' },
          },
          tagMatch,
        ],
      },
    ],
  });
  return (
    <>
      <p>
        Schema-projected fixture fields, explicit null/absence operators, conditional branches,
        exact integer drafts and nested AND/OR groups. No client-generated guards or CEL execution.
      </p>
      <QueryBuilder
        value={value}
        onChange={setValue}
        fields={fields}
        contextKey="fixture:builder"
        allowNegation
        diagnostics={[
          {
            nodeId: 'branch',
            severity: 'info',
            message:
              'Host fixture: branch applicability must be checked before this field is used.',
          },
        ]}
      />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </>
  );
}
export const TypedNestedBuilder: Story = { render: () => <BuilderDemo /> };
export const SchemaDrift: Story = { render: () => <SchemaDriftDemo /> };
function SchemaDriftDemo() {
  const [value, setValue] = useState<QueryGroup>({
    ...empty,
    children: [
      {
        kind: 'clause',
        id: 'lost',
        field: 'removed-by-schema-revision',
        operator: 'eq',
        value: { kind: 'string', value: 'preserved' },
      },
    ],
  });
  const unresolved = value.children.some(
    (child) => child.kind === 'clause' && child.field === 'removed-by-schema-revision',
  );
  return (
    <>
      <QueryBuilder
        fields={fields}
        value={value}
        onChange={setValue}
        diagnostics={
          unresolved
            ? [
                {
                  severity: 'error',
                  message:
                    'The host fixture reports schema drift. Select a replacement field; the original condition is preserved until you replace it.',
                },
              ]
            : []
        }
      />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </>
  );
}
export const DeniedBuilder: Story = {
  render: () => (
    <QueryBuilder
      fields={fields}
      value={vm}
      onChange={() => {}}
      availability={{
        status: 'denied',
        message: 'Scope permission was revoked. No conditions can be changed.',
      }}
    />
  ),
};

const variables: readonly QueryVariable[] = [
  {
    id: 'environment',
    label: 'Environment',
    definition: {
      kind: 'string',
      description: 'This text is sent as a separate typed binding, never inserted into source.',
    },
    defaultValue: { kind: 'string', value: 'production' },
    required: true,
  },
  {
    id: 'minimum',
    label: 'Minimum CPU',
    definition: { kind: 'integer', constraint: 'Whole integer ≥ 1, host validated.' },
    defaultValue: { kind: 'integer', value: '4' },
  },
  { id: 'threshold', label: 'CPU ratio', definition: { kind: 'number', placeholder: '0.75' } },
  { id: 'enabled', label: 'Include stopped', definition: { kind: 'boolean' } },
  { id: 'since', label: 'Created since', definition: { kind: 'timestamp' } },
  {
    id: 'region',
    label: 'Region',
    definition: { kind: 'enum', loadOptions: fixtureOptions },
    description: 'Bounded async value fixture; change scope to cancel obsolete lookups.',
  },
  {
    id: 'tagValue',
    label: 'Tag value',
    definition: {
      kind: 'enum',
      options: [
        { id: 'empty', label: 'Empty tag value', value: '' },
        { id: 'prod', label: 'Production', value: 'production' },
      ],
    },
  },
  {
    id: 'names',
    label: 'Names',
    definition: {
      kind: 'list',
      options: [
        { id: 'alpha', label: 'Alpha instance', value: 'alpha' },
        { id: 'beta', label: 'Beta instance', value: 'beta' },
      ],
      description:
        'Explicit string drafts with bounded suggested values. Host owns collection admission.',
    },
  },
  {
    id: 'token',
    label: 'Sensitive token',
    definition: { kind: 'string' },
    sensitive: true,
    description: 'Masked and excluded from the story draft inspector.',
  },
];
function VariablesDemo() {
  const [value, setValue] = useState<Readonly<Record<string, QueryValue | undefined>>>({});
  const [scope, setScope] = useState('cloud');
  const [cycle, setCycle] = useState(false);
  return (
    <div style={{ maxWidth: 650 }}>
      <label>
        Scope
        <select value={scope} onChange={(event) => setScope(event.target.value)}>
          <option>cloud</option>
          <option>hypervisor</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={cycle}
          onChange={(event) => setCycle(event.target.checked)}
        />
        Show host dependency errors
      </label>
      <QueryVariables
        variables={variables.map((variable) => ({
          ...variable,
          error:
            cycle && variable.id === 'region'
              ? 'Dependency cycle: region → account → region. Change the saved definition.'
              : undefined,
        }))}
        value={value}
        onChange={setValue}
        contextKey={`fixture:${scope}`}
        diagnostics={
          cycle
            ? ['Host validation: minimumCpu requires an admitted integer. No query was executed.']
            : undefined
        }
      />
      <details>
        <summary>Non-sensitive drafts (not a saved/export document)</summary>
        <pre>
          {JSON.stringify(
            Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'token')),
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
export const TypedVariables: Story = { render: () => <VariablesDemo /> };
export const UnsupportedCodePreserved: Story = { render: () => <UnsupportedDemo /> };
function UnsupportedDemo() {
  const [value, setValue] = useState<QueryAuthoringValue>({
    mode: 'code',
    code: { text: 'resource.items.exists(item, item.price > minimum)', version: 1 },
    builder: empty,
  });
  return (
    <QueryAuthoring
      value={value}
      onChange={setValue}
      fields={fields}
      contextKey="fixture:unsupported"
      toBuilder={async () => ({
        status: 'unsupported',
        message:
          'This advanced expression is not representable in the supported builder subset. Continue in code mode.',
      })}
    />
  );
}

export const UnicodeExactDiagnostic: Story = { render: () => <UnicodeDiagnosticDemo /> };
function UnicodeDiagnosticDemo() {
  const [document, setDocument] = useState<QueryDocument>({
    text: '😀 e\u0301 bad 終',
    version: 1,
  });
  return (
    <QueryInput
      document={document}
      contextKey="fixture:unicode"
      onChange={(text) => setDocument({ text, version: document.version + 1 })}
      request={async (request) => ({
        documentVersion: request.document.version,
        contextKey: request.contextKey,
        status: 'empty',
        completions: [],
        diagnostics:
          request.document.text === '😀 e\u0301 bad 終'
            ? [
                {
                  id: 'unicode',
                  message: 'Replace exactly “bad”, preserving astral/combining text',
                  severity: 'error',
                  range: {
                    start: utf16ToUtf8(request.document.text, 6),
                    end: utf16ToUtf8(request.document.text, 9),
                    unit: 'utf8-byte',
                  },
                  fix: {
                    range: {
                      start: utf16ToUtf8(request.document.text, 6),
                      end: utf16ToUtf8(request.document.text, 9),
                      unit: 'utf8-byte',
                    },
                    text: 'name',
                  },
                },
              ]
            : [],
      })}
    />
  );
}

export const CrLfSourceAdapter: Story = { render: () => <CrLfDemo /> };
async function crLfFixture(request: QueryLanguageRequest): Promise<QueryLanguageResponse> {
  const range = { start: 7, end: 9, unit: 'utf8-byte' as const };
  const initial = request.document.text === 'a\r\n😀na';
  return {
    documentVersion: request.document.version,
    contextKey: request.contextKey,
    status: initial ? 'ready' : 'empty',
    completions: initial
      ? [
          {
            id: 'name',
            label: 'name',
            kind: 'field',
            description: 'Replaces source bytes 7–9, after CRLF and an astral character.',
            edit: { range, text: 'name' },
          },
        ]
      : [],
    diagnostics: initial
      ? [{ id: 'crlf', severity: 'warning', message: 'Select exact source span after CRLF', range }]
      : [],
  };
}
function CrLfDemo() {
  const [document, setDocument] = useState<QueryDocument>({ text: 'a\r\n😀na', version: 1 });
  return (
    <>
      <p>
        The source retains CRLF; the native textarea displays LF. Completion, diagnostics, native
        caret and pasted edits map explicitly between them.
      </p>
      <QueryInput
        document={document}
        onChange={(text) => setDocument({ text, version: document.version + 1 })}
        rows={3}
        contextKey="fixture:crlf"
        request={crLfFixture}
      />
      <pre aria-label="Exact source draft">{JSON.stringify(document.text)}</pre>
    </>
  );
}

export const EmptyMultilineNavigation: Story = { render: () => <EmptyMultilineDemo /> };
async function emptyFixture(request: QueryLanguageRequest): Promise<QueryLanguageResponse> {
  return {
    documentVersion: request.document.version,
    contextKey: request.contextKey,
    status: 'empty',
    completions: [],
    diagnostics: [],
    message: 'No suggestions; vertical/Shift+Arrow editing remains native.',
  };
}
function EmptyMultilineDemo() {
  const [document, setDocument] = useState<QueryDocument>({
    text: 'first line\nsecond line\nthird line',
    version: 1,
  });
  return (
    <QueryInput
      document={document}
      onChange={(text) => setDocument({ text, version: document.version + 1 })}
      rows={4}
      contextKey="fixture:empty"
      request={emptyFixture}
    />
  );
}

export const PermissionChangeDuringConversion: Story = {
  render: () => <PermissionConversionDemo />,
};
async function lateConversionFixture(): Promise<{ status: 'ready'; value: QueryGroup }> {
  // Deliberately ignores cancellation to exercise admission of late fixture responses.
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  return { status: 'ready', value: vm };
}
function PermissionConversionDemo() {
  const [value, setValue] = useState<QueryAuthoringValue>({
    mode: 'code',
    code: { text: source, version: 1 },
    builder: empty,
  });
  const [denied, setDenied] = useState(false);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={denied}
          onChange={(event) => setDenied(event.target.checked)}
        />
        Deny authoring while conversion is pending
      </label>
      <p>
        Click Builder, then deny authoring before the deliberately late fixture responds. Mode and
        source must remain unchanged.
      </p>
      <QueryAuthoring
        value={value}
        onChange={setValue}
        fields={fields}
        contextKey="fixture:permission"
        toBuilder={lateConversionFixture}
        availability={
          denied ? { status: 'denied', message: 'Authoring permission revoked.' } : undefined
        }
      />
      <output aria-label="Current mode">{value.mode}</output>
    </>
  );
}

export const OpaqueFieldIds: Story = { render: () => <OpaqueFieldIdsDemo /> };
function OpaqueFieldIdsDemo() {
  const [record, setRecord] = useState<QueryValue>({ kind: 'record', value: {} });
  const [variables, setVariables] = useState<Readonly<Record<string, QueryValue | undefined>>>({});
  const ids = ['__proto__', 'constructor', 'toString', 'other'];
  return (
    <>
      <p>
        Host-defined field and variable IDs are opaque. These valid IDs remain own data properties
        through sibling edits and JSON serialization.
      </p>
      <QueryValueInput
        definition={{
          kind: 'record',
          fields: ids.map((id) => ({ id, label: `Record ${id}`, definition: { kind: 'string' } })),
        }}
        label="Opaque compound value"
        value={record}
        onChange={(next) => {
          if (next) setRecord(next);
        }}
      />
      <QueryVariables
        variables={ids.map((id) => ({
          id,
          label: `Variable ${id}`,
          definition: { kind: 'string' },
        }))}
        value={variables}
        onChange={setVariables}
      />
      <pre aria-label="Opaque compound draft">{JSON.stringify(record, null, 2)}</pre>
      <pre aria-label="Opaque variable draft">{JSON.stringify(variables, null, 2)}</pre>
    </>
  );
}
