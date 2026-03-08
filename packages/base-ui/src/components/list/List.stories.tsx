import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  LuBox,
  LuNetwork,
  LuRocket,
  LuCalendar,
  LuGrape,
  LuCherry,
  LuApple,
  LuCitrus,
} from 'react-icons/lu';
import { List } from './List';
import type { Key } from './types';

const meta: Meta<typeof List> = {
  title: 'Lists/List',
  tags: ['autodocs'],
  args: {
    size: 'md',
    density: 'default',
    selectionMode: 'single',
    selectionBehavior: 'replace',
    loopFocus: false,
    typeahead: true,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Controls the overall size of list items (font size, icon size, spacing).',
      table: { defaultValue: { summary: 'md' } },
    },
    density: {
      control: 'inline-radio',
      options: ['compact', 'default', 'comfortable'],
      description: 'Controls vertical density — how tightly items are packed.',
      table: { defaultValue: { summary: 'default' } },
    },
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Whether items are selectable and how many can be selected at once.',
      table: { defaultValue: { summary: 'single' } },
    },
    selectionBehavior: {
      control: 'inline-radio',
      options: ['replace', 'toggle'],
      description: 'Whether clicking an item replaces the selection or toggles it.',
      table: { defaultValue: { summary: 'replace' } },
    },
    loopFocus: {
      control: 'boolean',
      description: 'Whether keyboard navigation wraps around from the last item to the first.',
      table: { defaultValue: { summary: 'false' } },
    },
    typeahead: {
      control: 'boolean',
      description: 'Whether typing characters focuses the matching item via typeahead search.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  parameters: {
    controls: {
      include: ['size', 'density', 'selectionMode', 'selectionBehavior', 'loopFocus', 'typeahead'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof List>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Playground: Story = {
  render: (args) => (
    <List {...args} style={{ width: 320, maxHeight: 400 }}>
      <List.Viewport>
        <List.Item itemKey="apple" textValue="Apple">
          <List.ItemIcon>
            <LuApple />
          </List.ItemIcon>
          <List.ItemLabel>Apple</List.ItemLabel>
          <List.ItemDescription>A crisp red fruit</List.ItemDescription>
        </List.Item>
        <List.Item itemKey="cherry" textValue="Cherry">
          <List.ItemIcon>
            <LuCherry />
          </List.ItemIcon>
          <List.ItemLabel>Cherry</List.ItemLabel>
          <List.ItemDescription>A small red stone fruit</List.ItemDescription>
        </List.Item>
        <List.Item itemKey="citrus" textValue="Citrus">
          <List.ItemIcon>
            <LuCitrus />
          </List.ItemIcon>
          <List.ItemLabel>Citrus</List.ItemLabel>
          <List.ItemDescription>A bright tangy fruit</List.ItemDescription>
        </List.Item>
        <List.Item itemKey="grape" textValue="Grape">
          <List.ItemIcon>
            <LuGrape />
          </List.ItemIcon>
          <List.ItemLabel>Grape</List.ItemLabel>
          <List.ItemDescription>A small round fruit for wine</List.ItemDescription>
        </List.Item>
      </List.Viewport>
    </List>
  ),
};

// ---------------------------------------------------------------------------

const fruits = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry' },
  { id: 'date', label: 'Date' },
  { id: 'elderberry', label: 'Elderberry' },
  { id: 'fig', label: 'Fig' },
  { id: 'grape', label: 'Grape' },
  { id: 'honeydew', label: 'Honeydew' },
];

function SingleSelectStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set(['cherry']));
  return (
    <List
      selectionMode="single"
      selectedKeys={selected}
      onSelectedKeysChange={setSelected}
      style={{ width: 320, maxHeight: 400 }}
    >
      <List.Viewport>
        {fruits.map((fruit) => (
          <List.Item key={fruit.id} itemKey={fruit.id} textValue={fruit.label}>
            <List.ItemLabel>{fruit.label}</List.ItemLabel>
          </List.Item>
        ))}
      </List.Viewport>
    </List>
  );
}

export const SingleSelect: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set(['cherry']));

<List
  selectionMode="single"
  selectedKeys={selected}
  onSelectedKeysChange={setSelected}
  style={{ width: 320 }}
>
  <List.Viewport>
    <List.Item itemKey="apple" textValue="Apple">
      <List.ItemLabel>Apple</List.ItemLabel>
    </List.Item>
    <List.Item itemKey="cherry" textValue="Cherry">
      <List.ItemLabel>Cherry</List.ItemLabel>
    </List.Item>
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => <SingleSelectStory />,
};

