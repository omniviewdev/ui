import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type * as Monaco from 'monaco-editor';
import type { QueryAvailability, QueryDocument } from '@omniviewdev/base-ui';
import { Popover } from '@omniviewdev/base-ui';
import { CelQueryEditor } from './CelQueryEditor';
import { createCelDevelopmentAdapter } from '../../development/cel-language-service';

const meta: Meta<typeof CelQueryEditor> = {
  title: 'Editors/CelQueryEditor', component: CelQueryEditor,
  parameters: { layout: 'padded' },
  args: { document: { text: 'resource.', version: 1 }, contextKey: 'pod', onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof meta>;

function ContextualEditors() {
  const pod = useMemo(() => createCelDevelopmentAdapter('pod'), []);
  const cloud = useMemo(() => createCelDevelopmentAdapter('cloud'), []);
  useEffect(() => () => { void pod.dispose(); void cloud.dispose(); }, [pod, cloud]);
  const [podDocument, setPodDocument] = useState<QueryDocument>({ text: 'resource.', version: 1 });
  const [cloudDocument, setCloudDocument] = useState<QueryDocument>({ text: 'cp', version: 1 });
  const [availability, setAvailability] = useState<QueryAvailability>({ status: 'loading', message: 'Connecting to the real development CEL service…' });
  const [attempt, setAttempt] = useState(0);
  const [showCloud, setShowCloud] = useState(true);
  const [podContext, setPodContext] = useState('pod');
  const [podDenied, setPodDenied] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [namespace, setNamespace] = useState<typeof Monaco>();
  useEffect(() => {
    const controller = new AbortController();
    setAvailability({ status: 'loading', message: 'Connecting to the real development CEL service…' });
    void pod.profiles(controller.signal).then(() => {
      setAvailability({ status: 'ready' });
    }, error => {
      if (!controller.signal.aborted) setAvailability({ status: 'unavailable', message:
        `Disconnected. Start the isolated service: cd tools/cel-language-service && GOWORK=off go run . (${error instanceof Error ? error.message : 'connection failed'})` });
    });
    return () => controller.abort();
  }, [pod, attempt]);
  useEffect(() => {
    if (!namespace) return;
    let alive = true;
    const update = () => { if (alive) setModels(namespace.editor.getModels().map(model => model.uri.toString())); };
    const subscriptions = [
      namespace.editor.onDidCreateModel(update),
      namespace.editor.onWillDisposeModel(() => queueMicrotask(update)),
    ];
    update();
    return () => { alive = false; for (const subscription of subscriptions) subscription.dispose(); };
  }, [namespace]);
  function mount(_editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    setNamespace(monaco);
  }
  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 960 }}>
      <h2>Real contextual CEL editing and model isolation</h2>
      <p>Uses loopback cel-go, not a browser evaluator or fixed completion list. Type a member path,
        pause for 250ms, or use Ctrl+Space immediately. Hover a checked field and invoke a string
        function for signature help. Enter accepts the highlighted native suggestion; Ctrl/⌘+Enter
        is reserved for the host run action.</p>
      <div><button onClick={() => setAttempt(value => value + 1)}>Reconnect service</button>{' '}
        <button onClick={() => setShowCloud(value => !value)}>{showCloud ? 'Unmount cloud editor' : 'Mount cloud editor'}</button>{' '}
        <button onClick={() => setPodContext(value => value === 'pod' ? 'pod:alternate' : 'pod')}>Change Pod query context</button>{' '}
        <button onClick={() => setPodDenied(value => !value)}>{podDenied ? 'Restore Pod access' : 'Deny Pod access'}</button></div>
      <CelQueryEditor label="Pod CEL query" document={podDocument} contextKey={podContext}
        onChange={text => setPodDocument(value => ({ text, version: value.version + 1 }))}
        request={pod.languageService} check={pod.check} hover={pod.hover} signature={pod.signature}
        onDocumentClose={uri => { void pod.closeDocument(uri); }}
        availability={podDenied ? { status: 'denied', message: 'Pod query access denied.' } : availability} onMount={mount} />
      {showCloud ? <CelQueryEditor label="Cloud CEL query" document={cloudDocument} contextKey="cloud"
        onChange={text => setCloudDocument(value => ({ text, version: value.version + 1 }))}
        request={cloud.languageService} check={cloud.check} hover={cloud.hover} signature={cloud.signature}
        onDocumentClose={uri => { void cloud.closeDocument(uri); }}
        availability={availability} onMount={mount} /> : null}
      <div><strong>Active Monaco models: {models.length}</strong>
        <ul>{models.map(uri => <li key={uri}><code>{uri}</code></li>)}</ul>
        <p>Unmounting removes only that model and its language registrations; the remaining editor stays live.</p>
      </div>
      <pre aria-label="Controlled source snapshots">{JSON.stringify({ podDocument, cloudDocument }, null, 2)}</pre>
    </div>
  );
}

export const ContextualAndIsolated: Story = { render: () => <ContextualEditors /> };
export const PopoverAndResize: Story = {
  render: () => (
    <Popover.Root defaultOpen>
      <Popover.Trigger>Open contextual query editors</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={8}>
          <Popover.Popup>
            <Popover.Title>Contextual CEL in a popover</Popover.Title>
            <div style={{ width: 640, maxWidth: '80vw', minWidth: 320, resize: 'horizontal', overflow: 'auto' }}>
              <ContextualEditors />
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  ),
};
export const Denied: Story = {
  args: { availability: { status: 'denied', message: 'This query context is not authorized.' } },
};
