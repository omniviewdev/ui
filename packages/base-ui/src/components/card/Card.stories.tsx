import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      source: {
        code: `<Card variant="soft" color="neutral" size="md" style={{ width: 420 }}>
  <Card.Header>
    <Card.Title>Workspace Session</Card.Title>
    <Card.Description>Connected to cluster and ready for operations.</Card.Description>
  </Card.Header>
  <Card.Body>Last sync 7s ago. No blocking diagnostics. Build queue is currently idle.</Card.Body>
  <Card.Footer>
    <Button color="brand" variant="solid">Open</Button>
    <Button variant="ghost">Dismiss</Button>
  </Card.Footer>
</Card>`,
      },
    },
  },
  render: (args) => (
    <Card {...args} style={{ width: 420 }}>
      <Card.Header>
        <Card.Title>Workspace Session</Card.Title>
        <Card.Description>Connected to cluster and ready for operations.</Card.Description>
      </Card.Header>
      <Card.Body>
        Last sync 7s ago. No blocking diagnostics. Build queue is currently idle.
      </Card.Body>
      <Card.Footer>
        <Button color="brand" variant="solid">
          Open
        </Button>
        <Button variant="ghost">Dismiss</Button>
      </Card.Footer>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
