import type { Meta, StoryObj } from '@storybook/react';
import type { StyledComponentProps } from '../../system/types';
import { MultiSelect } from './MultiSelect';

const namespaceItems = [
  'default',
  'kube-node-lease',
  'kube-public',
  'kube-system',
  'local-path-storage',
];

interface RuntimeItem {
  id: string;
  label: string;
  region: string;
}

const runtimeItems: RuntimeItem[] = [
  { id: 'dev-us-east', label: 'Dev Runtime', region: 'us-east-1' },
  { id: 'staging-us-west', label: 'Staging Runtime', region: 'us-west-2' },
  { id: 'prod-eu-west', label: 'Prod Runtime', region: 'eu-west-1' },
  { id: 'batch-ap-south', label: 'Batch Runtime', region: 'ap-south-1' },
];

interface BaseArgs extends StyledComponentProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  maxVisibleChips: number;
  showItemIndicator: boolean;
  clearable: boolean;
  clearButtonLabel: string;
}

interface PrimitiveArgs extends BaseArgs {
  defaultValues: string[];
}

interface ObjectArgs extends BaseArgs {
  defaultIds: string[];
}

type MultiSelectStoryArgs = PrimitiveArgs & Pick<ObjectArgs, 'defaultIds'>;

const sharedArgTypes = {
  variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
  color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
  size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  label: { control: 'text' },
  placeholder: { control: 'text' },
  searchPlaceholder: { control: 'text' },
  maxVisibleChips: { control: { type: 'number', min: 1, max: 8, step: 1 } },
  showItemIndicator: { control: 'boolean' },
  clearable: { control: 'boolean' },
  clearButtonLabel: { control: 'text' },
} as const;

const meta: Meta<MultiSelectStoryArgs> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MultiSelectStoryArgs>;

export const Playground: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    label: 'Namespaces',
    placeholder: 'All Namespaces',
    searchPlaceholder: 'Search namespaces...',
    maxVisibleChips: 3,
    showItemIndicator: true,
    clearable: true,
    clearButtonLabel: 'Clear selected namespaces',
    defaultValues: ['kube-node-lease', 'kube-public'],
  } satisfies PrimitiveArgs,
  argTypes: {
    ...sharedArgTypes,
    defaultValues: {
      control: 'check',
      options: namespaceItems,
    },
  },
  parameters: {
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'label',
        'placeholder',
        'searchPlaceholder',
        'maxVisibleChips',
        'showItemIndicator',
        'clearable',
        'clearButtonLabel',
        'defaultValues',
      ],
    },
    docs: {
      source: {
        code: `<MultiSelect
  items={['default', 'kube-node-lease', 'kube-public', 'kube-system']}
  defaultValue={['kube-node-lease', 'kube-public']}
  label="Namespaces"
  placeholder="All Namespaces"
  searchPlaceholder="Search namespaces..."
  variant="soft"
  color="neutral"
  size="md"
/>`,
      },
    },
  },
  render: (rawArgs) => {
    const args = rawArgs as PrimitiveArgs;

    return (
      <div style={{ width: 420 }}>
        <MultiSelect
          items={namespaceItems}
          defaultValue={args.defaultValues}
          label={args.label}
          placeholder={args.placeholder}
          searchPlaceholder={args.searchPlaceholder}
          variant={args.variant}
          color={args.color}
          size={args.size}
          maxVisibleChips={args.maxVisibleChips}
          showItemIndicator={args.showItemIndicator}
          clearable={args.clearable}
          clearButtonLabel={args.clearButtonLabel}
        />
      </div>
    );
  },
};

export const ObjectValues: Story = {
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
    label: 'Runtimes',
    placeholder: 'Select runtimes',
    searchPlaceholder: 'Search runtimes...',
    maxVisibleChips: 2,
    showItemIndicator: true,
    clearable: true,
    clearButtonLabel: 'Clear selected runtimes',
    defaultIds: ['staging-us-west', 'prod-eu-west'],
  } satisfies ObjectArgs,
  argTypes: {
    ...sharedArgTypes,
    defaultIds: {
      control: 'check',
      options: runtimeItems.map((item) => item.id),
    },
  },
  parameters: {
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'label',
        'placeholder',
        'searchPlaceholder',
        'maxVisibleChips',
        'showItemIndicator',
        'clearable',
        'clearButtonLabel',
        'defaultIds',
      ],
    },
    docs: {
      source: {
        code: `<MultiSelect
  items={runtimeItems}
  defaultValue={runtimeItems.filter((item) =>
    ['staging-us-west', 'prod-eu-west'].includes(item.id),
  )}
  getItemLabel={(item) => item.label}
  getItemValue={(item) => item.id}
  renderItemEndDecorator={(item) => item.region}
  label="Runtimes"
  placeholder="Select runtimes"
  searchPlaceholder="Search runtimes..."
/>`,
      },
    },
  },
  render: (rawArgs) => {
    const args = rawArgs as ObjectArgs;
    const defaultValue = runtimeItems.filter((item) => args.defaultIds.includes(item.id));

    return (
      <div style={{ width: 420 }}>
        <MultiSelect
          items={runtimeItems}
          defaultValue={defaultValue}
          getItemLabel={(item) => item.label}
          getItemValue={(item) => item.id}
          renderItemEndDecorator={(item) => item.region}
          label={args.label}
          placeholder={args.placeholder}
          searchPlaceholder={args.searchPlaceholder}
          variant={args.variant}
          color={args.color}
          size={args.size}
          maxVisibleChips={args.maxVisibleChips}
          showItemIndicator={args.showItemIndicator}
          clearable={args.clearable}
          clearButtonLabel={args.clearButtonLabel}
        />
      </div>
    );
  },
};

export const Open: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    label: 'Namespaces',
    placeholder: 'All Namespaces',
    searchPlaceholder: 'Search namespaces...',
    maxVisibleChips: 3,
    showItemIndicator: true,
    clearable: true,
    clearButtonLabel: 'Clear selected namespaces',
    defaultValues: ['kube-node-lease'],
  } satisfies PrimitiveArgs,
  render: (rawArgs) => {
    const args = rawArgs as PrimitiveArgs;

    return (
      <div style={{ width: 420 }}>
        <MultiSelect
          items={namespaceItems}
          defaultOpen
          defaultValue={args.defaultValues}
          label={args.label}
          placeholder={args.placeholder}
          searchPlaceholder={args.searchPlaceholder}
          variant={args.variant}
          color={args.color}
          size={args.size}
          maxVisibleChips={args.maxVisibleChips}
          showItemIndicator={args.showItemIndicator}
          clearable={args.clearable}
          clearButtonLabel={args.clearButtonLabel}
        />
      </div>
    );
  },
};
