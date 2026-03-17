import type { Meta, StoryObj } from '@storybook/react';
import { LuInbox, LuSearch, LuFileX, LuUpload, LuFilterX } from 'react-icons/lu';
import { Button } from '../button/Button';
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
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
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
    action: (
      <Button variant="soft" color="brand">
        Clear filters
      </Button>
    ),
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
    description: 'Try a different search term.',
    icon: <LuSearch />,
  },
};

export const WithAction: Story = {
  args: {
    title: 'No files',
    description: 'Upload a file to get started.',
    action: (
      <Button variant="solid" color="brand" startDecorator={<LuUpload />}>
        Upload file
      </Button>
    ),
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
        <Button variant="solid" color="brand" startDecorator={<LuUpload />}>
          Upload
        </Button>
        <Button variant="ghost" color="neutral" startDecorator={<LuFilterX />}>
          Clear filters
        </Button>
      </div>
    ),
    size: 'lg',
  },
};