// ---------------------------------------------------------------------------

function MultiSelectStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());
  return (
    <div>
      <p
        style={{
          marginBottom: 8,
          color: 'var(--ov-color-fg-subtle)',
          fontSize: 'var(--ov-font-size-caption)',
        }}
      >
        Click to select. Ctrl+click to toggle. Shift+click for range. Ctrl+A to select all.
      </p>
      <List
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        style={{ width: 320, maxHeight: 400 }}
      >
        <List.Viewport>
          {fruits.map((fruit) => (
            <List.Item key={fruit.id} itemKey={fruit.id} textValue={fruit.label}>
              <List.ItemLabel>{fruit.label}</List.ItemLabel>
              <List.ItemMeta>{selected.has(fruit.id) ? 'Selected' : ''}</List.ItemMeta>
            </List.Item>
          ))}
        </List.Viewport>
      </List>
      <p
        style={{
          marginTop: 8,
          color: 'var(--ov-color-fg-subtle)',
          fontSize: 'var(--ov-font-size-caption)',
        }}
      >
        Selected: {selected.size === 0 ? 'none' : [...selected].join(', ')}
      </p>
    </div>
  );
}

export const MultiSelect: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());

<List
  selectionMode="multiple"
  selectedKeys={selected}
  onSelectedKeysChange={setSelected}
  style={{ width: 320 }}
>
  <List.Viewport>
    <List.Item itemKey="apple" textValue="Apple">
      <List.ItemLabel>Apple</List.ItemLabel>
      <List.ItemMeta>{selected.has('apple') ? 'Selected' : ''}</List.ItemMeta>
    </List.Item>
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => <MultiSelectStory />,
};

// ---------------------------------------------------------------------------

export const WithGroups: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<List selectionMode="single" style={{ width: 320 }}>
  <List.Viewport>
    <List.Group>
      <List.GroupHeader>Workloads</List.GroupHeader>
      <List.Item itemKey="pods" textValue="Pods">
        <List.ItemIcon><LuBox /></List.ItemIcon>
        <List.ItemLabel>Pods</List.ItemLabel>
      </List.Item>
    </List.Group>
    <List.Separator />
    <List.Group>
      <List.GroupHeader>Networking</List.GroupHeader>
      <List.Item itemKey="services" textValue="Services">
        <List.ItemIcon><LuNetwork /></List.ItemIcon>
        <List.ItemLabel>Services</List.ItemLabel>
      </List.Item>
    </List.Group>
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => (
    <List selectionMode="single" style={{ width: 320 }}>
      <List.Viewport>
        <List.Group>
          <List.GroupHeader>Workloads</List.GroupHeader>
          <List.Item itemKey="pods" textValue="Pods">
            <List.ItemIcon>
              <LuBox />
            </List.ItemIcon>
            <List.ItemLabel>Pods</List.ItemLabel>
          </List.Item>
          <List.Item itemKey="deployments" textValue="Deployments">
            <List.ItemIcon>
              <LuRocket />
            </List.ItemIcon>
            <List.ItemLabel>Deployments</List.ItemLabel>
          </List.Item>
        </List.Group>
        <List.Separator />
        <List.Group>
          <List.GroupHeader>Networking</List.GroupHeader>
          <List.Item itemKey="services" textValue="Services">
            <List.ItemIcon>
              <LuNetwork />
            </List.ItemIcon>
            <List.ItemLabel>Services</List.ItemLabel>
          </List.Item>
          <List.Item itemKey="events" textValue="Events">
            <List.ItemIcon>
              <LuCalendar />
            </List.ItemIcon>
            <List.ItemLabel>Events</List.ItemLabel>
          </List.Item>
        </List.Group>
      </List.Viewport>
    </List>
  ),
};

// ---------------------------------------------------------------------------

export const DisabledItems: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<List selectionMode="single" disabledKeys={['banana', 'fig']} style={{ width: 320 }}>
  <List.Viewport>
    <List.Item itemKey="apple" textValue="Apple">
      <List.ItemLabel>Apple</List.ItemLabel>
    </List.Item>
    <List.Item itemKey="banana" textValue="Banana">
      <List.ItemLabel>Banana</List.ItemLabel>
    </List.Item>
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => (
    <List selectionMode="single" disabledKeys={['banana', 'fig']} style={{ width: 320 }}>
      <List.Viewport>
        {fruits.map((fruit) => (
          <List.Item key={fruit.id} itemKey={fruit.id} textValue={fruit.label}>
            <List.ItemLabel>{fruit.label}</List.ItemLabel>
          </List.Item>
        ))}
      </List.Viewport>
    </List>
  ),
};

