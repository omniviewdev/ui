import type { Meta, StoryObj } from '@storybook/react';
import { AISources } from './AISources';

const meta = {
  title: 'AI/Content/AISources',
  component: AISources,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AISources>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    sources: [
      { id: '1', label: 'Kubernetes Docs: Pod Scheduling', detail: 'kubernetes.io/docs/concepts/scheduling' },
      { id: '2', label: 'Node Affinity Rules', detail: 'kubernetes.io/docs/tasks/configure-pod' },
      { id: '3', label: 'Resource Management', detail: 'kubernetes.io/docs/concepts/configuration' },
    ],
    onNavigate: (source) => alert(`Navigate to: ${source.label}`),
  },
};

export const SingleSource: Story = {
  args: {
    sources: [
      { id: '1', label: 'React Documentation', detail: 'react.dev/reference/react' },
    ],
    onNavigate: () => {},
  },
};

export const ManySources: Story = {
  args: {
    sources: Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      label: `Source document ${i + 1}`,
      detail: `path/to/source-${i + 1}.md`,
    })),
    onNavigate: () => {},
  },
};
