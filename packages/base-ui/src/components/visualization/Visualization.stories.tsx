import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  VisualizationFields,
  VisualizationPanel,
  type VisualizationField,
  type VisualizationStatus,
} from './Visualization';
import {
  VisualizationBindingEditor,
  type VisualizationBindings,
} from './VisualizationBindingEditor';
import { ViewLayout, type ViewLayoutItem } from './ViewLayout';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import { FormField } from '../form-field/FormField';

const meta: Meta = {
  title: 'Components/Visualization/Presentation and layout',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Controlled presentation only. Values and field compatibility are prepared fixture input; no service, selector evaluator, persistence or query cache is implemented here. Missing renderers retain user configuration. Preview keeps panel children mounted; the host decides visibility/acquisition policy.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;
const fields: VisualizationField[] = [
  { id: 'capacity', label: 'Capacity', value: { status: 'ready', value: 12 } },
  {
    id: 'tags',
    label: 'Tags',
    value: { status: 'ready', value: ['production', { region: 'eu-west', nullable: null }] },
  },
  { id: 'exact', label: 'Exact identifier', value: { status: 'ready', value: '9007199254740993' } },
  {
    id: 'missing',
    label: 'Placement',
    value: { status: 'missing', message: 'Field is not present in this result' },
  },
];
function PresentationStates() {
  const [status, setStatus] = useState<VisualizationStatus>('ready');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(['ready', 'loading', 'empty', 'error', 'unavailable', 'denied'] as const).map((value) => (
          <Button key={value} onClick={() => setStatus(value)}>
            {value}
          </Button>
        ))}
      </div>
      <VisualizationPanel
        title="Prepared resource values"
        status={status}
        description={
          status === 'ready'
            ? 'Fields are already resolved by the caller.'
            : 'Safe caller-provided explanation of this state.'
        }
        detail="No resource acquisition or permissions are decided inside this panel."
      >
        <VisualizationFields fields={fields} />
      </VisualizationPanel>
      <VisualizationFields fields={fields.slice(0, 3)} presentation="stat" />
      <VisualizationFields fields={fields} presentation="list" />
    </div>
  );
}
export const ValuesAndStates: Story = { render: () => <PresentationStates /> };

const choices = [
  {
    id: 'opaque.capacity',
    label: 'Capacity',
    type: 'integer',
    description: 'Prepared integer field',
  },
  { id: 'opaque.tags', label: 'Tags', type: 'array', description: 'Prepared tag array' },
  { id: 'opaque.name', label: 'Name', type: 'string' },
  {
    id: 'opaque.denied',
    label: 'Protected field',
    type: 'string',
    disabledReason: 'Not permitted for this scope',
  },
];
const preparedFixtureFields: Record<string, VisualizationField> = {
  'opaque.capacity': fields[0]!,
  'opaque.tags': fields[1]!,
  'opaque.name': {
    id: 'name',
    label: 'Name',
    value: { status: 'ready', value: 'Example resource' },
  },
};
function BindingConfiguration() {
  const [value, setValue] = useState<VisualizationBindings>({
    primary: 'opaque.capacity',
    subtitle: 'removed-field',
  });
  const [visualizationId, setVisualizationId] = useState('stat');
  const [pluginPresent, setPluginPresent] = useState(true);
  const [warning, setWarning] = useState(true);
  const boundFields: VisualizationField[] = Object.entries(value).map(([slot, id]) => ({
    id: slot,
    label: choices.find((choice) => choice.id === id)?.label ?? slot,
    value: preparedFixtureFields[id ?? '']?.value ?? {
      status: 'missing',
      message: 'Fixture value unavailable for this binding',
    },
  }));
  return (
    <div style={{ maxWidth: 640, display: 'grid', gap: 12 }}>
      <Button onClick={() => setPluginPresent((present) => !present)}>
        {pluginPresent ? 'Remove renderer fixture' : 'Restore renderer fixture'}
      </Button>
      <Button onClick={() => setWarning((present) => !present)}>
        Toggle host diagnostic fixture
      </Button>
      <VisualizationBindingEditor
        slots={[
          {
            id: 'primary',
            label: 'Primary value',
            required: true,
            description: 'Host controls compatible choices.',
          },
          { id: 'subtitle', label: 'Subtitle' },
        ]}
        fields={choices}
        value={value}
        onChange={setValue}
        visualizationId={visualizationId}
        onVisualizationChange={setVisualizationId}
        visualizations={
          pluginPresent
            ? [
                { id: 'stat', label: 'Stat card' },
                { id: 'list', label: 'List' },
                {
                  id: 'relationship',
                  label: 'Relationships',
                  disabledReason: 'Incompatible result shape',
                },
              ]
            : []
        }
        diagnostics={
          warning
            ? [
                {
                  slotId: 'subtitle',
                  severity: 'error',
                  message:
                    'Bound field is unavailable after a schema change. Choose a replacement or clear it.',
                },
              ]
            : []
        }
      />
      <VisualizationPanel
        title="Preview"
        status={pluginPresent ? 'ready' : 'unavailable'}
        description={
          pluginPresent
            ? undefined
            : 'Renderer contribution is not installed. Your binding choices are preserved.'
        }
      >
        <VisualizationFields
          fields={boundFields}
          presentation={visualizationId === 'stat' ? 'stat' : 'list'}
        />
      </VisualizationPanel>
      <pre aria-label="Controlled configuration">
        {JSON.stringify({ visualizationId, value }, null, 2)}
      </pre>
    </div>
  );
}
export const BindingConfigurationAndRendererRemoval: Story = {
  render: () => <BindingConfiguration />,
};

