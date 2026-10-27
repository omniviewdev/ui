import type { Meta, StoryObj } from '@storybook/react';
import { LuFolderSearch, LuWand } from 'react-icons/lu';
import { SearchInput } from './SearchInput';
import { SearchTrigger } from './SearchTrigger';
import { Hotkey } from '../typography';

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
    color: {
      control: 'select',
      options: [
        'neutral',
        'brand',
        'success',
        'warning',
        'danger',
        'info',
        'discovery',
        'secondary',
      ],
    },
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

/** Header launchers use native buttons, with the same shell and radius as search inputs. */
export const HeaderTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use SearchTrigger to open a search dialog without presenting a read-only textbox. It shares Input shell tokens and accepts a decorative shortcut slot. Supply an accessible label and aria-keyshortcuts; native Tab, Enter and Space behavior is preserved.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <SearchTrigger
        size="sm"
        variant={args.variant}
        color={args.color}
        disabled={args.disabled}
        placeholder="Search anything…"
        shortcut={<Hotkey size="sm" keys={['Meta', 'K']} />}
        aria-label="Search Omniview"
        aria-keyshortcuts="Meta+K"
      />
    </div>
  ),
};
