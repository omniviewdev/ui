import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta = {
  title: 'Layout/Box',
  component: Box,
  tags: ['autodocs'],
  args: {
    children: 'A minimal polymorphic box container.',
    style: { padding: 16, border: '1px solid var(--ov-color-border-muted)' },
  },
  argTypes: {
    as: {
      control: 'select',
      options: [
        'div',
        'span',
        'section',
        'article',
        'aside',
        'main',
        'nav',
        'header',
        'footer',
        'ul',
        'ol',
        'li',
      ],
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Polymorphic: Story = {
  name: 'Polymorphic Elements',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['div', 'span', 'section', 'article', 'aside', 'nav', 'header', 'footer'] as const).map(
        (tag) => (
          <Box
            key={tag}
            as={tag}
            style={{
              padding: 12,
              border: '1px solid var(--ov-color-border-muted)',
              fontSize: 'var(--ov-font-size-caption)',
            }}
          >
            &lt;{tag}&gt;
          </Box>
        ),
      )}
    </div>
  ),
};
