import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryValueInput } from './QueryValueInput';
import { QueryBuilder } from './QueryBuilder';
import type {
  QueryBuilderAnalysis,
  QueryConversionContext,
  QueryGroup,
  QueryOptionRequest,
  QueryOptionResponse,
  QueryValue,
} from './types';

const group: QueryGroup = { kind: 'group', id: 'root', combinator: 'and', children: [] };

describe('typed value controls', () => {
  it('preserves opaque record field IDs through sibling edits and JSON serialization', () => {
    function OpaqueRecord() {
      const [value, setValue] = useState<QueryValue>({ kind: 'record', value: {} });
      return (
        <>
          <QueryValueInput
            definition={{
              kind: 'record',
              fields: ['__proto__', 'constructor', 'toString', 'other'].map((id) => ({
                id,
                label: id,
                definition: { kind: 'string' },
              })),
            }}
            value={value}
            onChange={(next) => {
              if (next) setValue(next);
            }}
          />
          <output data-testid="opaque-record">{JSON.stringify(value)}</output>
        </>
      );
    }
    render(<OpaqueRecord />);
    for (const id of ['__proto__', 'constructor', 'toString', 'other'])
      fireEvent.change(screen.getByLabelText(id), { target: { value: `value:${id}` } });
    for (const id of ['__proto__', 'constructor', 'toString', 'other']) {
      expect(screen.getByLabelText(id)).toHaveValue(`value:${id}`);
      expect(screen.getByTestId('opaque-record')).toHaveTextContent(
        `"${id}":{"kind":"string","value":"value:${id}"}`,
      );
    }
  });
  it('does not read inherited record values as user-owned field drafts', () => {
    const values: Record<string, QueryValue | undefined> = {};
    Object.setPrototypeOf(values, { inherited: { kind: 'string', value: 'not an own draft' } });
    render(
      <QueryValueInput
        definition={{
          kind: 'record',
          fields: [{ id: 'inherited', label: 'Inherited field', definition: { kind: 'string' } }],
        }}
        value={{ kind: 'record', value: values }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Inherited field')).toHaveValue('');
  });
  it('edits host-declared correlated record inputs without encoding them as source syntax', async () => {
    const change = vi.fn();
    const definition = {
      kind: 'record' as const,
      fields: [
        { id: 'key', label: 'Tag key', definition: { kind: 'string' as const } },
        { id: 'value', label: 'Tag value', definition: { kind: 'string' as const } },
      ],
    };
    const { rerender } = render(
      <QueryValueInput
        definition={definition}
        value={{ kind: 'record', value: { key: { kind: 'string', value: 'environment' } } }}
        onChange={change}
      />,
    );
    fireEvent.change(screen.getByLabelText('Tag value'), { target: { value: 'production' } });
    expect(change).toHaveBeenLastCalledWith({
      kind: 'record',
      value: {
        key: { kind: 'string', value: 'environment' },
        value: { kind: 'string', value: 'production' },
      },
    });
    rerender(
      <QueryValueInput
        definition={definition}
        value={{
          kind: 'record',
          value: {
            key: { kind: 'string', value: 'environment' },
            value: { kind: 'string', value: 'production' },
          },
        }}
        onChange={change}
        disabled
      />,
    );
    expect(screen.getByLabelText('Tag key')).toBeDisabled();
    expect(screen.getByLabelText('Tag value')).toHaveValue('production');
  });
  it('distinguishes explicit empty enum values from unset through option identities', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const definition = {
      kind: 'enum' as const,
      options: [
        { id: 'empty', label: 'Empty tag value', value: '' },
        { id: 'different-id', label: 'Ordinary value', value: 'ordinary' },
      ],
    };
    const { rerender } = render(<QueryValueInput definition={definition} onChange={change} />);
    await user.selectOptions(
      screen.getByLabelText('Value'),
      screen.getByRole('option', { name: 'Empty tag value' }),
    );
    expect(change).toHaveBeenLastCalledWith({ kind: 'enum', value: '' });
    rerender(
      <QueryValueInput
        definition={definition}
        value={{ kind: 'enum', value: '' }}
        onChange={change}
      />,
    );
    expect(screen.getByLabelText('Value')).toHaveValue('option:empty');
    await user.selectOptions(screen.getByLabelText('Value'), '');
    expect(change).toHaveBeenLastCalledWith(undefined);
  });
  it('connects static and asynchronous list-item suggestions to their input', async () => {
    const { rerender } = render(
      <QueryValueInput
        definition={{
          kind: 'list',
          options: [{ id: 'west', label: 'West region', value: 'west' }],
        }}
        onChange={() => {}}
      />,
    );
    const listId = screen.getByLabelText('Value').getAttribute('list');
    expect(listId).toBeTruthy();
    expect(document.getElementById(listId ?? '')).toContainElement(
      screen.getByRole('option', { hidden: true }),
    );
    rerender(
      <QueryValueInput
        contextKey="new"
        definition={{
          kind: 'list',
          loadOptions: async ({ contextKey }) => ({
            contextKey,
            status: 'ready',
            options: [{ id: 'east', label: 'East region', value: 'east' }],
          }),
        }}
        onChange={() => {}}
      />,
    );
    await screen.findByText('1 available values.');
    expect(screen.getByLabelText('Value')).toHaveAttribute('list');
    expect(
      document.getElementById(screen.getByLabelText('Value').getAttribute('list') ?? ''),
    ).toHaveTextContent('');
    expect(screen.getByRole('option', { hidden: true })).toHaveAttribute('value', 'east');
  });
  it('preserves false, zero, empty text and timestamp drafts without coercion', () => {
    const change = vi.fn();
    const { rerender } = render(
      <QueryValueInput
        definition={{ kind: 'boolean' }}
        value={{ kind: 'boolean', value: false }}
        onChange={change}
      />,
    );
    expect(screen.getByLabelText('Value')).toHaveValue('false');
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: 'true' } });
    expect(change).toHaveBeenLastCalledWith({ kind: 'boolean', value: true });
    rerender(
      <QueryValueInput
        definition={{ kind: 'integer' }}
        value={{ kind: 'integer', value: '0' }}
        onChange={change}
      />,
    );
    expect(screen.getByLabelText('Value')).toHaveValue('0');
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '9007199254740993' } });
    expect(change).toHaveBeenLastCalledWith({ kind: 'integer', value: '9007199254740993' });
    rerender(
      <QueryValueInput
        definition={{ kind: 'string' }}
        value={{ kind: 'string', value: 'x' }}
        onChange={change}
      />,
    );
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '' } });
    expect(change).toHaveBeenLastCalledWith({ kind: 'string', value: '' });
    rerender(<QueryValueInput definition={{ kind: 'timestamp' }} onChange={change} />);
    fireEvent.change(screen.getByLabelText('Value'), {
      target: { value: '2026-10-18T12:34:56.123456789+02:00' },
    });
    expect(change).toHaveBeenLastCalledWith({
      kind: 'timestamp',
      value: '2026-10-18T12:34:56.123456789+02:00',
    });
  });
  it('adds and removes collection drafts, and avoids Enter acceptance during composition', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <QueryValueInput
        definition={{ kind: 'list' }}
        value={{ kind: 'list', value: ['first'] }}
        onChange={change}
      />,
    );
    await user.type(screen.getByLabelText('Value'), 'next');
    fireEvent.keyDown(screen.getByLabelText('Value'), { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByLabelText('Value'), { key: 'Enter' });
    expect(change).toHaveBeenLastCalledWith({ kind: 'list', value: ['first', 'next'] });
    rerender(
      <QueryValueInput
        definition={{ kind: 'list' }}
        value={{ kind: 'list', value: ['first', 'next'] }}
        onChange={change}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Remove Value item 1' }));
    expect(change).toHaveBeenLastCalledWith({ kind: 'list', value: ['next'] });
  });
  it('cancels obsolete dependent lookups and rejects late scope/search results', async () => {
    const requests: QueryOptionRequest[] = [];
    const resolvers: ((value: QueryOptionResponse) => void)[] = [];
    const loadOptions = (request: QueryOptionRequest) => {
      requests.push(request);
      return new Promise<QueryOptionResponse>((resolve) => resolvers.push(resolve));
    };
    const definition = { kind: 'enum' as const, loadOptions };
    const { rerender, unmount } = render(
      <QueryValueInput definition={definition} contextKey="west" onChange={() => {}} />,
    );
    await waitFor(() => expect(requests).toHaveLength(1));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search Value options' }), {
      target: { value: 'new' },
    });
    await waitFor(() => expect(requests).toHaveLength(2));
    rerender(<QueryValueInput definition={definition} contextKey="east" onChange={() => {}} />);
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[0]!.signal.aborted).toBe(true);
    expect(requests[1]!.signal.aborted).toBe(true);
    await act(async () => {
      resolvers[2]!({
        contextKey: 'east',
        status: 'ready',
        options: [{ id: 'new', label: 'Current option', value: 'new' }],
      });
      resolvers[0]!({
        contextKey: 'west',
        status: 'ready',
        options: [{ id: 'old', label: 'Old option', value: 'old' }],
      });
    });
    expect(screen.getByRole('option', { name: 'Current option' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Old option' })).not.toBeInTheDocument();
    unmount();
    expect(requests[2]!.signal.aborted).toBe(true);
  });
  it.each(['empty', 'error', 'denied', 'unavailable'] as const)(
    'shows %s value discovery distinctly',
    async (status) => {
      render(
        <QueryValueInput
          definition={{
            kind: 'enum',
            loadOptions: async ({ contextKey }) => ({
              contextKey,
              status,
              options: [],
              message: `${status} values`,
            }),
          }}
          onChange={() => {}}
        />,
      );
      expect(await screen.findByText(`${status} values`)).toBeInTheDocument();
      expect(screen.getByLabelText('Value')).toBeDisabled();
    },
  );
});

