import type { Meta, StoryObj } from '@storybook/react';
import { LuChevronDown } from 'react-icons/lu';
import type { StyledComponentProps } from '../../system/types';
import { Select } from './Select';

type RuntimeGroup = 'Local' | 'Remote';
type RuntimeValue = 'desktop' | 'docker' | 'kubernetes' | 'cloud';

interface RuntimeObject {
  id: RuntimeValue;
  label: string;
  group: RuntimeGroup;
  shortcut: string;
}

const runtimeOptions: readonly RuntimeObject[] = [
  { id: 'desktop', label: 'Desktop Runtime', group: 'Local', shortcut: '⌘1' },
  { id: 'docker', label: 'Docker Runtime', group: 'Local', shortcut: '⌘2' },
  { id: 'kubernetes', label: 'Kubernetes Runtime', group: 'Remote', shortcut: '⌘3' },
  { id: 'cloud', label: 'Cloud Runtime', group: 'Remote', shortcut: '⌘4' },
] as const;

const runtimeIds = runtimeOptions.map((option) => option.id);
const groups: RuntimeGroup[] = ['Local', 'Remote'];

function optionById(id: RuntimeValue): RuntimeObject {
  return runtimeOptions.find((option) => option.id === id) ?? runtimeOptions[0]!;
}

function runtimeList<Value>({
  getValue,
  getEndDecorator,
}: {
  getValue: (option: RuntimeObject) => Value;
  getEndDecorator?: (option: RuntimeObject) => string;
}) {
  return (
    <Select.List>
      {groups.map((group, groupIndex) => {
        const options = runtimeOptions.filter((option) => option.group === group);

        return (
          <Select.Group key={group}>
            {groupIndex > 0 ? <Select.Separator /> : null}
            <Select.GroupLabel>{group}</Select.GroupLabel>
            {options.map((option) => (
              <Select.Item
                key={option.id}
                value={getValue(option)}
                endDecorator={getEndDecorator ? getEndDecorator(option) : option.shortcut}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Group>
        );
      })}
    </Select.List>
  );
}

interface BaseSelectArgs extends StyledComponentProps {
  label: string;
  placeholder: string;
  selectionIndicator?: 'auto' | 'always' | 'never';
}

interface PrimitiveSingleArgs extends BaseSelectArgs {
  defaultValue: RuntimeValue;
}

interface PrimitiveMultipleArgs extends BaseSelectArgs {
  defaultValues: RuntimeValue[];
}

interface ObjectSingleArgs extends BaseSelectArgs {
  defaultObjectValue: RuntimeValue;
}

interface ObjectMultipleArgs extends BaseSelectArgs {
  defaultObjectValues: RuntimeValue[];
}

type SelectStoryArgs = PrimitiveSingleArgs &
  Pick<PrimitiveMultipleArgs, 'defaultValues'> &
  Pick<ObjectSingleArgs, 'defaultObjectValue'> &
  Pick<ObjectMultipleArgs, 'defaultObjectValues'>;

const sharedArgTypes = {
  variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
  color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
  size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  selectionIndicator: { control: 'inline-radio', options: ['auto', 'always', 'never'] },
  label: { control: 'text' },
  placeholder: { control: 'text' },
} as const;

const meta: Meta<SelectStoryArgs> = {
  title: 'Components/Select',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<SelectStoryArgs>;

export const Playground: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    selectionIndicator: 'auto',
    label: 'Runtime',
    placeholder: 'Select runtime',
    defaultValue: 'docker',
  } satisfies PrimitiveSingleArgs,
  argTypes: {
    ...sharedArgTypes,
    defaultValue: {
      control: 'select',
      options: runtimeIds,
    },
  },
  parameters: {
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'selectionIndicator',
        'label',
        'placeholder',
        'defaultValue',
      ],
    },
    docs: {
      source: {
        code: `<Select.Root defaultValue="docker" variant="soft" color="neutral" size="md">
  <Select.Trigger>
    <Select.Value placeholder="Select runtime" />
    <Select.Icon>
      <LuChevronDown aria-hidden />
    </Select.Icon>
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner sideOffset={6}>
      <Select.Popup>
        <Select.List>
          <Select.Item value="desktop">
            <Select.ItemText>Desktop Runtime</Select.ItemText>
          </Select.Item>
          <Select.Item value="docker">
            <Select.ItemText>Docker Runtime</Select.ItemText>
          </Select.Item>
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>`,
      },
    },
  },
  render: (rawArgs) => {
    const args = rawArgs as PrimitiveSingleArgs;

    return (
      <div
        style={{
          width: 420,
          display: 'grid',
          gap: 6,
          color: 'var(--ov-color-fg-default)',
          fontFamily: 'var(--ov-font-sans)',
        }}
      >
        <span
          style={{
            color: 'var(--ov-color-fg-muted)',
            fontSize: 'var(--ov-font-size-caption)',
            fontWeight: 'var(--ov-font-weight-label)',
          }}
        >
          {args.label}
        </span>
        <Select.Root
          defaultValue={args.defaultValue}
          variant={args.variant}
          color={args.color}
          size={args.size}
          selectionIndicator={args.selectionIndicator}
        >
          <Select.Trigger>
            <Select.Value placeholder={args.placeholder} />
            <Select.Icon>
              <LuChevronDown aria-hidden />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={6}>
              <Select.Popup>{runtimeList({ getValue: (option) => option.id })}</Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
    );
  },
};

