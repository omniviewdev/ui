import type { Meta, StoryObj } from '@storybook/react';
import {
  LuScissors,
  LuClipboard,
  LuClipboardPaste,
  LuUndo2,
  LuRedo2,
  LuBold,
  LuItalic,
  LuUnderline,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuFilePlus,
  LuFolderOpen,
  LuSave,
  LuSettings,
  LuCircleHelp,
} from 'react-icons/lu';
import { Toolbar } from './Toolbar';
import { Button } from '../button';
import { IconButton } from '../icon-button';

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
        <IconButton variant="ghost" size="sm" aria-label="Cut"><LuScissors /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Copy"><LuClipboard /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Paste"><LuClipboardPaste /></IconButton>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <IconButton variant="ghost" size="sm" aria-label="Undo"><LuUndo2 /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Redo"><LuRedo2 /></IconButton>
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
        <IconButton variant="ghost" size="sm" aria-label="Bold"><LuBold /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Italic"><LuItalic /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Underline"><LuUnderline /></IconButton>
      </Toolbar.Group>
      <Toolbar.Group>
        <IconButton variant="ghost" size="sm" aria-label="Align left"><LuAlignLeft /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Center"><LuAlignCenter /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Align right"><LuAlignRight /></IconButton>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const WithSeparators: Story = {
  name: 'With separators between groups',
  render: () => (
    <Toolbar aria-label="Editor actions">
      <Toolbar.Group>
        <Button variant="ghost" size="sm" startDecorator={<LuFilePlus />}>New</Button>
        <Button variant="ghost" size="sm" startDecorator={<LuFolderOpen />}>Open</Button>
        <Button variant="ghost" size="sm" startDecorator={<LuSave />}>Save</Button>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <IconButton variant="ghost" size="sm" aria-label="Cut"><LuScissors /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Copy"><LuClipboard /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Paste"><LuClipboardPaste /></IconButton>
      </Toolbar.Group>
      <Toolbar.Group separator>
        <IconButton variant="ghost" size="sm" aria-label="Undo"><LuUndo2 /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Redo"><LuRedo2 /></IconButton>
      </Toolbar.Group>
    </Toolbar>
  ),
};

export const RightAlignedGroup: Story = {
  name: 'Right-aligned group',
  render: () => (
    <Toolbar aria-label="Document actions" style={{ width: '100%' }}>
      <Toolbar.Group>
        <Button variant="ghost" size="sm" startDecorator={<LuSave />}>Save</Button>
        <Button variant="ghost" size="sm">Save As</Button>
      </Toolbar.Group>
      <Toolbar.Group separator style={{ marginInlineStart: 'auto' }}>
        <IconButton variant="ghost" size="sm" aria-label="Settings"><LuSettings /></IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Help"><LuCircleHelp /></IconButton>
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
          <div style={{ marginBottom: '0.25rem', fontSize: '0.75rem', opacity: 0.5 }}>
            size=&quot;{size}&quot;
          </div>
          <Toolbar aria-label={`Toolbar ${size}`} size={size}>
            <Toolbar.Group>
              <IconButton variant="ghost" size="sm" aria-label="Cut"><LuScissors /></IconButton>
              <IconButton variant="ghost" size="sm" aria-label="Copy"><LuClipboard /></IconButton>
              <IconButton variant="ghost" size="sm" aria-label="Paste"><LuClipboardPaste /></IconButton>
            </Toolbar.Group>
            <Toolbar.Group separator>
              <IconButton variant="ghost" size="sm" aria-label="Undo"><LuUndo2 /></IconButton>
              <IconButton variant="ghost" size="sm" aria-label="Redo"><LuRedo2 /></IconButton>
            </Toolbar.Group>
          </Toolbar>
        </div>
      ))}
    </div>
  ),
};
