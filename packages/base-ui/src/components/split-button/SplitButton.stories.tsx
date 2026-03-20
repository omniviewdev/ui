import type { Meta, StoryObj } from '@storybook/react';
import type { SplitButtonProps } from './SplitButton';
import { SplitButton } from './SplitButton';
import { Menu } from '../menu';

const noop = () => {};

const meta = {
  title: 'Inputs/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<SplitButtonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <SplitButton {...args}>
      <SplitButton.Action onClick={noop}>Save</SplitButton.Action>
      <SplitButton.Menu>
        <Menu.Item onClick={noop}>Save as Draft</Menu.Item>
        <Menu.Item onClick={noop}>Save and Publish</Menu.Item>
        <Menu.Item onClick={noop}>Save as Template</Menu.Item>
      </SplitButton.Menu>
    </SplitButton>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(['solid', 'soft', 'outline', 'ghost'] as const).map((variant) => (
        <SplitButton key={variant} {...args} variant={variant}>
          <SplitButton.Action>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </SplitButton.Action>
          <SplitButton.Menu>
            <Menu.Item>Option A</Menu.Item>
            <Menu.Item>Option B</Menu.Item>
          </SplitButton.Menu>
        </SplitButton>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {(['neutral', 'brand', 'success', 'warning', 'danger'] as const).map((color) => (
        <SplitButton key={color} {...args} variant="solid" color={color}>
          <SplitButton.Action>{color.charAt(0).toUpperCase() + color.slice(1)}</SplitButton.Action>
          <SplitButton.Menu>
            <Menu.Item>Action 1</Menu.Item>
            <Menu.Item>Action 2</Menu.Item>
          </SplitButton.Menu>
        </SplitButton>
      ))}
    </div>
  ),
};

export const WithMenuItems: Story = {
  render: (args) => (
    <SplitButton {...args} variant="outline" color="neutral">
      <SplitButton.Action onClick={noop}>Deploy</SplitButton.Action>
      <SplitButton.Menu>
        <Menu.Item>Deploy to Staging</Menu.Item>
        <Menu.Item>Deploy to Preview</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Rollback</Menu.Item>
      </SplitButton.Menu>
    </SplitButton>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <SplitButton {...args} disabled variant="solid" color="brand">
        <SplitButton.Action>Disabled Solid</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Option</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>
      <SplitButton {...args} disabled variant="outline" color="danger">
        <SplitButton.Action>Disabled Outline</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Option</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>
    </div>
  ),
};