export const Multiple: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    selectionIndicator: 'auto',
    label: 'Languages',
    placeholder: 'Select one or more runtimes',
    defaultValues: ['desktop', 'docker'],
  } satisfies PrimitiveMultipleArgs,
  argTypes: {
    ...sharedArgTypes,
    defaultValues: {
      control: 'check',
      options: runtimeIds,
    },
  },
  parameters: {
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'selectionIndicator',
        'label',
        'placeholder',
        'defaultValues',
      ],
    },
    docs: {
      source: {
        code: `<Select.Root
  multiple
  defaultValue={['desktop', 'docker']}
  variant="soft"
  color="neutral"
  size="md"
>
  <Select.Trigger>
    <Select.Value placeholder="Select one or more runtimes" />
    <Select.Icon>
      <LuChevronDown aria-hidden />
    </Select.Icon>
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner sideOffset={6}>
      <Select.Popup>
        <Select.List>
          <Select.Item value="desktop">Desktop Runtime</Select.Item>
          <Select.Item value="docker">Docker Runtime</Select.Item>
          <Select.Item value="kubernetes">Kubernetes Runtime</Select.Item>
          <Select.Item value="cloud">Cloud Runtime</Select.Item>
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>`,
      },
    },
  },
  render: (rawArgs) => {
    const args = rawArgs as PrimitiveMultipleArgs;

    return (
      <div
        style={{
          width: 420,
          display: 'grid',
          gap: 6,
          color: 'var(--ov-color-fg-default)',
          fontFamily: 'var(--ov-font-sans)',
        }}
      >
        <span
          style={{
            color: 'var(--ov-color-fg-muted)',
            fontSize: 'var(--ov-font-size-caption)',
            fontWeight: 'var(--ov-font-weight-label)',
          }}
        >
          {args.label}
        </span>
        <Select.Root<RuntimeValue, true>
          multiple
          defaultValue={args.defaultValues}
          variant={args.variant}
          color={args.color}
          size={args.size}
          selectionIndicator={args.selectionIndicator}
        >
          <Select.Trigger>
            <Select.Value placeholder={args.placeholder} />
            <Select.Icon>
              <LuChevronDown aria-hidden />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={6}>
              <Select.Popup>{runtimeList({ getValue: (option) => option.id })}</Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
    );
  },
};

