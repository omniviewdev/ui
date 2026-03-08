import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette, type CommandItem, type CommandPaletteProps } from './CommandPalette';

const sampleCommands: CommandItem[] = [
  { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', group: 'File' },
  { id: 'open-file', label: 'Open File', shortcut: 'Ctrl+O', group: 'File' },
  { id: 'save', label: 'Save', shortcut: 'Ctrl+S', group: 'File' },
  { id: 'save-as', label: 'Save As…', shortcut: 'Ctrl+Shift+S', group: 'File' },
  { id: 'find', label: 'Find', shortcut: 'Ctrl+F', group: 'Edit' },
  { id: 'replace', label: 'Replace', shortcut: 'Ctrl+H', group: 'Edit' },
  { id: 'find-files', label: 'Find in Files', shortcut: 'Ctrl+Shift+F', group: 'Search' },
  { id: 'toggle-terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`', group: 'View' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', group: 'View' },
  { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl++', group: 'View' },
  { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', group: 'View' },
  { id: 'git-commit', label: 'Git: Commit', group: 'Source Control' },
  { id: 'git-push', label: 'Git: Push', group: 'Source Control' },
];

const meta: Meta<typeof CommandPalette> = {
  title: 'Editors/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: () => {},
    onSelect: () => {},
    commands: sampleCommands,
    placeholder: 'Type a command…',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Command Palette</button>
      <CommandPalette
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <PlaygroundStory {...args} />,
};

function ManyCommandsStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  const manyCommands = Array.from({ length: 50 }, (_, i) => ({
    id: `cmd-${i}`,
    label: `Command ${i + 1}`,
    description: `Description for command ${i + 1}`,
    group: `Group ${Math.floor(i / 10) + 1}`,
  }));
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      <CommandPalette
        {...args}
        commands={manyCommands}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </div>
  );
}

export const WithManyCommands: Story = {
  render: (args) => <ManyCommandsStory {...args} />,
};
