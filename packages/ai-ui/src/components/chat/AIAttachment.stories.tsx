import type { Meta, StoryObj } from '@storybook/react';
import { AIAttachment } from './AIAttachment';

const meta = {
  title: 'AI/Chat/AIAttachment',
  component: AIAttachment,
  tags: ['autodocs'],
  args: {
    name: 'deployment.yaml',
    type: 'file',
    size: 4096,
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['file', 'image', 'code', 'document'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AIAttachment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ImageWithPreview: Story = {
  args: {
    name: 'screenshot.png',
    type: 'image',
    size: 2_400_000,
    previewUrl: 'https://via.placeholder.com/240x120/1a1a2e/ffffff?text=Preview',
    onRemove: () => {},
  },
};

export const CodeFile: Story = {
  args: {
    name: 'main.go',
    type: 'code',
    size: 12_800,
    onRemove: () => {},
  },
};

export const LargeDocument: Story = {
  args: {
    name: 'architecture-decisions-record-very-long-filename.pdf',
    type: 'document',
    size: 15_700_000,
  },
};

export const MultipleAttachments: Story = {
  name: 'Multiple Attachments',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <AIAttachment name="deployment.yaml" type="file" size={4096} onRemove={() => {}} />
      <AIAttachment name="main.go" type="code" size={12_800} onRemove={() => {}} />
      <AIAttachment name="screenshot.png" type="image" size={2_400_000} onRemove={() => {}} />
      <AIAttachment name="README.md" type="document" size={3_200} />
    </div>
  ),
};
