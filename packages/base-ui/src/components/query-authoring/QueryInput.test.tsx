import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryInput } from './QueryInput';
import { applyQueryEdit, utf16ToUtf8, utf8ToUtf16 } from './offsets';
import type { QueryDocument, QueryLanguageRequest, QueryLanguageResponse } from './types';

const response = (request: QueryLanguageRequest, label = 'name'): QueryLanguageResponse => ({
  documentVersion: request.document.version,
  contextKey: request.contextKey,
  status: 'ready',
  completions: [
    {
      id: label,
      label,
      kind: 'field',
      type: 'string',
      description: 'Display name',
      edit: { range: { start: 0, end: 2, unit: 'utf8-byte' }, text: label },
    },
  ],
  diagnostics: [],
});
function Controlled({
  request,
}: {
  request: (request: QueryLanguageRequest) => Promise<QueryLanguageResponse>;
}) {
  const [document, setDocument] = useState<QueryDocument>({ text: 'na == "x"', version: 1 });
  return (
    <QueryInput
      document={document}
      contextKey="cloud"
      request={request}
      debounceMs={0}
      onChange={(text) => setDocument((old) => ({ text, version: old.version + 1 }))}
    />
  );
}

describe('UTF-8 exact edits', () => {
  it('replaces a middle span without damaging emoji or suffixes', () => {
    expect(utf16ToUtf8('😀na終', 2)).toBe(4);
    expect(utf8ToUtf16('😀na終', 6)).toBe(4);
    expect(
      applyQueryEdit('😀na終', { range: { start: 4, end: 6, unit: 'utf8-byte' }, text: 'name' }),
    ).toEqual({ text: '😀name終', selection: 6 });
  });
  it('preserves combining marks as separate code points without normalization', () => {
    const source = '😀 e\u0301 bad 終';
    expect(utf16ToUtf8(source, 6)).toBe(9);
    expect(
      applyQueryEdit(source, { range: { start: 9, end: 12, unit: 'utf8-byte' }, text: 'name' })
        .text,
    ).toBe('😀 e\u0301 name 終');
    expect(() => utf8ToUtf16(source, 7)).toThrow();
  });
  it('rejects offsets inside Unicode sequences and invalid half-open spans', () => {
    expect(() => utf8ToUtf16('😀x', 1)).toThrow();
    expect(() => utf16ToUtf8('😀x', 1)).toThrow();
    expect(() =>
      applyQueryEdit('abc', { range: { start: 2, end: 1, unit: 'utf8-byte' }, text: '' }),
    ).toThrow();
  });
});

