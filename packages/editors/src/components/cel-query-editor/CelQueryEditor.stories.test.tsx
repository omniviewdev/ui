import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { CelQueryEditorProps } from './CelQueryEditor';
import { ContextualAndIsolated, PopoverAndResize } from './CelQueryEditor.stories';

const lifecycle = vi.hoisted(() => ({
  nextURI: 0,
  adapters: [] as { profile: string; documents: Set<string>; closeDocument: Mock; dispose: Mock }[],
}));

vi.mock('../../development/cel-language-service', () => ({
  createCelDevelopmentAdapter: (profile: string) => {
    const documents = new Set<string>();
    const adapter = {
      profile,
      documents,
      profiles: vi.fn(async () => ({ profiles: [] })),
      languageService: (uri: string) => { documents.add(uri); },
      closeDocument: vi.fn(async (uri: string) => { documents.delete(uri); }),
      dispose: vi.fn(async () => { documents.clear(); }),
    };
    lifecycle.adapters.push(adapter);
    return adapter;
  },
}));

// Model Monaco's document ownership without loading its browser-only implementation.
vi.mock('./CelQueryEditor', () => ({
  CelQueryEditor: ({ label, request, onDocumentClose }: CelQueryEditorProps) => {
    const [uri] = useState(() => `inmemory://story/${++lifecycle.nextURI}`);
    const close = useRef(onDocumentClose);
    close.current = onDocumentClose;
    useEffect(() => {
      (request as unknown as (uri: string) => void)?.(uri);
      return () => close.current?.(uri);
    }, [request, uri]);
    return <div aria-label={label} data-model-uri={uri} />;
  },
}));

vi.mock('@omniviewdev/base-ui', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { Popover: { Root: Container, Trigger: Container, Portal: Container, Positioner: Container, Popup: Container, Title: Container } };
});

beforeEach(() => { lifecycle.adapters.length = 0; lifecycle.nextURI = 0; });

describe.each([
  ['contextual', ContextualAndIsolated],
  ['popover', PopoverAndResize],
] as const)('%s CEL story document ownership', (_name, story) => {
  it('closes only the unmounted cloud document and disposes both adapters on teardown', async () => {
    const Story = story.render as () => React.ReactNode;
    const { unmount } = render(<StrictMode><Story /></StrictMode>);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unmount cloud editor' })).toBeInTheDocument());
    const podURI = screen.getByLabelText('Pod CEL query').getAttribute('data-model-uri')!;
    const cloudURI = screen.getByLabelText('Cloud CEL query').getAttribute('data-model-uri')!;
    const pod = lifecycle.adapters.find(adapter => adapter.documents.has(podURI))!;
    const cloud = lifecycle.adapters.find(adapter => adapter.documents.has(cloudURI))!;
    expect(pod).toBeDefined();
    expect(cloud).toBeDefined();
    const podCloses = pod.closeDocument.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Unmount cloud editor' }));
    expect(cloud.closeDocument).toHaveBeenCalledWith(cloudURI);
    expect(cloud.documents.size).toBe(0);
    expect(pod.documents.has(podURI)).toBe(true);
    expect(pod.closeDocument).toHaveBeenCalledTimes(podCloses);
    fireEvent.click(screen.getByRole('button', { name: 'Mount cloud editor' }));
    const remountedURI = screen.getByLabelText('Cloud CEL query').getAttribute('data-model-uri')!;
    expect(remountedURI).not.toBe(cloudURI);
    expect(cloud.documents.has(remountedURI)).toBe(true);
    const podDisposes = pod.dispose.mock.calls.length;
    const cloudDisposes = cloud.dispose.mock.calls.length;
    unmount();
    expect(pod.closeDocument).toHaveBeenCalledWith(podURI);
    expect(cloud.closeDocument).toHaveBeenCalledWith(remountedURI);
    expect(pod.dispose).toHaveBeenCalledTimes(podDisposes + 1);
    expect(cloud.dispose).toHaveBeenCalledTimes(cloudDisposes + 1);
    expect(pod.documents.size).toBe(0);
    expect(cloud.documents.size).toBe(0);
  });
});
