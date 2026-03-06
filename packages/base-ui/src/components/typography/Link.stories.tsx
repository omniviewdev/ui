import type { Meta, StoryObj } from '@storybook/react';
import { Link, type LinkProps } from './Link';

const meta = {
  title: 'Typography/Link',
  component: Link,
  tags: ['autodocs'],
  args: {
    href: '#',
    size: 'md',
    tone: 'brand',
    underline: 'hover',
    truncate: false,
    children: 'Open runtime diagnostics and troubleshooting docs',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'brand', 'success', 'warning', 'danger'],
    },
    underline: { control: 'inline-radio', options: ['hover', 'always', 'none'] },
    truncate: { control: 'select', options: [false, true, 2, 3] },
  },
  render: (args) => (
    <div style={{ maxWidth: 280 }}>
      <Link {...args} />
    </div>
  ),
} satisfies Meta<LinkProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
