import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar } from './Toolbar';

const meta = {
  title: 'Navigation/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  args: {
    size: 'md',
    'aria-label': 'Toolbar',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => (
    <Toolbar {...args}>
      <Toolbar.Group>
        <button>Cut</button>
        <button>Copy</button>
        <button>Paste</button>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <button>Undo</button>
        <button>Redo</button>
      </Toolbar.Group>
    </Toolbar>
  ),
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const BasicToolbar: Story = {
  name: 'Basic toolbar with groups',
  render: () => (
    <Toolbar aria-label="Text formatting">
      <Toolbar.Group>
        <button>Bold</button>
        <button>Italic</button>
        <button>Underline</button>
      </Toolbar.Group>
      <Toolbar.Group>
        <button>Align left</button>
        <button>Center</button>
        <button>Align right</button>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const WithSeparators: Story = {
  name: 'With separators between groups',
  render: () => (
    <Toolbar aria-label="Editor actions">
      <Toolbar.Group>
        <button>New</button>
        <button>Open</button>
        <button>Save</button>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <button>Cut</button>
        <button>Copy</button>
        <button>Paste</button>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <button>Undo</button>
        <button>Redo</button>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const RightAlignedGroup: Story = {
  name: 'Right-aligned group',
  render: () => (
    <Toolbar aria-label="Document actions" style={{ width: '100%' }}>
      <Toolbar.Group>
        <button>Save</button>
        <button>Save As</button>
      </Toolbar.Group>
      <Toolbar.Group separator style={{ marginInlineStart: 'auto' }}>
        <button>Settings</button>
        <button>Help</button>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', color: '#888' }}>
            size=&quot;{size}&quot;
          </div>
          <Toolbar aria-label={`Toolbar ${size}`} size={size}>
            <Toolbar.Group>
              <button>Cut</button>
              <button>Copy</button>
              <button>Paste</button>
            </Toolbar.Group>
            <Toolbar.Group separator>
              <button>Undo</button>
              <button>Redo</button>
            </Toolbar.Group>
          </Toolbar>
        </div>
      ))}
    </div>
  ),
};
