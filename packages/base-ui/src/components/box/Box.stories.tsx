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

const cellStyle = {
  padding: 12,
  border: '1px solid var(--ov-color-border-muted)',
  fontSize: 'var(--ov-font-size-caption)',
};

export const Polymorphic: Story = {
  name: 'Polymorphic Elements',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['div', 'span', 'section', 'article', 'aside', 'main', 'nav', 'header', 'footer'] as const).map(
        (tag) => (
          <Box key={tag} as={tag} style={cellStyle}>
            &lt;{tag}&gt;
          </Box>
        ),
      )}

      {/* List elements with semantically correct children */}
      <Box as="ul" style={{ ...cellStyle, listStyle: 'disc', paddingLeft: 32 }}>
        <Box as="li">&lt;ul&gt; → &lt;li&gt; item 1</Box>
        <Box as="li">&lt;ul&gt; → &lt;li&gt; item 2</Box>
      </Box>

      <Box as="ol" style={{ ...cellStyle, listStyle: 'decimal', paddingLeft: 32 }}>
        <Box as="li">&lt;ol&gt; → &lt;li&gt; item 1</Box>
        <Box as="li">&lt;ol&gt; → &lt;li&gt; item 2</Box>
      </Box>
    </div>
  ),
};
