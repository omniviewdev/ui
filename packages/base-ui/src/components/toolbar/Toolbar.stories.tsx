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
        <button type="button">Cut</button>
        <button type="button">Copy</button>
        <button type="button">Paste</button>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <button type="button">Undo</button>
        <button type="button">Redo</button>
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
        <button type="button">Bold</button>
        <button type="button">Italic</button>
        <button type="button">Underline</button>
      </Toolbar.Group>
      <Toolbar.Group>
        <button type="button">Align left</button>
        <button type="button">Center</button>
        <button type="button">Align right</button>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const WithSeparators: Story = {
  name: 'With separators between groups',
  render: () => (
    <Toolbar aria-label="Editor actions">
      <Toolbar.Group>
        <button type="button">New</button>
        <button type="button">Open</button>
        <button type="button">Save</button>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <button type="button">Cut</button>
        <button type="button">Copy</button>
        <button type="button">Paste</button>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <button type="button">Undo</button>
        <button type="button">Redo</button>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const RightAlignedGroup: Story = {
  name: 'Right-aligned group',
  render: () => (
    <Toolbar aria-label="Document actions" style={{ width: '100%' }}>
      <Toolbar.Group>
        <button type="button">Save</button>
        <button type="button">Save As</button>
      </Toolbar.Group>
      <Toolbar.Group separator style={{ marginInlineStart: 'auto' }}>
        <button type="button">Settings</button>
        <button type="button">Help</button>
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
              <button type="button">Cut</button>
              <button type="button">Copy</button>
              <button type="button">Paste</button>
            </Toolbar.Group>
            <Toolbar.Group separator>
              <button type="button">Undo</button>
              <button type="button">Redo</button>
            </Toolbar.Group>
          </Toolbar>
        </div>
      ))}
    </div>
  ),
};