interface Panel extends ViewLayoutItem {
  kind: 'stat' | 'list' | 'key-value';
  bindings: VisualizationBindings;
  status: VisualizationStatus;
}
const initialPanels: Panel[] = [
  {
    id: 'capacity',
    title: 'Capacity',
    columnSpan: 2,
    rowSpan: 2,
    kind: 'stat',
    bindings: { primary: 'opaque.capacity' },
    status: 'ready',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    columnSpan: 2,
    rowSpan: 3,
    kind: 'list',
    bindings: { primary: 'opaque.tags' },
    status: 'ready',
  },
  {
    id: 'restricted',
    title: 'Restricted scope',
    columnSpan: 2,
    rowSpan: 2,
    kind: 'key-value',
    bindings: {},
    status: 'denied',
  },
];
function LayoutBuilder() {
  const [items, setItems] = useState(initialPanels);
  const [editing, setEditing] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [acceptEdits, setAcceptEdits] = useState(true);
  const [rendererAvailable, setRendererAvailable] = useState(true);
  const configureTrigger = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<string>();
  const [saved, setSaved] = useState(initialPanels);
  const [nextId, setNextId] = useState(1);
  const hostUpdateTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(hostUpdateTimer.current), []);
  const applyHostUpdate = () => {
    setItems((current) =>
      current
        .map((item) => (item.id === 'capacity' ? { ...item, columnSpan: 4, rowSpan: 2 } : item))
        .reverse(),
    );
  };
  const panel = items.find((item) => item.id === selected);
  // Selection belongs to this host fixture, not to the layout primitive.
  if (selected && !panel) setSelected(undefined);
  const mutable = editing && !disabled && !readOnly;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <p>
        Fixture-only arrangement. Drag handles work with pointer or Space/arrow keys; resize handles
        use pointer or arrow keys. Earlier/Later also work with Enter. Width is bounded to 1–6
        columns; height to 1–4 rows. Disabled/read-only affect layout controls, not panel content.
        Host updates replace controlled state and invalidate active gestures. Save/reset here retain
        fixture state only, not persisted user documents.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button onClick={() => setEditing((current) => !current)}>
          {editing ? 'Preview' : 'Edit layout'}
        </Button>
        <Button aria-pressed={disabled} onClick={() => setDisabled((value) => !value)}>
          Layout disabled
        </Button>
        <Button aria-pressed={readOnly} onClick={() => setReadOnly((value) => !value)}>
          Layout read-only
        </Button>
        <Button aria-pressed={acceptEdits} onClick={() => setAcceptEdits((value) => !value)}>
          Accept layout edits
        </Button>
        <Button onClick={() => setRendererAvailable((value) => !value)}>
          {rendererAvailable
            ? 'Remove Capacity renderer fixture'
            : 'Restore Capacity renderer fixture'}
        </Button>
        <Button onClick={applyHostUpdate}>Apply host layout update</Button>
        <Button
          onClick={() => {
            clearTimeout(hostUpdateTimer.current);
            hostUpdateTimer.current = window.setTimeout(applyHostUpdate, 2000);
          }}
        >
          Schedule host update (2s)
        </Button>
        <Button
          disabled={!panel}
          focusableWhenDisabled
          onClick={() => setItems((current) => current.filter((item) => item.id !== selected))}
        >
          Remove selected from host
        </Button>
        <Button
          onClick={() => {
            setItems((current) => [
              ...current,
              {
                id: `new-${nextId}`,
                title: `Component ${nextId}`,
                columnSpan: 2,
                rowSpan: 2,
                kind: 'stat',
                bindings: {},
                status: 'empty',
              },
            ]);
            setNextId((id) => id + 1);
          }}
          disabled={!mutable}
        >
          Add component
        </Button>
        <Button onClick={() => setSaved(items)} disabled={!mutable}>
          Save fixture layout
        </Button>
        <Button onClick={() => setItems(saved)} disabled={!mutable}>
          Reset to saved fixture
        </Button>
      </div>
      {mutable && panel && (
        <section aria-label="Component configuration" style={{ maxWidth: 640 }}>
          <FormField label="Component title" htmlFor="fixture-panel-title">
            <Input.Control
              id="fixture-panel-title"
              value={panel.title}
              onChange={(event) =>
                setItems((current) =>
                  current.map((item) =>
                    item.id === selected ? { ...item, title: event.target.value } : item,
                  ),
                )
              }
            />
          </FormField>
          <VisualizationBindingEditor
            slots={[{ id: 'primary', label: 'Primary field', required: true }]}
            fields={choices}
            value={panel.bindings}
            onChange={(bindings) =>
              setItems((current) =>
                current.map((item) => (item.id === selected ? { ...item, bindings } : item)),
              )
            }
            visualizationId={panel.kind}
            visualizations={[
              { id: 'stat', label: 'Stat' },
              { id: 'list', label: 'List' },
              { id: 'key-value', label: 'Key/value' },
            ]}
            onVisualizationChange={(kind) => {
              if (kind === 'stat' || kind === 'list' || kind === 'key-value')
                setItems((current) =>
                  current.map((item) => (item.id === selected ? { ...item, kind } : item)),
                );
            }}
          />
          <Button
            onClick={() => {
              setSelected(undefined);
              if (configureTrigger.current?.isConnected) configureTrigger.current.focus();
            }}
          >
            Close configuration
          </Button>
        </section>
      )}
      <ViewLayout
        items={items}
        onItemsChange={(next) => {
          if (acceptEdits) setItems(next);
        }}
        editing={editing}
        disabled={disabled}
        readOnly={readOnly}
        columns={6}
        rowHeight={160}
        maxRowSpan={4}
        onConfigure={(id) => {
          configureTrigger.current = document.activeElement as HTMLElement;
          setSelected(id);
        }}
        renderItem={(item) => {
          const preparedFields: VisualizationField[] = Object.entries(item.bindings).map(
            ([slot, id]) => ({
              id: slot,
              label: choices.find((choice) => choice.id === id)?.label ?? slot,
              value: preparedFixtureFields[id ?? '']?.value ?? {
                status: 'missing',
                message: 'Fixture value unavailable for this binding',
              },
            }),
          );
          return (
            <VisualizationPanel
              title={`${item.title} result`}
              status={item.id === 'capacity' && !rendererAvailable ? 'unavailable' : item.status}
              description={
                item.id === 'capacity' && !rendererAvailable
                  ? 'Renderer fixture is unavailable. Layout and bindings are retained.'
                  : item.status === 'denied'
                    ? 'This scope is not permitted; neighboring panels stay usable.'
                    : undefined
              }
              detail="Host-provided fixture status"
              actions={
                <Button
                  size="xs"
                  onClick={(event) => {
                    configureTrigger.current = event.currentTarget;
                    setSelected(item.id);
                  }}
                >
                  Inspect panel
                </Button>
              }
            >
              <VisualizationFields presentation={item.kind} fields={preparedFields} />
            </VisualizationPanel>
          );
        }}
      />
      <output aria-label="Selected panel">
        {panel ? `Selected: ${panel.title}` : 'No panel selected'}
      </output>
      <details>
        <summary>Controlled layout data</summary>
        <pre>{JSON.stringify(items, null, 2)}</pre>
      </details>
    </div>
  );
}
export const KeyboardAndPointerLayoutBuilder: Story = { render: () => <LayoutBuilder /> };