describe('QueryInput', () => {
  it('keeps distinct document identities when two inputs share a language service', async () => {
    const requests: QueryLanguageRequest[] = [];
    const request = async (value: QueryLanguageRequest) => {
      requests.push(value);
      return response(value, value.document.uri ?? 'missing identity');
    };
    render(<>
      <QueryInput document={{ text: 'na', version: 1, uri: 'query://first' }}
        label="First query" contextKey="cloud" request={request} onChange={() => {}} debounceMs={0} />
      <QueryInput document={{ text: 'na', version: 1, uri: 'query://second' }}
        label="Second query" contextKey="cloud" request={request} onChange={() => {}} debounceMs={0} />
    </>);
    fireEvent.focus(screen.getByRole('combobox', { name: 'First query' }));
    expect(await screen.findByRole('option', { name: /query:\/\/first/ })).toBeInTheDocument();
    fireEvent.focus(screen.getByRole('combobox', { name: 'Second query' }));
    expect(await screen.findByRole('option', { name: /query:\/\/second/ })).toBeInTheDocument();
    expect(requests.map(item => item.document.uri)).toEqual(['query://first', 'query://second']);
  });

  it('excludes snippet candidates before limiting and selecting native suggestions', async () => {
    const user = userEvent.setup();
    render(<Controlled request={async request => ({
      ...response(request),
      completions: [
        { ...response(request).completions[0]!, id: 'snippet', label: 'Snippet',
          insertTextFormat: 'snippet', edit: {
            range: { start: 0, end: 2, unit: 'utf8-byte' }, text: '${1:item}',
          } },
        response(request).completions[0]!,
      ],
    })} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await screen.findByRole('option', { name: /name/ });
    expect(screen.queryByRole('option', { name: /Snippet/ })).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('name == "x"');
    expect(input).not.toHaveValue(expect.stringContaining('${'));
  });

  it('accepts a typed completion with Enter, preserves the suffix and focus', async () => {
    const user = userEvent.setup();
    render(<Controlled request={async (request) => response(request)} />);
    const input = screen.getByRole('combobox', { name: 'Query expression' });
    await user.click(input);
    expect(await screen.findByRole('option', { name: /name/ })).toHaveTextContent('string');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('name == "x"');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('supports mouse acceptance, Escape dismissal and Tab without trapping focus', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Controlled request={async (request) => response(request)} />
        <button>Next</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.click(await screen.findByRole('option'));
    expect(input).toHaveValue('name == "x"');
    await user.keyboard('{Control>} {Control/}');
    fireEvent.keyDown(input, { key: ' ', ctrlKey: true });
    await screen.findByRole('option');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });
  it('aborts obsolete requests and rejects late results after edits, scope changes and unmount', async () => {
    const requests: QueryLanguageRequest[] = [];
    const resolvers: ((value: QueryLanguageResponse) => void)[] = [];
    const request = (value: QueryLanguageRequest) => {
      requests.push(value);
      return new Promise<QueryLanguageResponse>((resolve) => resolvers.push(resolve));
    };
    const { rerender, unmount } = render(
      <QueryInput
        document={{ text: 'na', version: 1 }}
        contextKey="a"
        onChange={() => {}}
        request={request}
        debounceMs={0}
      />,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    await waitFor(() => expect(requests).toHaveLength(1));
    rerender(
      <QueryInput
        document={{ text: 'cpu', version: 2 }}
        contextKey="b"
        onChange={() => {}}
        request={request}
        debounceMs={0}
      />,
    );
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[0]!.signal.aborted).toBe(true);
    await act(async () => {
      resolvers[0]!(response(requests[0]!, 'OLD'));
      resolvers[1]!(response(requests[1]!, 'NEW'));
    });
    expect(await screen.findByRole('option', { name: /NEW/ })).toBeInTheDocument();
    expect(screen.queryByText('OLD')).not.toBeInTheDocument();
    unmount();
    expect(requests[1]!.signal.aborted).toBe(true);
  });
  it('does not accept or submit during IME composition', async () => {
    const submit = vi.fn();
    render(
      <QueryInput
        document={{ text: 'na', version: 1 }}
        onChange={() => {}}
        contextKey="x"
        request={async (request) => response(request)}
        onSubmit={submit}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await screen.findByRole('option');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(submit).not.toHaveBeenCalled();
    expect(input).toHaveValue('na');
    fireEvent.compositionEnd(input);
  });
  it.each(['denied', 'unavailable', 'error', 'empty'] as const)(
    'renders %s distinctly without fake options',
    async (status) => {
      render(
        <Controlled
          request={async (request) => ({
            ...response(request),
            status,
            completions: [],
            message: `${status} details`,
          })}
        />,
      );
      fireEvent.focus(screen.getByRole('combobox'));
      expect(await screen.findByText(`${status} details`)).toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    },
  );
  it('navigates enabled options without submitting and submits only after dismissal', async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(
      <QueryInput
        document={{ text: 'na', version: 1 }}
        contextKey="x"
        onChange={() => {}}
        onSubmit={submit}
        debounceMs={0}
        request={async (request) => {
          const first = response(request).completions[0]!;
          return {
            ...response(request),
            completions: [
              { ...first, id: 'denied', label: 'Denied field', disabledReason: 'No access' },
              first,
              { ...first, id: 'cpu', label: 'cpu', edit: { ...first.edit, text: 'cpu' } },
            ],
          };
        }}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await screen.findByRole('option', { name: /cpu/ });
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: /cpu/ })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: /^name/ })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Escape}{Enter}');
    expect(submit).toHaveBeenCalledOnce();
  });
  it('preserves multiline paste and Shift+Enter with native undo-compatible editing', async () => {
    const user = userEvent.setup();
    render(<Controlled request={async (request) => ({ ...response(request), completions: [] })} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Control>}a{Control/}');
    await user.paste('😀 first\nsecond');
    expect(input).toHaveValue('😀 first\nsecond');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(input).toHaveValue('😀 first\nsecond\n');
  });
  it('retains current diagnostics while refocusing their exact source span', async () => {
    const user = userEvent.setup();
    render(
      <QueryInput
        document={{ text: '😀bad', version: 1 }}
        contextKey="x"
        onChange={() => {}}
        debounceMs={50}
        request={async (request) => ({
          ...response(request),
          completions: [],
          diagnostics: [
            {
              id: 'error',
              severity: 'error',
              message: 'Current diagnostic',
              range: { start: 4, end: 7, unit: 'utf8-byte' },
              fix: { range: { start: 4, end: 7, unit: 'utf8-byte' }, text: 'name' },
            },
          ],
        })}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('button', { name: 'Current diagnostic' }));
    expect(
      screen.getByRole('button', { name: 'Apply fix: Current diagnostic' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });
  it('rejects invalid host edits without changing the draft', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <QueryInput
        document={{ text: '😀bad', version: 1 }}
        contextKey="x"
        onChange={change}
        debounceMs={0}
        request={async (request) => ({
          ...response(request),
          completions: [
            {
              id: 'broken',
              label: 'Broken edit',
              kind: 'field',
              edit: { range: { start: 1, end: 4, unit: 'utf8-byte' }, text: 'x' },
            },
          ],
        })}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('option');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('invalid UTF-8 edit range');
    expect(change).not.toHaveBeenCalled();
  });
  it.each(['loading', 'empty', 'denied', 'unavailable', 'disabled-options'] as const)(
    'preserves native vertical/shift caret movement for %s suggestions',
    async (state) => {
      render(
        <QueryInput
          document={{ text: 'first\nsecond', version: 1 }}
          contextKey="x"
          rows={3}
          onChange={() => {}}
          debounceMs={0}
          request={async (request) =>
            state === 'loading'
              ? new Promise<QueryLanguageResponse>(() => {})
              : {
                  ...response(request),
                  status: state === 'disabled-options' ? 'ready' : state,
                  completions:
                    state === 'disabled-options'
                      ? response(request).completions.map((item) => ({
                          ...item,
                          disabledReason: 'Denied',
                        }))
                      : [],
                }
          }
        />,
      );
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      if (state !== 'loading')
        await waitFor(() =>
          expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'false'),
        );
      expect(fireEvent.keyDown(input, { key: 'ArrowUp', shiftKey: true })).toBe(true);
      expect(fireEvent.keyDown(input, { key: 'ArrowDown' })).toBe(true);
    },
  );
  it('maps CRLF source cursors, diagnostic selections, and edit carets to LF textarea positions', async () => {
    const requests: QueryLanguageRequest[] = [];
    const user = userEvent.setup();
    function CrLf() {
      const [document, setDocument] = useState<QueryDocument>({ text: 'a\r\n😀na', version: 1 });
      return (
        <QueryInput
          document={document}
          contextKey="x"
          debounceMs={0}
          onChange={(text) => setDocument({ text, version: document.version + 1 })}
          request={async (request) => {
            requests.push(request);
            return {
              ...response(request),
              completions: [
                {
                  id: 'name',
                  label: 'name',
                  kind: 'field',
                  edit: { range: { start: 7, end: 9, unit: 'utf8-byte' }, text: 'name' },
                },
              ],
              diagnostics: [
                {
                  id: 'bad',
                  severity: 'error',
                  message: 'CRLF diagnostic',
                  range: { start: 7, end: 9, unit: 'utf8-byte' },
                },
              ],
            };
          }}
        />
      );
    }
    render(<CrLf />);
    const input = screen.getByRole('combobox') as HTMLTextAreaElement;
    await user.click(input);
    input.setSelectionRange(6, 6);
    fireEvent.select(input);
    await waitFor(() => expect(requests.at(-1)?.cursor.offset).toBe(9));
    await user.click(await screen.findByRole('button', { name: 'CRLF diagnostic' }));
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(6);
    fireEvent.keyDown(input, { key: ' ', ctrlKey: true });
    await screen.findByRole('option');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('a\n😀name');
    expect(input.selectionStart).toBe(8);
    await user.type(input, '!');
    await waitFor(() => expect(requests.at(-1)?.document.text).toBe('a\r\n😀name!'));
  });
  it('selects exact diagnostic spans and applies version-bound host fixes', async () => {
    const change = vi.fn();
    render(
      <QueryInput
        document={{ text: '😀bad', version: 3 }}
        contextKey="x"
        onChange={change}
        request={async (request) => ({
          ...response(request),
          completions: [],
          diagnostics: [
            {
              id: 'bad',
              message: 'Unknown field',
              severity: 'error',
              range: { start: 4, end: 7, unit: 'utf8-byte' },
              fix: { range: { start: 4, end: 7, unit: 'utf8-byte' }, text: 'name' },
            },
          ],
        })}
        debounceMs={0}
      />,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('button', { name: 'Unknown field' }));
    const input = screen.getByRole('combobox') as HTMLTextAreaElement;
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(5);
    fireEvent.click(screen.getByRole('button', { name: 'Apply fix: Unknown field' }));
    expect(change).toHaveBeenCalledWith('😀name');
  });
});
