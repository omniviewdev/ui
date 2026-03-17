import type { Meta, StoryObj } from '@storybook/react';
import { LuFolderSearch, LuWand } from 'react-icons/lu';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Components/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    defaultValue: 'omniview',
    placeholder: 'Search workspaces...',
    clearable: true,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    startDecorator: { control: false, table: { disable: true } },
    endDecorator: { control: false, table: { disable: true } },
    clearDecorator: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <SearchInput {...args} />
    </div>
  ),
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Decorated: Story = {
  args: {
    variant: 'outline',
    color: 'brand',
    defaultValue: 'runtime',
    startDecorator: <LuFolderSearch aria-hidden />,
    endDecorator: <LuWand aria-hidden />,
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ width: 420, display: 'grid', gap: 12 }}>
      <SearchInput {...args} size="sm" defaultValue="small" />
      <SearchInput {...args} size="md" defaultValue="medium" />
      <SearchInput {...args} size="lg" defaultValue="large" />
    </div>
  ),
};
