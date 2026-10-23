import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryBuilder } from './QueryBuilder';
import { QueryAuthoring } from './QueryAuthoring';
import { QueryVariables } from './QueryVariables';
import type {
  QueryAuthoringValue,
  QueryField,
  QueryGroup,
  QueryValue,
  QueryEditorRenderProps,
  QueryVariable,
} from './types';

const fields: QueryField[] = [
  {
    id: 'cpu',
    label: 'CPU count',
    type: 'integer',
    description: 'Virtual processor count',
    operators: [
      { id: 'gte', label: 'at least', value: { kind: 'integer' } },
      { id: 'present', label: 'is present' },
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
            { id: 'running', label: 'Running', value: 'running' },
            { id: 'stopped', label: 'Stopped', value: 'stopped' },
          ],
        },
      },
    ],
  },
];
const initial: QueryGroup = { kind: 'group', id: 'root', combinator: 'and', children: [] };
function Builder() {
  const [value, setValue] = useState(initial);
  return (
    <>
      <QueryBuilder value={value} fields={fields} onChange={setValue} />
      <output data-testid="document">{JSON.stringify(value)}</output>
    </>
  );
}

describe('QueryBuilder', () => {
  it('adds typed field/operator/value clauses without serializing or rounding integers', async () => {
    const user = userEvent.setup();
    render(<Builder />);
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    await user.selectOptions(screen.getByLabelText('Field'), 'cpu');
    await user.selectOptions(screen.getByLabelText('Operator'), 'gte');
    await user.type(screen.getByLabelText('Value'), '9007199254740993');
    expect(screen.getByTestId('document')).toHaveTextContent('9007199254740993');
    await user.selectOptions(screen.getByLabelText('Operator'), 'present');
    expect(screen.queryByLabelText('Value')).not.toBeInTheDocument();
    expect(screen.getByTestId('document')).not.toHaveTextContent('9007199254740993');
  });
  it('supports nested OR groups, sibling reorder, removal and clear field-dependent values', async () => {
    const user = userEvent.setup();
    render(<Builder />);
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    await user.selectOptions(screen.getByLabelText('Field'), 'state');
    await user.selectOptions(screen.getByLabelText('Operator'), 'eq');
    await user.selectOptions(
      screen.getByLabelText('Value'),
      screen.getByRole('option', { name: 'Running' }),
    );
    await user.click(screen.getByRole('button', { name: 'Add group' }));
    const groups = screen.getAllByRole('group', { name: /Condition group/ });
    await user.selectOptions(within(groups[1]!).getByLabelText('Match'), 'or');
    await user.click(within(groups[1]!).getByRole('button', { name: 'Add condition' }));
    expect(screen.getByTestId('document')).toHaveTextContent('"combinator":"or"');
    await user.click(screen.getByRole('button', { name: 'Move group up' }));
    expect(JSON.parse(screen.getByTestId('document').textContent ?? '{}').children[0].kind).toBe(
      'group',
    );
    await user.click(screen.getByRole('button', { name: 'Remove group' }));
    await user.selectOptions(screen.getByLabelText('Field'), 'cpu');
    expect(screen.getByTestId('document')).not.toHaveTextContent('running');
    await user.click(screen.getByRole('button', { name: 'Remove condition' }));
    expect(screen.getByText('No conditions. Add a condition or group.')).toBeInTheDocument();
  });
  it('preserves unavailable fields and values rather than silently deleting them', () => {
    render(
      <QueryBuilder
        fields={[]}
        onChange={() => {}}
        value={{
          ...initial,
          children: [
            {
              kind: 'clause',
              id: 'c',
              field: 'removed',
              operator: 'eq',
              value: { kind: 'string', value: 'kept' },
            },
          ],
        }}
      />,
    );
    expect(screen.getByText('Unavailable field: removed')).toBeInTheDocument();
    expect(screen.getByText(/This field is no longer available/)).toBeInTheDocument();
  });
  it('disables all mutation controls when denied', () => {
    render(
      <QueryBuilder
        fields={fields}
        value={initial}
        onChange={() => {}}
        availability={{ status: 'denied', message: 'Not allowed' }}
      />,
    );
    expect(screen.getByText('Not allowed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add condition' })).toBeDisabled();
  });
});

