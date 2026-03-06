import type { Meta, StoryObj } from '@storybook/react';
import {
  LuCommand,
  LuDownload,
  LuPlay,
  LuRefreshCw,
  LuSearch,
  LuWandSparkles,
} from 'react-icons/lu';
import type { ButtonProps } from './Button';
import { Button } from './Button';

type DecoratorIconOption =
  | 'none'
  | 'play'
  | 'search'
  | 'refresh'
  | 'command'
  | 'download'
  | 'sparkles';

type ButtonStoryArgs = ButtonProps & {
  startIcon: DecoratorIconOption;
  endIcon: DecoratorIconOption;
};

const DECORATOR_ICON_OPTIONS: DecoratorIconOption[] = [
  'none',
  'play',
  'search',
  'refresh',
  'command',
  'download',
  'sparkles',
];

function renderDecoratorIcon(icon: DecoratorIconOption) {
  switch (icon) {
    case 'play':
      return <LuPlay aria-hidden />;
    case 'search':
      return <LuSearch aria-hidden />;
    case 'refresh':
      return <LuRefreshCw aria-hidden />;
    case 'command':
      return <LuCommand aria-hidden />;
    case 'download':
      return <LuDownload aria-hidden />;
    case 'sparkles':
      return <LuWandSparkles aria-hidden />;
    default:
      return undefined;
  }
}

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Run Task',
    variant: 'soft',
    color: 'brand',
    size: 'md',
    disabled: false,
    startIcon: 'play',
    endIcon: 'sparkles',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    startIcon: { control: 'select', options: DECORATOR_ICON_OPTIONS },
    endIcon: { control: 'select', options: DECORATOR_ICON_OPTIONS },
    startDecorator: { control: false, table: { disable: true } },
    endDecorator: { control: false, table: { disable: true } },
  },
  render: ({ startIcon, endIcon, ...args }) => (
    <Button
      {...args}
      startDecorator={renderDecoratorIcon(startIcon)}
      endDecorator={renderDecoratorIcon(endIcon)}
    />
  ),
} satisfies Meta<ButtonStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => {
    const buttonArgs: ButtonProps = {
      children: args.children,
      color: args.color,
      disabled: args.disabled,
      size: args.size,
    };
    const { startIcon, endIcon } = args;
    const startDecorator = renderDecoratorIcon(startIcon);
    const endDecorator = renderDecoratorIcon(endIcon);

    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button
          {...buttonArgs}
          variant="solid"
          startDecorator={startDecorator}
          endDecorator={endDecorator}
        >
          Solid
        </Button>
        <Button
          {...buttonArgs}
          variant="soft"
          startDecorator={startDecorator}
          endDecorator={endDecorator}
        >
          Soft
        </Button>
        <Button
          {...buttonArgs}
          variant="outline"
          startDecorator={startDecorator}
          endDecorator={endDecorator}
        >
          Outline
        </Button>
        <Button
          {...buttonArgs}
          variant="ghost"
          startDecorator={startDecorator}
          endDecorator={endDecorator}
        >
          Ghost
        </Button>
      </div>
    );
  },
};

export const Decorators: Story = {
  render: (args) => {
    const buttonArgs: ButtonProps = {
      color: args.color,
      disabled: args.disabled,
      size: args.size,
    };

    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button {...buttonArgs} startDecorator={<LuPlay />} endDecorator={<LuCommand />}>
          Start + End Icons
        </Button>
        <Button
          {...buttonArgs}
          variant="outline"
          startDecorator={<LuSearch />}
          endDecorator={<LuWandSparkles />}
        >
          Search + Sparkles
        </Button>
        <Button {...buttonArgs} variant="soft" startDecorator={<LuPlay />} endDecorator="⌘R">
          Icon + Shortcut
        </Button>
      </div>
    );
  },
};
