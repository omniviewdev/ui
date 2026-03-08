import type { Meta, StoryObj } from '@storybook/react';
import type { SplitButtonProps } from './SplitButton';
import { SplitButton } from './SplitButton';

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
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<SplitButtonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '6px 12px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 'inherit',
};

export const Playground: Story = {
  render: (args) => (
    <SplitButton {...args}>
      <SplitButton.Action onClick={() => alert('Save clicked')}>Save</SplitButton.Action>
      <SplitButton.Menu>
        <button type="button" style={menuItemStyle}>Save as Draft</button>
        <button type="button" style={menuItemStyle}>Save and Publish</button>
        <button type="button" style={menuItemStyle}>Save as Template</button>
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
            <button type="button" style={menuItemStyle}>Option A</button>
            <button type="button" style={menuItemStyle}>Option B</button>
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
            <button type="button" style={menuItemStyle}>Action 1</button>
            <button type="button" style={menuItemStyle}>Action 2</button>
          </SplitButton.Menu>
        </SplitButton>
      ))}
    </div>
  ),
};

export const WithMenuItems: Story = {
  render: (args) => (
    <SplitButton {...args} variant="outline" color="neutral">
      <SplitButton.Action onClick={() => alert('Deploy to Production')}>Deploy</SplitButton.Action>
      <SplitButton.Menu>
        <button type="button" style={menuItemStyle}>Deploy to Staging</button>
        <button type="button" style={menuItemStyle}>Deploy to Preview</button>
        <button type="button" style={menuItemStyle}>Rollback</button>
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
          <button type="button" style={menuItemStyle}>Option</button>
        </SplitButton.Menu>
      </SplitButton>
      <SplitButton {...args} disabled variant="outline" color="danger">
        <SplitButton.Action>Disabled Outline</SplitButton.Action>
        <SplitButton.Menu>
          <button type="button" style={menuItemStyle}>Option</button>
        </SplitButton.Menu>
      </SplitButton>
    </div>
  ),
};