describe('host builder analysis', () => {
  it('displays only current host preview and diagnostics after changed builder input', async () => {
    const requests: QueryConversionContext[] = [];
    const resolvers: ((value: QueryBuilderAnalysis) => void)[] = [];
    const analyze = (_: QueryGroup, context: QueryConversionContext) => {
      requests.push(context);
      return new Promise<QueryBuilderAnalysis>((resolve) => resolvers.push(resolve));
    };
    const { rerender } = render(
      <QueryBuilder
        value={group}
        fields={[]}
        onChange={() => {}}
        contextKey="a"
        analyze={analyze}
      />,
    );
    await waitFor(() => expect(requests).toHaveLength(1));
    rerender(
      <QueryBuilder
        value={{ ...group, combinator: 'or' }}
        fields={[]}
        onChange={() => {}}
        contextKey="b"
        analyze={analyze}
      />,
    );
    await waitFor(() => expect(requests).toHaveLength(2));
    await act(async () => {
      resolvers[1]!({
        status: 'ready',
        preview: 'CURRENT HOST SOURCE',
        diagnostics: [{ severity: 'warning', message: 'Current host warning' }],
        explanation: 'Current explanation',
      });
      resolvers[0]!({ status: 'ready', preview: 'STALE HOST SOURCE', diagnostics: [] });
    });
    expect(requests[0]!.signal.aborted).toBe(true);
    expect(screen.getByText('CURRENT HOST SOURCE')).toBeInTheDocument();
    expect(screen.queryByText('STALE HOST SOURCE')).not.toBeInTheDocument();
    expect(screen.getByText('Current host warning')).toBeInTheDocument();
    expect(screen.getByText('Current explanation')).toBeInTheDocument();
  });
});
