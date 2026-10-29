import { useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  DataTable,
  ExploreWorkspace,
  QueryAuthoring,
  QueryVariables,
  VisualizationPanel,
  useDataTable,
  type DataTableColumnDef,
  type QueryAuthoringValue,
  type QueryGroup,
  type QueryValue,
} from '@omniviewdev/base-ui';
import { CelQueryEditor } from '../../components/cel-query-editor';
import {
  createCelDevelopmentAdapter,
  type CelBindings,
  type CelEvaluationResponse,
  type CelEvaluationResult,
  type CelFixtureProfile,
  type CelProfile,
  type CelProfilesResponse,
} from './index';

const meta = {
  title: 'Resource Intelligence/Integrated Workbench',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Monaco editor backed by the real loopback Go CEL development service. Run GOWORK=off go run . from tools/cel-language-service. Fixture resource schemas are provider-neutral; Pod is one profile. No canned completion/evaluation fallback or production Wails connection.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;
const empty: QueryGroup = { kind: 'group', id: 'root', combinator: 'and', children: [] };
const catalogAdapter = createCelDevelopmentAdapter('pod');
const columns: DataTableColumnDef<CelEvaluationResult, unknown>[] = [
  { accessorKey: 'label', header: 'Resource' },
  { accessorKey: 'provider', header: 'Provider' },
  { accessorKey: 'resource', header: 'Type' },
  {
    id: 'outcome',
    header: 'CEL outcome',
    cell: ({ row }) =>
      row.original.error ??
      (row.original.matched === true
        ? 'Matched'
        : row.original.matched === false
          ? 'Did not match'
          : 'Not evaluated'),
  },
];
const noResults: CelEvaluationResult[] = [];
function defaultValues(profile: CelProfile): Readonly<Record<string, QueryValue | undefined>> {
  return Object.fromEntries(
    profile.parameters.map((parameter) => [
      parameter.name,
      parameter.type === 'bool'
        ? { kind: 'boolean', value: parameter.value === 'true' }
        : { kind: parameter.type === 'int64' ? 'integer' : 'string', value: parameter.value },
    ]),
  );
}
function bindingsFor(
  profile: CelProfile,
  values: Readonly<Record<string, QueryValue | undefined>>,
): CelBindings {
  return Object.fromEntries(
    profile.parameters.flatMap((parameter) => {
      const value = Object.hasOwn(values, parameter.name) ? values[parameter.name] : undefined;
      if (!value || (typeof value.value !== 'string' && typeof value.value !== 'boolean'))
        return [];
      return [[parameter.name, { kind: parameter.type, value: String(value.value) }]];
    }),
  );
}
function Workbench() {
  const [catalog, setCatalog] = useState<CelProfilesResponse>();
  const [catalogError, setCatalogError] = useState<string>();
  const [retry, setRetry] = useState(0);
  const [profileId, setProfileId] = useState<CelFixtureProfile>('pod');
  const [value, setValue] = useState<QueryAuthoringValue>({
    mode: 'code',
    code: { text: '', version: 1 },
    builder: empty,
  });
  const [variables, setVariables] = useState<Readonly<Record<string, QueryValue | undefined>>>({});
  const [outcome, setOutcome] = useState<CelEvaluationResponse>();
  const [runError, setRunError] = useState<string>();
  const [running, setRunning] = useState(false);
  const generation = useRef(0);
  const active = useRef<AbortController | null>(null);
  const adapter = useMemo(() => createCelDevelopmentAdapter(profileId), [profileId]);
  useEffect(() => () => { void adapter.dispose(); }, [adapter]);
  const profile = catalog?.profiles.find((candidate) => candidate.id === profileId);
  const contextKey = `development:${profileId}`;
  const latest = useRef({ document: value.code, contextKey, variables });
  latest.current = { document: value.code, contextKey, variables };
  useEffect(() => {
    const abort = new AbortController();
    setCatalogError(undefined);
    catalogAdapter
      .profiles(abort.signal)
      .then((next) => {
        if (abort.signal.aborted) return;
        setCatalog(next);
        const initial = next.profiles.find((candidate) => candidate.id === 'pod');
        if (initial) {
          setValue((current) => ({
            ...current,
            code: {
              text: current.code.text || initial.examples[0]?.expression || '',
              version: current.code.version + 1,
            },
          }));
          setVariables(defaultValues(initial));
        }
      })
      .catch((error: unknown) => {
        if (!abort.signal.aborted)
          setCatalogError(
            error instanceof Error ? error.message : 'CEL development service unavailable.',
          );
      });
    return () => abort.abort();
  }, [retry]);
  useEffect(() => {
    active.current?.abort();
    generation.current++;
    setRunning(false);
    setOutcome(undefined);
    setRunError(undefined);
  }, [value.code.version, contextKey, variables]);
  useEffect(
    () => () => {
      active.current?.abort();
    },
    [],
  );
  function selectProfile(next: CelProfile) {
    setProfileId(next.id);
    setValue((current) => ({
      mode: 'code',
      code: { text: next.examples[0]?.expression || '', version: current.code.version + 1 },
      builder: empty,
    }));
    setVariables(defaultValues(next));
  }
  async function evaluate() {
    if (!profile || value.mode !== 'code') return;
    active.current?.abort();
    const abort = new AbortController();
    active.current = abort;
    const sequence = ++generation.current;
    const snapshot = latest.current;
    const isCurrent = () =>
      !abort.signal.aborted &&
      generation.current === sequence &&
      latest.current.document === snapshot.document &&
      latest.current.contextKey === snapshot.contextKey &&
      latest.current.variables === snapshot.variables;
    setRunning(true);
    setRunError(undefined);
    setOutcome(undefined);
    try {
      const response = await adapter.evaluate(
        {
          document: value.code,
          contextKey,
          cursor: { offset: new TextEncoder().encode(value.code.text).length, unit: 'utf8-byte' },
          signal: abort.signal,
        },
        bindingsFor(profile, variables),
      );
      if (!isCurrent()) return;
      if (response.documentVersion !== value.code.version || response.contextKey !== contextKey)
        throw new Error('The evaluation response belongs to an obsolete document or context.');
      setOutcome(response);
    } catch (error: unknown) {
      if (isCurrent()) setRunError(error instanceof Error ? error.message : 'Evaluation failed.');
    } finally {
      if (isCurrent()) setRunning(false);
    }
  }
  const table = useDataTable({
    data: outcome?.results ?? noResults,
    columns,
    getRowId: (row) => row.fixtureId,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });
  return (
    <div style={{ padding: 24, minWidth: 0, width: '100%' }}>
      <p>
        Real CEL checking and evaluation against development fixture resources. No connection to
        your infrastructure.
      </p>
      {catalogError ? (
        <div role="alert">
          <p>{catalogError}</p>
          <p>
            Start the loopback service: <code>GOWORK=off go run .</code> in{' '}
            <code>tools/cel-language-service</code>.
          </p>
          <Button onClick={() => setRetry((current) => current + 1)}>
            Reconnect development service
          </Button>
        </div>
      ) : null}
      <ExploreWorkspace
        title="CEL resource exploration"
        scope={
          <fieldset>
            <legend>Resource profile</legend>
            {catalog?.profiles.map((candidate) => (
              <label key={candidate.id} style={{ display: 'block' }}>
                <input
                  type="radio"
                  name="cel-profile"
                  checked={profileId === candidate.id}
                  onChange={() => selectProfile(candidate)}
                />
                {candidate.label}
              </label>
            ))}
            <p>{profile?.description ?? 'Loading the development schema catalog…'}</p>
            <p>{profile?.numericProfile}</p>
            <details>
              <summary>Engine and limits</summary>
              <p>{catalog?.engine}</p>
              <ul>
                {catalog?.limits.map((limit) => (
                  <li key={limit}>{limit}</li>
                ))}
              </ul>
            </details>
          </fieldset>
        }
        query={
          <>
            <label>
              CEL example
              <select
                aria-label="CEL example"
                value=""
                disabled={!profile}
                onChange={(event) => {
                  const example = profile?.examples.find(
                    (candidate) => candidate.id === event.target.value,
                  );
                  if (example)
                    setValue((current) => ({
                      ...current,
                      mode: 'code',
                      code: { text: example.expression, version: current.code.version + 1 },
                    }));
                }}
              >
                <option value="">Choose an expression…</option>
                {profile?.examples.map((example) => (
                  <option key={example.id} value={example.id}>
                    {example.label}
                  </option>
                ))}
              </select>
            </label>
            <QueryAuthoring
              value={value}
              onChange={setValue}
              fields={[]}
              contextKey={contextKey}
              renderEditor={(props) => (
                <CelQueryEditor
                  {...props}
                  check={adapter.check}
                  hover={adapter.hover}
                  signature={adapter.signature}
                  onDocumentClose={(uri) => { void adapter.closeDocument(uri); }}
                />
              )}
              request={adapter.languageService}
              running={running}
              onRun={profile && !catalogError ? () => void evaluate() : undefined}
              onCancel={() => {
                active.current?.abort();
                generation.current++;
                setRunning(false);
                setRunError('Evaluation canceled.');
              }}
              state={{
                status: catalogError ? 'unavailable' : running ? 'loading' : 'snapshot',
                message: catalogError
                  ? 'Development language service disconnected; no fallback results.'
                  : running
                    ? 'Evaluating with CEL…'
                    : 'Go CEL development service · fixture snapshot, not a live resource lease',
              }}
            />
            <p>
              Code/builder conversion is unavailable for this development service. Existing
              standalone builder stories remain available; unsupported code is never rewritten.
            </p>
          </>
        }
        variables={
          <QueryVariables
            contextKey={contextKey}
            variables={
              profile?.parameters.map((parameter) => ({
                id: parameter.name,
                label: parameter.name,
                required: true,
                description: parameter.description,
                definition: {
                  kind:
                    parameter.type === 'int64'
                      ? 'integer'
                      : parameter.type === 'bool'
                        ? 'boolean'
                        : 'string',
                },
              })) ?? []
            }
            value={variables}
            onChange={setVariables}
          />
        }
        results={
          <VisualizationPanel
            title="CEL evaluation results"
            status={
              runError
                ? 'error'
                : outcome?.status === 'error'
                  ? 'error'
                  : running
                    ? 'loading'
                    : outcome
                      ? 'ready'
                      : 'empty'
            }
            description={
              runError ??
              outcome?.message ??
              (outcome
                ? 'Actual CEL outcomes for the selected fixture resources. Errors are distinct from nonmatches.'
                : 'Run an expression to evaluate it against the selected fixture resources.')
            }
            detail={outcome?.diagnostics.map((diagnostic) => diagnostic.message).join('\n')}
          >
            {outcome?.diagnostics.map((diagnostic) => (
              <p role="alert" key={diagnostic.id}>
                {diagnostic.message}
              </p>
            ))}
            <DataTable.Root table={table}>
              <DataTable.Container height={280}>
                <DataTable.Header />
                <DataTable.VirtualBody />
              </DataTable.Container>
            </DataTable.Root>
          </VisualizationPanel>
        }
      />
    </div>
  );
}
export const CompleteInterface: Story = { render: () => <Workbench /> };
