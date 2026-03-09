import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CommandPalette, type CommandItem, type CommandPaletteProps } from './CommandPalette';

const sampleCommands: CommandItem[] = [
  { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', group: 'File' },
  { id: 'open-file', label: 'Open File', shortcut: 'Ctrl+O', group: 'File' },
  { id: 'save', label: 'Save', shortcut: 'Ctrl+S', group: 'File' },
  { id: 'save-as', label: 'Save As…', shortcut: 'Ctrl+Shift+S', group: 'File' },
  { id: 'close-tab', label: 'Close Tab', shortcut: 'Ctrl+W', group: 'File' },
  { id: 'find', label: 'Find', shortcut: 'Ctrl+F', group: 'Edit' },
  { id: 'replace', label: 'Replace', shortcut: 'Ctrl+H', group: 'Edit' },
  { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', group: 'Edit' },
  { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', group: 'Edit' },
  { id: 'find-files', label: 'Find in Files', shortcut: 'Ctrl+Shift+F', group: 'Search' },
  { id: 'toggle-terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`', group: 'View' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', group: 'View' },
  { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl++', group: 'View' },
  { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', group: 'View' },
  { id: 'git-commit', label: 'Git: Commit', group: 'Source Control' },
  { id: 'git-push', label: 'Git: Push', group: 'Source Control' },
  { id: 'git-pull', label: 'Git: Pull', group: 'Source Control' },
  { id: 'git-stash', label: 'Git: Stash Changes', group: 'Source Control' },
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
  argTypes: {
    open: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open Command Palette</button>
      {lastSelected && (
        <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>Last selected: {lastSelected}</p>
      )}
      <CommandPalette
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(cmd) => {
          setLastSelected(cmd.label);
          setOpen(false);
        }}
      />
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <PlaygroundStory {...args} />,
};

function ManyCommandsStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  const manyCommands = Array.from({ length: 100 }, (_, i) => ({
    id: `cmd-${i}`,
    label: `Command ${i + 1}`,
    description: `Description for command ${i + 1}`,
    group: `Group ${Math.floor(i / 10) + 1}`,
  }));
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open (100 commands)</button>
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

/** Commands with descriptions showing additional context. */
function WithDescriptionsStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  const commands: CommandItem[] = [
    {
      id: 'k8s-pods',
      label: 'Kubernetes: List Pods',
      description: 'Show all pods in the current namespace',
      group: 'Kubernetes',
    },
    {
      id: 'k8s-deploy',
      label: 'Kubernetes: Create Deployment',
      description: 'Deploy a new application to the cluster',
      group: 'Kubernetes',
    },
    {
      id: 'k8s-logs',
      label: 'Kubernetes: View Logs',
      description: 'Stream logs from a running pod',
      group: 'Kubernetes',
    },
    {
      id: 'docker-build',
      label: 'Docker: Build Image',
      description: 'Build a container image from Dockerfile',
      group: 'Docker',
    },
    {
      id: 'docker-push',
      label: 'Docker: Push Image',
      description: 'Push image to container registry',
      group: 'Docker',
    },
  ];
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <CommandPalette
        {...args}
        commands={commands}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </div>
  );
}

export const WithDescriptions: Story = {
  render: (args) => <WithDescriptionsStory {...args} />,
};

/** Demonstrates disabled commands being filtered out. */
function WithDisabledStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  const commands: CommandItem[] = [
    { id: 'save', label: 'Save', shortcut: 'Ctrl+S', group: 'File' },
    { id: 'save-as', label: 'Save As…', shortcut: 'Ctrl+Shift+S', group: 'File' },
    { id: 'revert', label: 'Revert File', group: 'File', disabled: true },
    { id: 'close', label: 'Close', shortcut: 'Ctrl+W', group: 'File' },
    { id: 'deploy', label: 'Deploy to Staging', group: 'Actions', disabled: true },
    { id: 'publish', label: 'Publish Package', group: 'Actions', disabled: true },
    { id: 'test', label: 'Run Tests', shortcut: 'Ctrl+Shift+T', group: 'Actions' },
  ];
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open (disabled items hidden)</button>
      <CommandPalette
        {...args}
        commands={commands}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </div>
  );
}

export const WithDisabledCommands: Story = {
  render: (args) => <WithDisabledStory {...args} />,
};

/** Empty command list edge case. */
function EmptyStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open (empty)</button>
      <CommandPalette
        {...args}
        commands={[]}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </div>
  );
}

export const EmptyCommands: Story = {
  render: (args) => <EmptyStory {...args} />,
};

/** Commands without groups — flat list. */
function UngroupedStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  const commands: CommandItem[] = [
    { id: 'action-1', label: 'Format Document', shortcut: 'Shift+Alt+F' },
    { id: 'action-2', label: 'Toggle Word Wrap', shortcut: 'Alt+Z' },
    { id: 'action-3', label: 'Sort Lines Ascending' },
    { id: 'action-4', label: 'Sort Lines Descending' },
    { id: 'action-5', label: 'Transform to Uppercase' },
    { id: 'action-6', label: 'Transform to Lowercase' },
    { id: 'action-7', label: 'Trim Trailing Whitespace' },
  ];
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open (ungrouped)</button>
      <CommandPalette
        {...args}
        commands={commands}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </div>
  );
}

export const UngroupedCommands: Story = {
  render: (args) => <UngroupedStory {...args} />,
};

/** Custom placeholder text. */
function CustomPlaceholderStory(args: CommandPaletteProps) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <CommandPalette
        {...args}
        placeholder="Search Kubernetes resources…"
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
      />
    </div>
  );
}

export const CustomPlaceholder: Story = {
  render: (args) => <CustomPlaceholderStory {...args} />,
};