export const ObjectValues: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    selectionIndicator: 'auto',
    label: 'Runtime Object Value',
    placeholder: 'Select runtime object',
    defaultObjectValue: 'docker',
  } satisfies ObjectSingleArgs,
  argTypes: {
    ...sharedArgTypes,
    defaultObjectValue: {
      control: 'select',
      options: runtimeIds,
    },
  },
  parameters: {
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'selectionIndicator',
        'label',
        'placeholder',
        'defaultObjectValue',
      ],
    },
    docs: {
      source: {
        code: `const items = [
  { id: 'desktop', label: 'Desktop Runtime', shortcut: '⌘1' },
  { id: 'docker', label: 'Docker Runtime', shortcut: '⌘2' },
];

<Select.Root
  defaultValue={items[1]}
  itemToStringLabel={(item) => item.label}
  itemToStringValue={(item) => item.id}
  variant="soft"
  color="neutral"
  size="md"
>
  <Select.Trigger>
    <Select.Value placeholder="Select runtime object" />
    <Select.Icon>
      <LuChevronDown aria-hidden />
    </Select.Icon>
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner sideOffset={6}>
      <Select.Popup>
        <Select.List>
          {items.map((item) => (
            <Select.Item key={item.id} value={item} endDecorator={item.shortcut}>
              <Select.ItemText>{item.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>`,
      },
    },
  },
  render: (rawArgs) => {
    const args = rawArgs as ObjectSingleArgs;
    const defaultValue = optionById(args.defaultObjectValue);

    return (
      <div
        style={{
          width: 420,
          display: 'grid',
          gap: 6,
          color: 'var(--ov-color-fg-default)',
          fontFamily: 'var(--ov-font-sans)',
        }}
      >
        <span
          style={{
            color: 'var(--ov-color-fg-muted)',
            fontSize: 'var(--ov-font-size-caption)',
            fontWeight: 'var(--ov-font-weight-label)',
          }}
        >
          {args.label}
        </span>
        <Select.Root<RuntimeObject>
          defaultValue={defaultValue}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.id}
          variant={args.variant}
          color={args.color}
          size={args.size}
          selectionIndicator={args.selectionIndicator}
        >
          <Select.Trigger>
            <Select.Value placeholder={args.placeholder} />
            <Select.Icon>
              <LuChevronDown aria-hidden />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={6}>
              <Select.Popup>
                {runtimeList({
                  getValue: (option) => option,
                  getEndDecorator: (option) => `${option.shortcut} • ${option.group}`,
                })}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
    );
  },
};

export const ObjectValuesMultiple: Story = {
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    selectionIndicator: 'auto',
    label: 'Runtime Object Values',
    placeholder: 'Select runtime objects',
    defaultObjectValues: ['desktop', 'docker'],
  } satisfies ObjectMultipleArgs,
  argTypes: {
    ...sharedArgTypes,
    defaultObjectValues: {
      control: 'check',
      options: runtimeIds,
    },
  },
  parameters: {
    controls: {
      include: [
        'variant',
        'color',
        'size',
        'selectionIndicator',
        'label',
        'placeholder',
        'defaultObjectValues',
      ],
    },
  },
  render: (rawArgs) => {
    const args = rawArgs as ObjectMultipleArgs;
    const defaultValues = args.defaultObjectValues.map((id) => optionById(id));

    return (
      <div
        style={{
          width: 420,
          display: 'grid',
          gap: 6,
          color: 'var(--ov-color-fg-default)',
          fontFamily: 'var(--ov-font-sans)',
        }}
      >
        <span
          style={{
            color: 'var(--ov-color-fg-muted)',
            fontSize: 'var(--ov-font-size-caption)',
            fontWeight: 'var(--ov-font-weight-label)',
          }}
        >
          {args.label}
        </span>
        <Select.Root<RuntimeObject, true>
          multiple
          defaultValue={defaultValues}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.id}
          variant={args.variant}
          color={args.color}
          size={args.size}
          selectionIndicator={args.selectionIndicator}
        >
          <Select.Trigger>
            <Select.Value placeholder={args.placeholder} />
            <Select.Icon>
              <LuChevronDown aria-hidden />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={6}>
              <Select.Popup>
                {runtimeList({
                  getValue: (option) => option,
                  getEndDecorator: (option) => `${option.shortcut} • ${option.group}`,
                })}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
    );
  },
};
