import type { Meta, StoryObj } from '@storybook/react';
import { Fragment } from 'react';

const screenshotComponents = [
  'ActionList',
  'AlertDialog',
  'Autocomplete',
  'Avatar',
  'AvatarGroup',
  'Button',
  'ButtonGroup',
  'Card',
  'Caption',
  'Checkbox',
  'CheckboxGroup',
  'Chip',
  'CodeBlock',
  'Combobox',
  'ContextMenu',
  'IconButton',
  'Input',
  'Link',
  'Menu',
  'MultiSelect',
  'NumberInput',
  'Overline',
  'Popover',
  'Radio',
  'RadioGroup',
  'SearchInput',
  'Select',
  'Separator',
  'Slider',
  'Switch',
  'Table',
  'Tabs',
  'TextField',
  'TextArea',
  'Tooltip',
  'ToggleButton',
  'ToggleButtonGroup',
  'Typography',
  'Underline',
] as const;

const meta = {
  title: 'Foundation/Component Coverage',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BaseUiCoverage: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '8px',
        maxWidth: '520px',
        fontFamily: 'var(--ov-font-sans)',
      }}
    >
      <h2 style={{ margin: 0 }}>Base UI Component Coverage</h2>
      <p style={{ margin: 0, color: 'var(--ov-color-fg-muted)' }}>
        Current approved export set for <code>@omniview/base-ui</code>.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          border: '1px solid var(--ov-color-border-muted)',
          borderRadius: 'var(--ov-radius-surface)',
          overflow: 'hidden',
        }}
      >
        {screenshotComponents.map((name) => (
          <Fragment key={name}>
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--ov-color-border-muted)',
              }}
            >
              {name}
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--ov-color-border-muted)',
                color: 'var(--ov-color-success)',
                fontWeight: 'var(--ov-font-weight-label)',
              }}
            >
              Exported
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  ),
};
