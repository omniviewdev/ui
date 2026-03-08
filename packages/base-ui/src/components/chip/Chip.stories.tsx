import type { Meta, StoryObj } from '@storybook/react';
import { LuCheck, LuChevronRight, LuCircleAlert, LuCode, LuDatabase, LuTag } from 'react-icons/lu';
import type { ChipProps } from './Chip';
import { Chip } from './Chip';

type DecoratorIconOption = 'none' | 'tag' | 'code' | 'database' | 'check' | 'alert' | 'arrow';

type ChipStoryArgs = ChipProps & {
  startIcon: DecoratorIconOption;
  endIcon: DecoratorIconOption;
};

const DECORATOR_ICON_OPTIONS: DecoratorIconOption[] = [
  'none',
  'tag',
  'code',
  'database',
  'check',
  'alert',
  'arrow',
];

function renderDecoratorIcon(icon: DecoratorIconOption) {
  switch (icon) {
    case 'tag':
      return <LuTag aria-hidden />;
    case 'code':
      return <LuCode aria-hidden />;
    case 'database':
      return <LuDatabase aria-hidden />;
    case 'check':
      return <LuCheck aria-hidden />;
    case 'alert':
      return <LuCircleAlert aria-hidden />;
    case 'arrow':
      return <LuChevronRight aria-hidden />;
    default:
      return undefined;
  }
}

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: {
    children: '/api/v1/chat',
    variant: 'soft',
    color: 'brand',
    size: 'md',
    mono: true,
    clickable: false,
    startIcon: 'none',
    endIcon: 'none',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    mono: { control: 'boolean' },
    clickable: { control: 'boolean' },
    startIcon: { control: 'select', options: DECORATOR_ICON_OPTIONS },
    endIcon: { control: 'select', options: DECORATOR_ICON_OPTIONS },
    startDecorator: { control: false, table: { disable: true } },
    endDecorator: { control: false, table: { disable: true } },
  },
  render: ({ startIcon, endIcon, ...args }) => (
    <Chip
      {...args}
      startDecorator={renderDecoratorIcon(startIcon)}
      endDecorator={renderDecoratorIcon(endIcon)}
    />
  ),
} satisfies Meta<ChipStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const EndpointAndMethodSet: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '14px' }}>
      <Chip.Group size="sm" clickable>
        <Chip.Item color="brand" variant="solid">
          POST
        </Chip.Item>
        <Chip.Item color="success" variant="solid">
          GET
        </Chip.Item>
        <Chip.Item color="warning" variant="solid">
          PATCH
        </Chip.Item>
        <Chip.Item color="danger" variant="solid">
          DELETE
        </Chip.Item>
      </Chip.Group>

      <Chip.Group variant="outline" color="neutral" mono>
        <Chip.Item>/api/v1/chat</Chip.Item>
        <Chip.Item>/v1/responses</Chip.Item>
        <Chip.Item>/v1/messages</Chip.Item>
      </Chip.Group>
    </div>
  ),
};

export const DecoratedClickable: Story = {
  args: {
    clickable: true,
    mono: false,
    color: 'neutral',
    variant: 'soft',
  },
  render: (args) => (
    <Chip.Group
      variant={args.variant}
      color={args.color}
      size={args.size}
      mono={args.mono}
      clickable={args.clickable}
    >
      <Chip.Item startDecorator={<LuDatabase />} endDecorator={<LuChevronRight />}>
        models
      </Chip.Item>
      <Chip.Item color="success" startDecorator={<LuCheck />} endDecorator={<LuChevronRight />}>
        ready
      </Chip.Item>
      <Chip.Item
        color="danger"
        startDecorator={<LuCircleAlert />}
        endDecorator={<LuChevronRight />}
      >
        failures
      </Chip.Item>
    </Chip.Group>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '10px' }}>
      <Chip.Group size="sm" variant="outline" mono>
        <Chip.Item startDecorator={<LuCode />}>sm</Chip.Item>
        <Chip.Item>/api/v1/models/load</Chip.Item>
      </Chip.Group>
      <Chip.Group size="md" variant="outline" mono>
        <Chip.Item startDecorator={<LuCode />}>md</Chip.Item>
        <Chip.Item>/api/v1/models/load</Chip.Item>
      </Chip.Group>
      <Chip.Group size="lg" variant="outline" mono>
        <Chip.Item startDecorator={<LuCode />}>lg</Chip.Item>
        <Chip.Item>/api/v1/models/load</Chip.Item>
      </Chip.Group>
    </div>
  ),
};
