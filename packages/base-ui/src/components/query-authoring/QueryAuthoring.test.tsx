import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QueryAuthoring } from './QueryAuthoring';
import type { QueryAuthoringValue, QueryEditorRenderProps } from './types';

const initial: QueryAuthoringValue = {
  mode: 'code', code: { text: 'resource.name == "web"', version: 7 },
  builder: { kind: 'group', id: 'root', combinator: 'and', children: [] },
};

function injectedEditor(props: QueryEditorRenderProps) {
  return <div>
    <textarea aria-label="Injected CEL editor" value={props.document.text}
      disabled={props.disabled || props.availability?.status === 'denied'}
      onChange={event => props.onChange(event.target.value)} />
    <button onClick={props.onSubmit}>Editor run</button>
    <span data-testid="editor-version">{props.document.version}</span>
    <span data-testid="editor-context">{props.contextKey}</span>
  </div>;
}

describe('QueryAuthoring editor composition', () => {
  it.each(['native', 'injected'] as const)('preserves document identity through %s edits', (editor) => {
    const change = vi.fn();
    const value = { ...initial, code: { ...initial.code, uri: 'query://draft' } };
    render(<QueryAuthoring value={value} onChange={change} contextKey="pod" fields={[]}
      renderEditor={editor === 'injected' ? injectedEditor : undefined} />);
    fireEvent.change(screen.getByRole(editor === 'native' ? 'combobox' : 'textbox'), {
      target: { value: 'updated' },
    });
    expect(change).toHaveBeenCalledWith({
      ...value, code: { ...value.code, text: 'updated', version: 8 },
    });
  });

  it('retains document identity when converting the builder back to code', async () => {
    const change = vi.fn();
    const value: QueryAuthoringValue = {
      ...initial, mode: 'builder', code: { ...initial.code, uri: 'query://draft' },
    };
    render(<QueryAuthoring value={value} onChange={change} contextKey="pod" fields={[]}
      toCode={async () => ({ status: 'ready', value: 'converted' })} />);
    fireEvent.click(screen.getByRole('button', { name: /^Code$/ }));
    await waitFor(() => expect(change).toHaveBeenCalledWith({
      ...value, mode: 'code', code: { ...value.code, text: 'converted', version: 8 },
    }));
  });

  it('injects one controlled editor, increments the version, and runs the current draft', () => {
    const run = vi.fn();
    function Controlled() {
      const [value, setValue] = useState(initial);
      return <QueryAuthoring value={value} onChange={setValue} contextKey="pod"
        fields={[]} renderEditor={injectedEditor} onRun={run} />;
    }
    render(<Controlled />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByTestId('editor-context')).toHaveTextContent('pod');
    fireEvent.change(screen.getByRole('textbox', { name: 'Injected CEL editor' }), {
      target: { value: 'resource.name == "worker"' },
    });
    expect(screen.getByTestId('editor-version')).toHaveTextContent('8');
    fireEvent.click(screen.getByRole('button', { name: 'Editor run' }));
    expect(run).toHaveBeenCalledWith({ ...initial,
      code: { text: 'resource.name == "worker"', version: 8 } });
  });

  it('preserves the native renderer for unmigrated callers', () => {
    render(<QueryAuthoring value={initial} onChange={() => {}} contextKey="pod" fields={[]} />);
    expect(screen.getByRole('combobox', { name: 'Query expression' })).toHaveValue(initial.code.text);
    expect(screen.queryByRole('textbox', { name: 'Injected CEL editor' })).not.toBeInTheDocument();
  });

  it('retains the code draft when converting to the builder', async () => {
    const change = vi.fn();
    render(<QueryAuthoring value={initial} onChange={change} contextKey="pod" fields={[]}
      renderEditor={injectedEditor} toBuilder={async () => ({ status: 'ready', value: initial.builder })} />);
    fireEvent.click(screen.getByRole('button', { name: /^Builder$/ }));
    await waitFor(() => expect(change).toHaveBeenCalledWith({ ...initial, mode: 'builder' }));
  });
});
