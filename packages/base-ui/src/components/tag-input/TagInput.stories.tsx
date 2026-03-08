import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TagInput, type TagInputProps } from './TagInput';

const meta = {
  title: 'Inputs/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  args: {
    placeholder: 'Add a tag...',
    size: 'md',
    disabled: false,
    allowDuplicates: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    allowDuplicates: { control: 'boolean' },
    max: { control: 'number' },
    delimiter: { control: 'text' },
    value: { control: false },
    onChange: { control: false },
    validate: { control: false },
  },
  render: function Render(args: TagInputProps) {
    const [tags, setTags] = useState<string[]>(args.value ?? []);
    return (
      <div style={{ width: 420 }}>
        <TagInput {...args} value={tags} onChange={setTags} />
      </div>
    );
  },
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: ['react', 'typescript'],
  },
};

export const WithInitialTags: Story = {
  args: {
    value: ['kubernetes', 'docker', 'helm'],
    placeholder: 'Add technology...',
  },
};

export const WithValidation: Story = {
  args: {
    value: [],
    placeholder: 'Enter email addresses...',
    validate: (tag: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag),
  },
};

export const MaxTags: Story = {
  args: {
    value: ['one', 'two'],
    max: 4,
    placeholder: 'Max 4 tags...',
  },
};

export const Disabled: Story = {
  args: {
    value: ['locked', 'tags'],
    disabled: true,
  },
};

export const AllSizes: Story = {
  render: function Render() {
    const [smTags, setSmTags] = useState(['small']);
    const [mdTags, setMdTags] = useState(['medium']);
    const [lgTags, setLgTags] = useState(['large']);

    return (
      <div style={{ width: 420, display: 'grid', gap: 12 }}>
        <TagInput value={smTags} onChange={setSmTags} size="sm" placeholder="Small..." />
        <TagInput value={mdTags} onChange={setMdTags} size="md" placeholder="Medium..." />
        <TagInput value={lgTags} onChange={setLgTags} size="lg" placeholder="Large..." />
      </div>
    );
  },
};
