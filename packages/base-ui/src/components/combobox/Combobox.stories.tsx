import type { Meta, StoryObj } from '@storybook/react';
import { useId } from 'react';
import { LuCheck, LuChevronDown, LuX } from 'react-icons/lu';
import type { StyledComponentProps } from '../../system/types';
import { Combobox } from './Combobox';

interface Runtime {
  id: string;
  label: string;
}

const runtimes: Runtime[] = [
  { id: 'local', label: 'Local Runtime' },
  { id: 'docker', label: 'Docker Runtime' },
  { id: 'kubernetes', label: 'Kubernetes Runtime' },
  { id: 'remote-ssh', label: 'Remote SSH Runtime' },
  { id: 'cloud-dev', label: 'Cloud Dev Runtime' },
];

function ComboboxDemo(args: StyledComponentProps) {
  const inputId = useId();

  return (
    <Combobox.Root
      defaultValue={runtimes[0]}
      itemToStringLabel={(item: Runtime) => item.label}
      itemToStringValue={(item: Runtime) => item.id}
      items={runtimes}
      {...args}
    >
      <label
        htmlFor={inputId}
        style={{
          display: 'grid',
          gap: '6px',
          width: 420,
          color: 'var(--ov-color-fg-default)',
          fontFamily: 'var(--ov-font-sans)',
          fontSize: 'var(--ov-font-size-body)',
        }}
      >
        Runtime
        <div style={{ display: 'flex', gap: 8 }}>
          <Combobox.Input id={inputId} placeholder="Select runtime" />
          <Combobox.Clear aria-label="Clear">
            <LuX size={16} />
          </Combobox.Clear>
          <Combobox.Trigger aria-label="Open">
            <LuChevronDown size={16} />
          </Combobox.Trigger>
        </div>
      </label>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6}>
          <Combobox.Popup>
            <Combobox.List>
              {(runtime: Runtime) => (
                <Combobox.Item
                  key={runtime.id}
                  startDecorator={
                    <Combobox.ItemIndicator keepMounted>
                      <LuCheck />
                    </Combobox.ItemIndicator>
                  }
                  value={runtime}
                >
                  {runtime.label}
                </Combobox.Item>
              )}
            </Combobox.List>
            <Combobox.Empty>No matching runtimes.</Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

const meta = {
  title: 'Components/Combobox',
  component: Combobox.Input,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    controls: {
      include: ['variant', 'color', 'size'],
    },
  },
  render: (args) => <ComboboxDemo {...args} />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
