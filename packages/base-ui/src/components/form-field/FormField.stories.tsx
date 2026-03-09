import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FormField, FormSection, type FormFieldProps } from './FormField';

const inputStyle: CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--ov-color-border-default)',
  borderRadius: 'var(--ov-radius-control)',
  background: 'var(--ov-color-bg-surface-raised)',
  color: 'var(--ov-color-fg-default)',
  font: 'inherit',
  fontSize: 'var(--ov-font-size-body)',
  width: '100%',
  boxSizing: 'border-box' as const,
};

const meta = {
  title: 'Inputs/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: {
    label: 'Label',
    htmlFor: 'field',
    size: 'md',
    required: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    required: { control: 'boolean' },
    description: { control: 'text' },
    error: { control: 'text' },
    htmlFor: { control: 'text' },
  },
} satisfies Meta<FormFieldProps>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// FormField stories
// ---------------------------------------------------------------------------

export const Playground: Story = {
  args: {
    label: 'Cluster name',
    htmlFor: 'cluster-name',
  },
  render: (args) => (
    <FormField {...args}>
      <input id="cluster-name" placeholder="my-cluster" style={inputStyle} />
    </FormField>
  ),
};

export const WithDescription: Story = {
  args: {
    label: 'Namespace',
    description: 'The Kubernetes namespace to deploy into.',
    htmlFor: 'namespace',
  },
  render: (args) => (
    <FormField {...args}>
      <input id="namespace" placeholder="default" style={inputStyle} />
    </FormField>
  ),
};

export const WithError: Story = {
  args: {
    label: 'Port',
    error: 'Port must be between 1 and 65535.',
    htmlFor: 'port',
  },
  render: (args) => (
    <FormField {...args}>
      <input
        id="port"
        defaultValue="99999"
        style={{ ...inputStyle, border: '1px solid var(--ov-color-fg-danger)' }}
      />
    </FormField>
  ),
};

export const RequiredField: Story = {
  args: {
    label: 'API Key',
    required: true,
    htmlFor: 'api-key',
  },
  render: (args) => (
    <FormField {...args}>
      <input id="api-key" type="password" placeholder="sk-..." style={inputStyle} />
    </FormField>
  ),
};

export const FormSectionGrouping: Story = {
  args: { label: 'Host', htmlFor: 'host' },
  render: () => (
    <FormSection title="Connection Settings" description="Configure the target cluster connection.">
      <FormField label="Host" required htmlFor="host">
        <input id="host" placeholder="api.example.com" style={inputStyle} />
      </FormField>
      <FormField label="Port" description="TCP port number." htmlFor="port-section">
        <input id="port-section" placeholder="443" style={inputStyle} />
      </FormField>
      <FormField label="Token" required error="Token is expired." htmlFor="token">
        <input id="token" type="password" style={inputStyle} />
      </FormField>
    </FormSection>
  ),
};

export const AllSizes: Story = {
  args: { label: 'Size', htmlFor: 'size-md' },
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <FormField
          key={size}
          label={`Size: ${size}`}
          description="Helper text"
          size={size}
          htmlFor={`size-${size}`}
        >
          <input id={`size-${size}`} placeholder="Value" style={inputStyle} />
        </FormField>
      ))}
    </div>
  ),
};