describe('safe mode conversion', () => {
  it('retains unsupported code unchanged and presents the host reason', async () => {
    const change = vi.fn();
    const code = 'resource.items.exists(x, x.price > minimum)';
    render(
      <QueryAuthoring
        value={{ mode: 'code', code: { text: code, version: 1 }, builder: initial }}
        onChange={change}
        fields={fields}
        contextKey="cloud"
        toBuilder={async () => ({
          status: 'unsupported',
          message: 'Correlated collection expression is not supported in builder mode.',
        })}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Builder' }));
    expect(await screen.findByText(/Correlated collection/)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue(code);
    expect(change).not.toHaveBeenCalled();
  });
  it.each(['disabled', 'denied', 'unavailable'] as const)(
    'aborts pending mode conversion when authoring becomes %s',
    async (blockedState) => {
      let resolve: ((result: { status: 'ready'; value: QueryGroup }) => void) | undefined;
      let signal: AbortSignal | undefined;
      const convert = (_: unknown, context: { signal: AbortSignal }) => {
        signal = context.signal;
        return new Promise<{ status: 'ready'; value: QueryGroup }>((done) => {
          resolve = done;
        });
      };
      const onChange = vi.fn();
      const value: QueryAuthoringValue = {
        mode: 'code',
        code: { text: 'x', version: 1 },
        builder: initial,
      };
      const props = { value, onChange, fields, contextKey: 'same', toBuilder: convert };
      const { rerender } = render(<QueryAuthoring {...props} />);
      fireEvent.click(screen.getByRole('button', { name: 'Builder' }));
      rerender(
        <QueryAuthoring
          {...props}
          disabled={blockedState === 'disabled'}
          availability={blockedState === 'disabled' ? undefined : { status: blockedState }}
        />,
      );
      expect(signal?.aborted).toBe(true);
      await act(async () => resolve?.({ status: 'ready', value: initial }));
      expect(onChange).not.toHaveBeenCalled();
    },
  );
  it('uses explicit conversion callbacks in both directions and preserves controlled drafts', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [value, setValue] = useState<QueryAuthoringValue>({
        mode: 'code',
        code: { text: 'host-source', version: 2 },
        builder: initial,
      });
      return (
        <QueryAuthoring
          value={value}
          onChange={setValue}
          fields={fields}
          contextKey="vm"
          toBuilder={async () => ({ status: 'ready', value: initial })}
          toCode={async () => ({ status: 'ready', value: 'host-generated-source' })}
        />
      );
    }
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Builder' }));
    await screen.findByText('No conditions. Add a condition or group.');
    await user.click(screen.getByRole('button', { name: 'Code' }));
    await waitForValue('host-generated-source');
  });
  it('injects the controlled code surface while preserving builder drafts and host run ownership', () => {
    const change = vi.fn();
    const run = vi.fn();
    const value: QueryAuthoringValue = {
      mode: 'code', code: { text: 'cpu > 1', version: 7 }, builder: initial,
    };
    const editor = vi.fn((props: QueryEditorRenderProps) => (
      <input
        aria-label="Injected CEL editor"
        value={props.document.text}
        disabled={props.disabled || props.availability?.status === 'denied'}
        onChange={event => props.onChange(event.target.value)}
        onKeyDown={event => { if (event.ctrlKey && event.key === 'Enter') props.onSubmit?.(); }}
      />
    ));
    const props = { value, onChange: change, onRun: run, fields, contextKey: 'vm', renderEditor: editor };
    const { rerender } = render(<QueryAuthoring {...props} />);
    const input = screen.getByRole('textbox', { name: 'Injected CEL editor' });
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    fireEvent.change(input, { target: { value: 'cpu > minimumCpu' } });
    expect(change).toHaveBeenCalledWith({
      ...value, code: { text: 'cpu > minimumCpu', version: 8 },
    });
    expect(change.mock.calls[0]?.[0].builder).toBe(initial);
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
    expect(run).toHaveBeenCalledWith(value);
    rerender(<QueryAuthoring {...props} availability={{ status: 'denied', message: 'Denied.' }} />);
    expect(screen.getByRole('textbox', { name: 'Injected CEL editor' })).toBeDisabled();
    expect(editor.mock.lastCall?.[0]).toMatchObject({
      contextKey: 'vm', document: value.code, availability: { status: 'denied' },
    });
  });
  it('cancels conversion when the scope changes and ignores late conversion', async () => {
    let resolve: ((value: { status: 'ready'; value: QueryGroup }) => void) | undefined;
    let signal: AbortSignal | undefined;
    const convert = (_: unknown, context: { signal: AbortSignal }) => {
      signal = context.signal;
      return new Promise<{ status: 'ready'; value: QueryGroup }>((done) => {
        resolve = done;
      });
    };
    const change = vi.fn();
    const value: QueryAuthoringValue = {
      mode: 'code',
      code: { text: 'x', version: 1 },
      builder: initial,
    };
    const { rerender } = render(
      <QueryAuthoring
        value={value}
        onChange={change}
        fields={fields}
        contextKey="a"
        toBuilder={convert}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Builder' }));
    rerender(
      <QueryAuthoring
        value={value}
        onChange={change}
        fields={fields}
        contextKey="b"
        toBuilder={convert}
      />,
    );
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      resolve?.({ status: 'ready', value: initial });
    });
    expect(change).not.toHaveBeenCalled();
  });
});
async function waitForValue(value: string) {
  expect(await screen.findByDisplayValue(value)).toBeInTheDocument();
}

