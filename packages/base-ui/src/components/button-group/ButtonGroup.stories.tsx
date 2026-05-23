import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from './ButtonGroup';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    orientation: 'horizontal',
    attached: true,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    attached: { control: 'boolean' },
  },
  parameters: {
    docs: {
      source: {
        code: `<ButtonGroup variant="soft" color="neutral" size="md" attached>
  <ButtonGroup.Button>Open</ButtonGroup.Button>
  <ButtonGroup.Button>Restart</ButtonGroup.Button>
  <ButtonGroup.IconButton aria-label="More actions">
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="3" cy="8" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="13" cy="8" r="1.3" />
    </svg>
  </ButtonGroup.IconButton>
</ButtonGroup>`,
      },
    },
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroup.Button>Open</ButtonGroup.Button>
      <ButtonGroup.Button>Restart</ButtonGroup.Button>
      <ButtonGroup.IconButton aria-label="More actions">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="3" cy="8" r="1.3" />
          <circle cx="8" cy="8" r="1.3" />
          <circle cx="13" cy="8" r="1.3" />
        </svg>
      </ButtonGroup.IconButton>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
