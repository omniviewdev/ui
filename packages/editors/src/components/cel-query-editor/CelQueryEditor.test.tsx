import { act, render, waitFor } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { CodeEditorProps } from '../code-editor/CodeEditor';
import type * as React from 'react';
import type * as Monaco from 'monaco-editor';
import type { Mock } from 'vitest';
import { CelQueryEditor } from './CelQueryEditor';

const lifecycle = vi.hoisted(() => ({
  effects: new Set<{ setup: () => void | (() => void); cleanup: void | (() => void) }>(),
  bridges: [] as { refresh: Mock; dispose: Mock }[],
  contentSubscriptions: [] as { dispose: Mock }[],
  editor: {
    getModel: () => ({ isDisposed: () => false }),
    getContentHeight: () => 52,
    updateOptions: vi.fn(),
    onDidContentSizeChange: vi.fn(() => {
      const subscription = { dispose: vi.fn() };
      lifecycle.contentSubscriptions.push(subscription);
      return subscription;
    }),
  },
}));

// FastRefresh replays effects without necessarily remounting the lazy CodeEditor.
// Capture actual React effect setups to exercise that cleanup/setup sequence.
vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof React>();
  return {
    ...actual,
    useEffect: (setup: () => void | (() => void), dependencies?: readonly unknown[]) => actual.useEffect(() => {
      const entry = { setup, cleanup: setup() };
      lifecycle.effects.add(entry);
      return () => { entry.cleanup?.(); lifecycle.effects.delete(entry); };
    }, dependencies),
  };
});
vi.mock('./bridge', () => ({
  attachCelBridge: vi.fn(() => {
    const bridge = { refresh: vi.fn(), dispose: vi.fn() };
    lifecycle.bridges.push(bridge);
    return bridge;
  }),
}));
vi.mock('../code-editor/CodeEditor', () => ({
  CodeEditor: ({ onMount }: CodeEditorProps) => {
    const mounted = useRef(false);
    useEffect(() => {
      if (mounted.current) return;
      mounted.current = true;
      onMount?.(lifecycle.editor as unknown as Monaco.editor.IStandaloneCodeEditor,
        {} as typeof Monaco);
    }, [onMount]);
    return <div data-testid="retained-code-editor" />;
  },
}));

describe('CEL editor effect ownership', () => {
  it('reinstalls its bridge and size subscription when effects replay around a retained editor', async () => {
    const mounted = vi.fn();
    const { unmount } = render(<CelQueryEditor document={{ text: 'resource.', version: 1 }}
      contextKey="pod" onChange={() => {}} onMount={mounted} />);
    await waitFor(() => expect(lifecycle.bridges).toHaveLength(1));
    const initialBridge = lifecycle.bridges[0]!;
    const initialSize = lifecycle.contentSubscriptions[0]!;
    act(() => {
      const entries = [...lifecycle.effects];
      for (const entry of entries) entry.cleanup?.();
      for (const entry of entries) entry.cleanup = entry.setup();
    });
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(initialBridge.dispose).toHaveBeenCalledTimes(1);
    expect(initialSize.dispose).toHaveBeenCalledTimes(1);
    expect(lifecycle.bridges).toHaveLength(2);
    expect(lifecycle.contentSubscriptions).toHaveLength(2);
    expect(lifecycle.bridges[1]!.dispose).not.toHaveBeenCalled();
    unmount();
    expect(lifecycle.bridges[1]!.dispose).toHaveBeenCalledTimes(1);
    expect(lifecycle.contentSubscriptions[1]!.dispose).toHaveBeenCalledTimes(1);
  });
});