describe('QueryVariables', () => {
  it('preserves opaque variable IDs and ignores inherited values', () => {
    function OpaqueVariables() {
      const [value, setValue] = useState<Readonly<Record<string, QueryValue | undefined>>>({});
      return (
        <>
          <QueryVariables
            variables={['__proto__', 'constructor', 'toString', 'other'].map((id) => ({
              id,
              label: id,
              definition: { kind: 'string' },
            }))}
            value={value}
            onChange={setValue}
          />
          <output data-testid="opaque-variables">{JSON.stringify(value)}</output>
        </>
      );
    }
    render(<OpaqueVariables />);
    for (const id of ['__proto__', 'constructor', 'toString', 'other'])
      fireEvent.change(screen.getByLabelText(id), { target: { value: `value:${id}` } });
    for (const id of ['__proto__', 'constructor', 'toString', 'other']) {
      expect(screen.getByLabelText(id)).toHaveValue(`value:${id}`);
      expect(screen.getByTestId('opaque-variables')).toHaveTextContent(
        `"${id}":{"kind":"string","value":"value:${id}"}`,
      );
    }
  });
  it('does not display inherited variable values or their unset actions', () => {
    const value: Record<string, QueryValue | undefined> = {};
    Object.setPrototypeOf(value, {
      inherited: { kind: 'string', value: 'not a supplied binding' },
    });
    render(
      <QueryVariables
        variables={[
          { id: 'inherited', label: 'Inherited variable', definition: { kind: 'string' } },
        ]}
        value={value}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Inherited variable')).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'Unset Inherited variable' }),
    ).not.toBeInTheDocument();
  });
  it('forwards typed drafts separately from query source and masks sensitive variables', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const variables: QueryVariable[] = [
      { id: 'minimum', label: 'Minimum CPU', definition: { kind: 'integer' }, required: true },
      { id: 'secret', label: 'API token', definition: { kind: 'string' }, sensitive: true },
    ];
    render(<QueryVariables variables={variables} value={{}} onChange={change} />);
    await user.type(screen.getByLabelText(/Minimum CPU/), '9');
    expect(change).toHaveBeenCalledWith({ minimum: { kind: 'integer', value: '9' } });
    expect(screen.getByLabelText('API token')).toHaveAttribute('type', 'password');
  });
  it('renders host constraint/cycle errors, defaults and explicit reset without binding semantics', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <QueryVariables
        variables={[
          {
            id: 'region',
            label: 'Region',
            definition: { kind: 'string' },
            defaultValue: { kind: 'string', value: 'west' },
            description: 'Provider location',
            error: 'Dependency cycle: region → account → region',
          },
        ]}
        value={{ region: { kind: 'string', value: 'east' } }}
        onChange={change}
      />,
    );
    expect(screen.getByText(/Dependency cycle/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset Region to default' }));
    expect(change).toHaveBeenCalledWith({ region: { kind: 'string', value: 'west' } });
  });
});
