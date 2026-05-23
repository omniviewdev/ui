import type { Meta, StoryObj } from '@storybook/react';
import { LuBot } from 'react-icons/lu';
import { AvatarGroup } from './AvatarGroup';

const people = [
  { id: 'joshua', name: 'Joshua Pare' },
  { id: 'olivia', name: 'Olivia Chen' },
  { id: 'miguel', name: 'Miguel Alvarez' },
  { id: 'alicia', name: 'Alicia Kim' },
  { id: 'priya', name: 'Priya Singh' },
  { id: 'sam', name: 'Sam Patel' },
];

const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    shape: 'circle',
    deterministic: true,
    max: 4,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'rounded'] },
    overlap: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    deterministic: { control: 'boolean' },
    max: { control: { type: 'number', min: 1, max: 8, step: 1 } },
    total: { control: { type: 'number', min: 1, max: 99, step: 1 } },
  },
  parameters: {
    controls: {
      include: ['variant', 'color', 'size', 'shape', 'overlap', 'deterministic', 'max', 'total'],
    },
  },
  render: (args) => (
    <AvatarGroup {...args}>
      {people.map((person) => (
        <AvatarGroup.Item key={person.id} name={person.name} aria-label={person.name} />
      ))}
    </AvatarGroup>
  ),
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rounded: Story = {
  args: {
    shape: 'rounded',
    color: 'brand',
    variant: 'soft',
  },
};

export const FullSetWithoutOverflow: Story = {
  args: {
    max: undefined,
    size: 'lg',
  },
};

export const WithMixedFallbacks: Story = {
  render: () => (
    <AvatarGroup size="md" color="neutral" variant="soft" max={6}>
      <AvatarGroup.Item name="Joshua Pare" />
      <AvatarGroup.Item name="Olivia Chen" />
      <AvatarGroup.Item fallbackIcon={<LuBot aria-hidden />} aria-label="Bot" />
      <AvatarGroup.Item name="Sam Patel" shape="rounded" />
      <AvatarGroup.Item name="Alicia Kim" />
      <AvatarGroup.Item name="Miguel Alvarez" />
      <AvatarGroup.Item name="Priya Singh" />
    </AvatarGroup>
  ),
};
