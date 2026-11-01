import type { Meta, StoryObj } from '@storybook/react';
import { KeyChord, ShortcutSummary } from './ShortcutSummary';

const meta = {
  title: 'Data Display/ShortcutSummary',
  component: ShortcutSummary,
  tags: ['autodocs'],
  args: {
    title: 'Keyboard & mouse',
    size: 'sm',
    platform: 'auto',
    items: [
      { id: 'navigate', keys: ['ArrowUp'], alternatives: [['ArrowDown']], description: 'Navigate' },
      { id: 'expand', keys: ['ArrowRight'], description: 'Expand' },
      { id: 'collapse', keys: ['ArrowLeft'], description: 'Collapse / parent' },
      { id: 'ends', keys: ['Home'], alternatives: [['End']], description: 'First / last' },
      { id: 'open', keys: ['Enter'], description: 'Open' },
      {
        id: 'select',
        keys: ['Space'],
        alternatives: [['Mod', 'Click']],
        description: 'Toggle selection',
      },
      { id: 'range', keys: ['Shift', 'Click'], description: 'Select range' },
      { id: 'actions', keys: ['Right-click'], description: 'Actions' },
    ],
    style: { maxWidth: 420 },
  },
  argTypes: {
    platform: { control: 'select', options: ['auto', 'mac', 'windows', 'linux'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof ShortcutSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {};

export const Editor: Story = {
  args: {
    title: 'Editor',
    platform: 'mac',
    items: [
      { id: 'save', keys: ['Mod', 'S'], description: 'Save file' },
      { id: 'find', keys: ['Mod', 'F'], description: 'Find in file' },
      {
        id: 'palette',
        keys: ['Mod', 'Shift', 'P'],
        alternatives: [['F1']],
        description: 'Command palette',
      },
      { id: 'close', keys: ['Escape'], description: 'Close suggestions' },
    ],
  },
};

export const Canvas: Story = {
  args: {
    title: 'Canvas',
    platform: 'windows',
    items: [
      { id: 'pan', keys: ['Space', 'Drag'], description: 'Pan canvas' },
      { id: 'zoom', keys: ['Mod', 'Scroll'], description: 'Zoom' },
      { id: 'duplicate', keys: ['Alt', 'Drag'], description: 'Duplicate object' },
      { id: 'edit', keys: ['Double-click'], description: 'Edit object' },
    ],
  },
};

export const Narrow: Story = {
  args: { style: { width: 260 }, size: 'xs' },
};

export const InlineChords: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <span>
        Search commands <KeyChord keys={['Mod', 'K']} platform="mac" />
      </span>
      <span>
        Search commands <KeyChord keys={['Mod', 'K']} platform="windows" />
      </span>
      <span>
        Select range <KeyChord keys={['Shift', 'Click']} />
      </span>
    </div>
  ),
};