// ---------------------------------------------------------------------------

export const EmptyState: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<List style={{ width: 320 }}>
  <List.Viewport>
    <List.Empty>No items found</List.Empty>
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => (
    <List style={{ width: 320 }}>
      <List.Viewport>
        <List.Empty>No items found</List.Empty>
      </List.Viewport>
    </List>
  ),
};

// ---------------------------------------------------------------------------

export const LoadingState: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<List loading style={{ width: 320 }}>
  <List.Viewport>
    <List.Loading />
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => (
    <List loading style={{ width: 320 }}>
      <List.Viewport>
        <List.Loading />
      </List.Viewport>
    </List>
  ),
};

// ---------------------------------------------------------------------------

export const DensityVariants: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<List selectionMode="single" density="compact" style={{ width: 220 }}>
  <List.Viewport>
    <List.Item itemKey="apple" textValue="Apple">
      <List.ItemLabel>Apple</List.ItemLabel>
    </List.Item>
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {(['compact', 'default', 'comfortable'] as const).map((density) => (
        <div key={density}>
          <p
            style={{
              marginBottom: 8,
              color: 'var(--ov-color-fg-subtle)',
              fontSize: 'var(--ov-font-size-caption)',
            }}
          >
            {density}
          </p>
          <List selectionMode="single" density={density} style={{ width: 220 }}>
            <List.Viewport>
              {fruits.slice(0, 5).map((fruit) => (
                <List.Item key={fruit.id} itemKey={fruit.id} textValue={fruit.label}>
                  <List.ItemLabel>{fruit.label}</List.ItemLabel>
                </List.Item>
              ))}
            </List.Viewport>
          </List>
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------

export const WithItemActions: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<List selectionMode="single" style={{ width: 360 }}>
  <List.Viewport>
    <List.Item itemKey="apple" textValue="Apple">
      <List.ItemIcon><LuApple /></List.ItemIcon>
      <List.ItemLabel>Apple</List.ItemLabel>
      <List.ItemActions>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
          }}
        >
          Edit
        </button>
      </List.ItemActions>
    </List.Item>
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => (
    <List selectionMode="single" style={{ width: 360 }}>
      <List.Viewport>
        {fruits.map((fruit) => (
          <List.Item key={fruit.id} itemKey={fruit.id} textValue={fruit.label}>
            <List.ItemLabel>{fruit.label}</List.ItemLabel>
            <List.ItemActions>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Editing ${fruit.label}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ov-color-fg-muted)',
                  cursor: 'pointer',
                  fontSize: 'var(--ov-font-size-caption)',
                }}
              >
                Edit
              </button>
            </List.ItemActions>
          </List.Item>
        ))}
      </List.Viewport>
    </List>
  ),
};

// ---------------------------------------------------------------------------

const largeItems = Array.from({ length: 500 }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}));

function LargeListStory() {
  const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());
  return (
    <div>
      <p
        style={{
          marginBottom: 8,
          color: 'var(--ov-color-fg-subtle)',
          fontSize: 'var(--ov-font-size-caption)',
        }}
      >
        {largeItems.length} items. Selected: {selected.size}
      </p>
      <List
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        style={{ width: 320, height: 400 }}
      >
        <List.Viewport>
          {largeItems.map((item) => (
            <List.Item key={item.id} itemKey={item.id} textValue={item.label}>
              <List.ItemLabel>{item.label}</List.ItemLabel>
            </List.Item>
          ))}
        </List.Viewport>
      </List>
    </div>
  );
}

export const LargeList: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `const items = Array.from({ length: 500 }, (_, i) => ({
  id: \`item-\${i}\`,
  label: \`Item \${i + 1}\`,
}));
const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());

<List
  selectionMode="multiple"
  selectedKeys={selected}
  onSelectedKeysChange={setSelected}
  style={{ width: 320, height: 400 }}
>
  <List.Viewport>
    {items.map((item) => (
      <List.Item key={item.id} itemKey={item.id} textValue={item.label}>
        <List.ItemLabel>{item.label}</List.ItemLabel>
      </List.Item>
    ))}
  </List.Viewport>
</List>`,
      },
    },
  },
  render: () => <LargeListStory />,
};
