import type { Meta, StoryObj } from '@storybook/react';
import { LuInbox, LuSearch, LuFileX } from 'react-icons/lu';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No items found',
    size: 'md',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'No items found',
    description: 'Try changing your search or filters.',
    icon: <LuInbox />,
    action: <button type="button">Clear filters</button>,
  },
};

export const SizeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <EmptyState
          key={size}
          size={size}
          title={`Size: ${size}`}
          description="This is a description for this size variant."
          icon={<LuInbox />}
        />
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    title: 'No search results',
    icon: <LuSearch />,
  },
};

export const WithAction: Story = {
  args: {
    title: 'No files',
    description: 'Upload a file to get started.',
    action: <button type="button">Upload file</button>,
  },
};

export const FullExample: Story = {
  args: {
    title: 'No documents',
    description:
      'There are no documents matching your criteria. Try adjusting your search or upload a new file.',
    icon: <LuFileX />,
    action: (
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button">Upload</button>
        <button type="button">Clear filters</button>
      </div>
    ),
    size: 'lg',
  },
};
