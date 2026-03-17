import type { Meta, StoryObj } from '@storybook/react';
import { useId } from 'react';
import { LuChevronDown, LuX } from 'react-icons/lu';
import type { StyledComponentProps } from '../../system/types';
import { Autocomplete } from './Autocomplete';

interface Tag {
  id: string;
  value: string;
}

const tags: Tag[] = [
  { id: '1', value: 'feature' },
  { id: '2', value: 'internal' },
  { id: '3', value: 'component: accordion' },
  { id: '4', value: 'component: alert dialog' },
  { id: '5', value: 'component: autocomplete' },
  { id: '6', value: 'component: card' },
  { id: '7', value: 'component: tabs' },
  { id: '8', value: 'component: textfield' },
  { id: '9', value: 'component: menubar' },
  { id: '10', value: 'component: navigation menu' },
];

function AutocompleteDemo(args: StyledComponentProps) {
  const inputId = useId();

  return (
    <Autocomplete.Root items={tags} {...args}>
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
        Search tags
        <div style={{ display: 'flex', gap: 8 }}>
          <Autocomplete.Input id={inputId} placeholder="Search tags" />
          <Autocomplete.Clear aria-label="Clear">
            <LuX size={16} />
          </Autocomplete.Clear>
          <Autocomplete.Trigger aria-label="Open">
            <LuChevronDown size={16} />
          </Autocomplete.Trigger>
        </div>
      </label>

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={6}>
          <Autocomplete.Popup>
            <Autocomplete.List>
              {(tag: Tag) => (
                <Autocomplete.Item key={tag.id} value={tag}>
                  {tag.value}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
            <Autocomplete.Empty>No matching tags.</Autocomplete.Empty>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}

const meta = {
  title: 'Components/Autocomplete',
  component: Autocomplete.Root,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  parameters: {
    controls: {
      include: ['variant', 'color', 'size'],
    },
  },
  render: (args) => <AutocompleteDemo {...args} />,
} satisfies Meta<typeof Autocomplete.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
