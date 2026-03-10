import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AIBranch,
  AIBranchContent,
  AIBranchSelector,
  AIBranchPrevious,
  AIBranchNext,
  AIBranchIndicator,
} from './AIBranch';

const meta: Meta<typeof AIBranch> = {
  title: 'AI/Branching/AIBranch',
  component: AIBranch,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic interactive example
export const Playground: Story = {
  render: () => {
    const [active, setActive] = useState(0);
    return (
      <AIBranch count={3} active={active} onChange={setActive}>
        <AIBranchSelector />
        <AIBranchContent index={0}>
          <div style={{ padding: 16, border: '1px solid var(--ov-color-border-default)', borderRadius: 8, marginTop: 8 }}>
            <strong>Branch 1:</strong> The original response about React hooks and state management.
          </div>
        </AIBranchContent>
        <AIBranchContent index={1}>
          <div style={{ padding: 16, border: '1px solid var(--ov-color-border-default)', borderRadius: 8, marginTop: 8 }}>
            <strong>Branch 2:</strong> An alternative approach using context and reducers for global state.
          </div>
        </AIBranchContent>
        <AIBranchContent index={2}>
          <div style={{ padding: 16, border: '1px solid var(--ov-color-border-default)', borderRadius: 8, marginTop: 8 }}>
            <strong>Branch 3:</strong> A third take focusing on server-side state with TanStack Query.
          </div>
        </AIBranchContent>
      </AIBranch>
    );
  },
};

// Two branches (regenerate scenario)
export const Regenerate: Story = {
  render: () => {
    const [active, setActive] = useState(0);
    return (
      <AIBranch count={2} active={active} onChange={setActive}>
        <AIBranchContent index={0}>
          <div style={{ padding: 16, background: 'var(--ov-color-surface-subtle)', borderRadius: 8 }}>
            Here is the original response to your question about Kubernetes pod scheduling.
          </div>
        </AIBranchContent>
        <AIBranchContent index={1}>
          <div style={{ padding: 16, background: 'var(--ov-color-surface-subtle)', borderRadius: 8 }}>
            Here is a regenerated response with more detail about node affinity rules and taints.
          </div>
        </AIBranchContent>
        <AIBranchSelector align="end" />
      </AIBranch>
    );
  },
};

// Custom selector layout
export const CustomSelector: Story = {
  render: () => {
    const [active, setActive] = useState(1);
    return (
      <AIBranch count={4} active={active} onChange={setActive}>
        <AIBranchSelector align="start">
          <AIBranchPrevious />
          <AIBranchIndicator />
          <AIBranchNext />
        </AIBranchSelector>
        <AIBranchContent index={0}>
          <p>Approach 1: Horizontal Pod Autoscaler</p>
        </AIBranchContent>
        <AIBranchContent index={1}>
          <p>Approach 2: Vertical Pod Autoscaler</p>
        </AIBranchContent>
        <AIBranchContent index={2}>
          <p>Approach 3: Cluster Autoscaler</p>
        </AIBranchContent>
        <AIBranchContent index={3}>
          <p>Approach 4: KEDA event-driven autoscaling</p>
        </AIBranchContent>
      </AIBranch>
    );
  },
};

// Single branch (no navigation)
export const SingleBranch: Story = {
  render: () => (
    <AIBranch count={1} active={0}>
      <AIBranchSelector />
      <AIBranchContent index={0}>
        <p>Only one response — the selector shows &quot;1 of 1&quot;.</p>
      </AIBranchContent>
    </AIBranch>
  ),
};
