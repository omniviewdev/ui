import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EditableList } from './EditableList';
import type { Key } from '../list';
import type { FieldErrors } from './types';

const meta: Meta = {
  title: 'Lists/EditableList',
  tags: ['autodocs'],
  args: {
    density: 'default',
  },
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['compact', 'default', 'comfortable'],
      description: 'Controls vertical density.',
      table: { defaultValue: { summary: 'default' } },
    },
  },
  parameters: {
    controls: {
      include: ['density'],
    },
    docs: {
      description: {
        component: [
          'A list where individual rows can be edited inline. Built on top of `List.Root`.',
          '',
          'Each `<EditableList.Item>` declares both a **view** (`ItemView`) and an **editor** (`ItemEditor`).',
          'The component handles conditional rendering based on which item is currently being edited.',
          '',
          '### Interaction',
          '- **Double-click** a row to enter edit mode',
          '- **F2** or **Enter** on the active row to start editing via keyboard',
          '- **Enter** to commit, **Escape** to cancel',
          '- **Tab** / **Shift+Tab** to cycle between fields within the editor',
          '',
          '### Custom controls',
          'Use the `EditableList.useField(name, defaultValue)` hook to register any control',
          '(`<select>`, `<textarea>`, custom component) with the field system.',
          'See the **CustomControls** story for an example.',
        ].join('\n'),
      },
    },
  },
};

export default meta;

type Story = StoryObj;

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

interface EnvVar {
  id: string;
  name: string;
  value: string;
}

const initialEnvVars: EnvVar[] = [
  { id: '1', name: 'DATABASE_URL', value: 'postgres://localhost:5432/app' },
  { id: '2', name: 'API_KEY', value: 'sk-1234567890abcdef' },
  { id: '3', name: 'PORT', value: '3000' },
  { id: '4', name: 'NODE_ENV', value: 'development' },
  { id: '5', name: 'LOG_LEVEL', value: 'debug' },
];

// ---------------------------------------------------------------------------
// 1. BasicEditing
// ---------------------------------------------------------------------------

function BasicEditingStory(args: Record<string, unknown>) {
  const [items, setItems] = useState(initialEnvVars);

  return (
    <EditableList
      {...args}
      onCommit={(key, values) => {
        setItems((prev) => prev.map((item) => (item.id === key ? { ...item, ...values } : item)));
      }}
      style={{ width: 480 }}
    >
      <EditableList.Viewport>
        {items.map((item) => (
          <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
            <EditableList.ItemView>
              <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
              <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
            </EditableList.ItemView>
            <EditableList.ItemEditor>
              <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
              <EditableList.ItemField name="value" defaultValue={item.value} />
              <EditableList.ItemSave />
              <EditableList.ItemCancel />
            </EditableList.ItemEditor>
          </EditableList.Item>
        ))}
      </EditableList.Viewport>
    </EditableList>
  );
}

