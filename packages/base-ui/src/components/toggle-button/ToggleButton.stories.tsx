import type { Meta, StoryObj } from '@storybook/react';
import { LuBell, LuCheck, LuCommand, LuPin, LuSearch, LuWandSparkles } from 'react-icons/lu';
import type { ToggleButtonProps } from './ToggleButton';
import { ToggleButton } from './ToggleButton';

type DecoratorIconOption = 'none' | 'pin' | 'search' | 'check' | 'command' | 'bell' | 'sparkles';

type ToggleButtonStoryArgs = ToggleButtonProps & {
  startIcon: DecoratorIconOption;
  endIcon: DecoratorIconOption;
};

const DECORATOR_ICON_OPTIONS: DecoratorIconOption[] = [
  'none',
  'pin',
  'search',
  'check',
  'command',
  'bell',
  'sparkles',
];

function renderDecoratorIcon(icon: DecoratorIconOption) {
  switch (icon) {
    case 'pin':
      return <LuPin aria-hidden />;
    case 'search':
      return <LuSearch aria-hidden />;
    case 'check':
      return <LuCheck aria-hidden />;
    case 'command':
      return <LuCommand aria-hidden />;
    case 'bell':
      return <LuBell aria-hidden />;
    case 'sparkles':
      return <LuWandSparkles aria-hidden />;
    default:
      return undefined;
  }
}

const meta = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    defaultPressed: false,
    children: 'Follow Logs',
    startIcon: 'pin',
    endIcon: 'none',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    defaultPressed: { control: 'boolean' },
    startIcon: { control: 'select', options: DECORATOR_ICON_OPTIONS },
    endIcon: { control: 'select', options: DECORATOR_ICON_OPTIONS },
    startDecorator: { control: false, table: { disable: true } },
    endDecorator: { control: false, table: { disable: true } },
  },
  render: ({ startIcon, endIcon, ...args }) => (
    <ToggleButton
      {...args}
      startDecorator={renderDecoratorIcon(startIcon)}
      endDecorator={renderDecoratorIcon(endIcon)}
    />
  ),
} satisfies Meta<ToggleButtonStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => {
    const toggleArgs: ToggleButtonProps = {
      color: args.color,
      disabled: args.disabled,
      size: args.size,
      startDecorator: renderDecoratorIcon(args.startIcon),
      endDecorator: renderDecoratorIcon(args.endIcon),
    };

    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <ToggleButton {...toggleArgs} variant="solid" defaultPressed>
          Solid
        </ToggleButton>
        <ToggleButton {...toggleArgs} variant="soft" defaultPressed>
          Soft
        </ToggleButton>
        <ToggleButton {...toggleArgs} variant="outline" defaultPressed>
          Outline
        </ToggleButton>
        <ToggleButton {...toggleArgs} variant="ghost" defaultPressed>
          Ghost
        </ToggleButton>
      </div>
    );
  },
};