export const BasicEditing: Story = {
  render: (args) => <BasicEditingStory {...args} />,
  parameters: {
    docs: {
      description: {
        story: [
          'Key-value pairs (like environment variables). Double-click a row to edit inline.',
          '',
          '- `ItemView` renders when the row is **not** being edited.',
          '- `ItemEditor` renders when the row **is** being edited, showing `ItemField` inputs and Save/Cancel buttons.',
          '- `onCommit` receives the item key and a `Record<string, string>` of all field values.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 2. WithValidation
// ---------------------------------------------------------------------------

function WithValidationStory(args: Record<string, unknown>) {
  const [items, setItems] = useState(initialEnvVars);

  const validateItem = (_key: Key, values: Record<string, string>): FieldErrors => {
    const errors: FieldErrors = {};
    if (!values.name?.trim()) errors.name = 'Name is required';
    if (/\s/.test(values.name ?? '')) errors.name = 'No spaces allowed';
    if (!values.value?.trim()) errors.value = 'Value is required';
    return errors;
  };

  return (
    <EditableList
      {...args}
      onCommit={(key, values) => {
        setItems((prev) => prev.map((item) => (item.id === key ? { ...item, ...values } : item)));
      }}
      validateItem={validateItem}
      style={{ width: 480 }}
    >
      <EditableList.Viewport>
        {items.map((item) => (
          <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
            <EditableList.ItemView>
              <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
              <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
            </EditableList.ItemView>
            <EditableList.ItemEditor>
              <EditableList.ItemField
                name="name"
                defaultValue={item.name}
                placeholder="Variable name"
                autoFocus
              />
              <EditableList.ItemField name="value" defaultValue={item.value} placeholder="Value" />
              <EditableList.ItemSave />
              <EditableList.ItemCancel />
            </EditableList.ItemEditor>
          </EditableList.Item>
        ))}
      </EditableList.Viewport>
    </EditableList>
  );
}

export const WithValidation: Story = {
  render: (args) => <WithValidationStory {...args} />,
  parameters: {
    docs: {
      description: {
        story: [
          'Pass a `validateItem` function to validate before committing. It receives `(key, values)` and',
          'returns a `FieldErrors` map (`{ fieldName: "error message" }`). Fields with errors get a',
          '`data-ov-invalid` attribute (red border). The commit is blocked until validation passes.',
          '',
          'Try clearing a field and pressing Enter to see the error state.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 3. ControlledEditing
// ---------------------------------------------------------------------------

function ControlledEditingStory(args: Record<string, unknown>) {
  const [items, setItems] = useState(initialEnvVars);
  const [editingKey, setEditingKey] = useState<Key | null>(null);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <EditableList
        {...args}
        editingKey={editingKey}
        onEditingKeyChange={setEditingKey}
        onCommit={(key, values) => {
          setItems((prev) => prev.map((item) => (item.id === key ? { ...item, ...values } : item)));
        }}
        onCancel={() => setEditingKey(null)}
        style={{ width: 480 }}
      >
        <EditableList.Viewport>
          {items.map((item) => (
            <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
              <EditableList.ItemView>
                <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
                <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
              </EditableList.ItemView>
              <EditableList.ItemEditor>
                <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
                <EditableList.ItemField name="value" defaultValue={item.value} />
                <EditableList.ItemSave />
                <EditableList.ItemCancel />
              </EditableList.ItemEditor>
            </EditableList.Item>
          ))}
        </EditableList.Viewport>
      </EditableList>
      <div style={{ fontSize: 13, color: 'var(--ov-color-fg-subtle)' }}>
        <strong>Editing key:</strong>
        <pre>{editingKey != null ? String(editingKey) : 'null'}</pre>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setEditingKey(item.id)}
              style={{ fontSize: 12 }}
            >
              Edit {item.name}
            </button>
          ))}
          <button type="button" onClick={() => setEditingKey(null)} style={{ fontSize: 12 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export const ControlledEditing: Story = {
  render: (args) => <ControlledEditingStory {...args} />,
  parameters: {
    docs: {
      description: {
        story: [
          'Fully controlled editing via `editingKey` and `onEditingKeyChange`. The external buttons',
          'can programmatically enter edit mode on any row. Useful when editing is triggered from',
          'a context menu, toolbar action, or other external UI.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 4. DisabledItems
// ---------------------------------------------------------------------------

export const DisabledItems: Story = {
  render: (args) => (
    <EditableList
      {...args}
      disabledKeys={['2', '4']}
      onCommit={(key, values) => console.log('commit', key, values)}
      style={{ width: 480 }}
    >
      <EditableList.Viewport>
        {initialEnvVars.map((item) => (
          <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
            <EditableList.ItemView>
              <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
              <EditableList.ItemMeta>
                {item.value}
                {['2', '4'].includes(item.id) ? ' (disabled)' : ''}
              </EditableList.ItemMeta>
            </EditableList.ItemView>
            <EditableList.ItemEditor>
              <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
              <EditableList.ItemField name="value" defaultValue={item.value} />
              <EditableList.ItemSave />
              <EditableList.ItemCancel />
            </EditableList.ItemEditor>
          </EditableList.Item>
        ))}
      </EditableList.Viewport>
    </EditableList>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          'Items listed in `disabledKeys` cannot be edited. They show reduced opacity and',
          'ignore double-click / keyboard attempts to enter edit mode. Non-disabled items',
          'remain fully editable.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 5. ReadOnlyMode
// ---------------------------------------------------------------------------

export const ReadOnlyMode: Story = {
  render: (args) => (
    <EditableList {...args} editable={false} style={{ width: 480 }}>
      <EditableList.Viewport>
        {initialEnvVars.map((item) => (
          <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
            <EditableList.ItemView>
              <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
              <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
            </EditableList.ItemView>
            <EditableList.ItemEditor>
              <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
              <EditableList.ItemField name="value" defaultValue={item.value} />
              <EditableList.ItemSave />
              <EditableList.ItemCancel />
            </EditableList.ItemEditor>
          </EditableList.Item>
        ))}
      </EditableList.Viewport>
    </EditableList>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          'Set `editable={false}` to globally disable all editing. The list behaves like a',
          'normal read-only list — double-click and keyboard shortcuts have no effect.',
          'Useful for toggling between view and edit modes at the container level.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 6. DensityVariants
// ---------------------------------------------------------------------------

function DensityDemo({ density }: { density: 'compact' | 'default' | 'comfortable' }) {
  const [items, setItems] = useState(initialEnvVars.slice(0, 3));

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 4,
          color: 'var(--ov-color-fg-muted)',
        }}
      >
        {density}
      </div>
      <EditableList
        density={density}
        onCommit={(key, values) => {
          setItems((prev) => prev.map((item) => (item.id === key ? { ...item, ...values } : item)));
        }}
        style={{ width: 360 }}
      >
        <EditableList.Viewport>
          {items.map((item) => (
            <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
              <EditableList.ItemView>
                <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
                <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
              </EditableList.ItemView>
              <EditableList.ItemEditor>
                <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
                <EditableList.ItemField name="value" defaultValue={item.value} />
                <EditableList.ItemSave />
                <EditableList.ItemCancel />
              </EditableList.ItemEditor>
            </EditableList.Item>
          ))}
        </EditableList.Viewport>
      </EditableList>
    </div>
  );
}

export const DensityVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <DensityDemo density="compact" />
      <DensityDemo density="default" />
      <DensityDemo density="comfortable" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          'The `density` prop (`compact` | `default` | `comfortable`) controls row height and',
          'padding. Input fields and buttons scale automatically to fit within each density.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 7. WithSelection
// ---------------------------------------------------------------------------

function WithSelectionStory(args: Record<string, unknown>) {
  const [items, setItems] = useState(initialEnvVars);

  return (
    <EditableList
      {...args}
      selectionMode="single"
      onCommit={(key, values) => {
        setItems((prev) => prev.map((item) => (item.id === key ? { ...item, ...values } : item)));
      }}
      style={{ width: 480 }}
    >
      <EditableList.Viewport>
        {items.map((item) => (
          <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
            <EditableList.ItemView>
              <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
              <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
            </EditableList.ItemView>
            <EditableList.ItemEditor>
              <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
              <EditableList.ItemField name="value" defaultValue={item.value} />
              <EditableList.ItemSave />
              <EditableList.ItemCancel />
            </EditableList.ItemEditor>
          </EditableList.Item>
        ))}
      </EditableList.Viewport>
    </EditableList>
  );
}

export const WithSelection: Story = {
  render: (args) => <WithSelectionStory {...args} />,
  parameters: {
    docs: {
      description: {
        story: [
          'Editing coexists with selection. Single-click selects, double-click edits.',
          'Pass `selectionMode="single"` or `"multiple"` — the underlying `List.Root`',
          'handles selection while `EditableList` manages the editing layer.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 8. KeyboardWorkflow
// ---------------------------------------------------------------------------

function KeyboardWorkflowStory(args: Record<string, unknown>) {
  const [items, setItems] = useState(initialEnvVars);
  const [lastAction, setLastAction] = useState('');

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ov-color-fg-subtle)', marginBottom: 8 }}>
        <strong>Keyboard shortcuts:</strong> Arrow keys to navigate, F2 or Enter to edit, Tab to
        cycle fields, Enter to save, Escape to cancel.
      </div>
      <EditableList
        {...args}
        onCommit={(key, values) => {
          setItems((prev) => prev.map((item) => (item.id === key ? { ...item, ...values } : item)));
          setLastAction(`Committed: ${values.name}=${values.value}`);
        }}
        onCancel={(key) => {
          setLastAction(`Cancelled editing item ${key}`);
        }}
        style={{ width: 480 }}
      >
        <EditableList.Viewport>
          {items.map((item) => (
            <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
              <EditableList.ItemView>
                <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
                <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
              </EditableList.ItemView>
              <EditableList.ItemEditor>
                <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
                <EditableList.ItemField name="value" defaultValue={item.value} />
                <EditableList.ItemSave />
                <EditableList.ItemCancel />
              </EditableList.ItemEditor>
            </EditableList.Item>
          ))}
        </EditableList.Viewport>
      </EditableList>
      {lastAction && (
        <div style={{ fontSize: 12, marginTop: 8, color: 'var(--ov-color-fg-muted)' }}>
          Last action: {lastAction}
        </div>
      )}
    </div>
  );
}

export const KeyboardWorkflow: Story = {
  render: (args) => <KeyboardWorkflowStory {...args} />,
  parameters: {
    docs: {
      description: {
        story: [
          'Demonstrates the full keyboard workflow:',
          '',
          '1. **Arrow Up/Down** — navigate between items',
          '2. **F2** or **Enter** — start editing the active item',
          '3. **Tab** / **Shift+Tab** — cycle focus between fields',
          '4. **Enter** — commit the edit',
          '5. **Escape** — cancel and return to view mode',
          '',
          'Arrow keys are suppressed while editing to prevent accidental list navigation.',
        ].join('\n'),
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 9. CustomControls (useField hook with select, textarea, etc.)
// ---------------------------------------------------------------------------

interface Endpoint {
  id: string;
  method: string;
  path: string;
  description: string;
}

const initialEndpoints: Endpoint[] = [
  { id: '1', method: 'GET', path: '/api/users', description: 'List users' },
  { id: '2', method: 'POST', path: '/api/users', description: 'Create user' },
  { id: '3', method: 'DELETE', path: '/api/users/:id', description: 'Delete user' },
  { id: '4', method: 'PUT', path: '/api/users/:id', description: 'Update user' },
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

/**
 * Custom select field using the `useField` hook.
 *
 * ```tsx
 * function MethodSelect({ name, defaultValue }) {
 *   const { ref, error, setValue } = EditableList.useField(name, defaultValue);
 *   return (
 *     <select
 *       ref={ref}
 *       defaultValue={defaultValue}
 *       onChange={(e) => setValue(e.target.value)}
 *       data-ov-invalid={error ? '' : undefined}
 *     >
 *       <option value="GET">GET</option>
 *       <option value="POST">POST</option>
 *     </select>
 *   );
 * }
 * ```
 */
function MethodSelect({ name, defaultValue }: { name: string; defaultValue: string }) {
  const { ref, error, setValue } = EditableList.useField(name, defaultValue);
  return (
    <select
      ref={ref}
      defaultValue={defaultValue}
      onChange={(e) => setValue(e.target.value)}
      data-ov-invalid={error ? '' : undefined}
      style={{
        flex: '0 0 auto',
        width: 90,
        height: 'calc(var(--_ov-item-height) - 8px)',
        paddingInline: 4,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-sm, 4px)',
        background: 'var(--ov-color-bg-surface)',
        color: 'var(--ov-color-fg-default)',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        outline: 'none',
      }}
    >
      {HTTP_METHODS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}

function CustomControlsStory(args: Record<string, unknown>) {
  const [items, setItems] = useState(initialEndpoints);

  return (
    <EditableList
      {...args}
      onCommit={(key, values) => {
        setItems((prev) => prev.map((item) => (item.id === key ? { ...item, ...values } : item)));
      }}
      style={{ width: 560 }}
    >
      <EditableList.Viewport>
        {items.map((item) => (
          <EditableList.Item key={item.id} itemKey={item.id} textValue={item.path}>
            <EditableList.ItemView>
              <EditableList.ItemMeta style={{ flex: '0 0 60px', marginInlineStart: 0 }}>
                {item.method}
              </EditableList.ItemMeta>
              <EditableList.ItemLabel>{item.path}</EditableList.ItemLabel>
              <EditableList.ItemDescription>{item.description}</EditableList.ItemDescription>
            </EditableList.ItemView>
            <EditableList.ItemEditor>
              <MethodSelect name="method" defaultValue={item.method} />
              <EditableList.ItemField name="path" defaultValue={item.path} autoFocus />
              <EditableList.ItemField name="description" defaultValue={item.description} />
              <EditableList.ItemSave />
              <EditableList.ItemCancel />
            </EditableList.ItemEditor>
          </EditableList.Item>
        ))}
      </EditableList.Viewport>
    </EditableList>
  );
}

export const CustomControls: Story = {
  render: (args) => <CustomControlsStory {...args} />,
  parameters: {
    docs: {
      description: {
        story: [
          'Use `EditableList.useField(name, defaultValue)` to register **any** control with the field system.',
          'The hook returns:',
          '',
          '- **`ref`** — attach to your element (must have `.value` and `.focus()`)',
          '- **`error`** — current validation error string, or `undefined`',
          '- **`setValue(value)`** — call on change to keep the field system in sync',
          '',
          'This example uses a native `<select>` for the HTTP method column. The same pattern works',
          'for `<textarea>`, custom dropdowns, color pickers, or any component that exposes a `.value`.',
          '',
          '```tsx',
          'function MethodSelect({ name, defaultValue }) {',
          '  const { ref, error, setValue } = EditableList.useField(name, defaultValue);',
          '  return (',
          '    <select',
          '      ref={ref}',
          '      defaultValue={defaultValue}',
          '      onChange={(e) => setValue(e.target.value)}',
          '      data-ov-invalid={error ? "" : undefined}',
          '    >',
          '      <option value="GET">GET</option>',
          '      <option value="POST">POST</option>',
          '    </select>',
          '  );',
          '}',
          '```',
        ].join('\n'),
      },
    },
  },
};
