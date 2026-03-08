import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuUser, LuSettings, LuShield, LuCheckCircle } from 'react-icons/lu';
import { Stepper } from './Stepper';

const meta = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: {
    activeStep: 1,
  },
  argTypes: {
    activeStep: {
      control: { type: 'number', min: 0, max: 4 },
      description: '0-indexed current step.',
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

export const Playground: Story = {
  render: (args) => (
    <Stepper {...args} style={{ width: 600 }}>
      <Stepper.Step label="Account" />
      <Stepper.Step label="Profile" />
      <Stepper.Step label="Settings" />
      <Stepper.Step label="Review" />
    </Stepper>
  ),
};

// ---------------------------------------------------------------------------
// Horizontal (default)
// ---------------------------------------------------------------------------

export const Horizontal: Story = {
  args: {
    activeStep: 2,
    orientation: 'horizontal',
  },
  render: (args) => (
    <Stepper {...args} style={{ width: 600 }}>
      <Stepper.Step label="Account setup" />
      <Stepper.Step label="Personal info" />
      <Stepper.Step label="Preferences" />
      <Stepper.Step label="Confirmation" />
    </Stepper>
  ),
};

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  args: {
    activeStep: 1,
    orientation: 'vertical',
  },
  render: (args) => (
    <Stepper {...args} style={{ width: 320 }}>
      <Stepper.Step label="Create project" description="Set up a new workspace" />
      <Stepper.Step label="Add resources" description="Connect clusters and APIs" />
      <Stepper.Step label="Configure access" description="Set up roles and permissions" />
      <Stepper.Step label="Deploy" description="Launch your environment" />
    </Stepper>
  ),
};

// ---------------------------------------------------------------------------
// With error state
// ---------------------------------------------------------------------------

export const WithError: Story = {
  args: {
    activeStep: 2,
  },
  render: (args) => (
    <Stepper {...args} style={{ width: 600 }}>
      <Stepper.Step label="Account" />
      <Stepper.Step label="Verification" />
      <Stepper.Step label="Payment" error />
      <Stepper.Step label="Complete" />
    </Stepper>
  ),
};

// ---------------------------------------------------------------------------
// With descriptions
// ---------------------------------------------------------------------------

export const WithDescriptions: Story = {
  args: {
    activeStep: 1,
  },
  render: (args) => (
    <Stepper {...args} style={{ width: 700 }}>
      <Stepper.Step label="Account" description="Create your account credentials" />
      <Stepper.Step label="Profile" description="Fill out your profile information" />
      <Stepper.Step label="Settings" description="Configure your workspace preferences" />
      <Stepper.Step label="Review" description="Review and confirm your setup" />
    </Stepper>
  ),
};

// ---------------------------------------------------------------------------
// With custom icons
// ---------------------------------------------------------------------------

export const WithCustomIcons: Story = {
  args: {
    activeStep: 2,
  },
  render: (args) => (
    <Stepper {...args} style={{ width: 600 }}>
      <Stepper.Step label="Account" icon={<LuUser size={14} />} />
      <Stepper.Step label="Security" icon={<LuShield size={14} />} />
      <Stepper.Step label="Settings" icon={<LuSettings size={14} />} />
      <Stepper.Step label="Done" icon={<LuCheckCircle size={14} />} />
    </Stepper>
  ),
};

// ---------------------------------------------------------------------------
// Interactive demo
// ---------------------------------------------------------------------------

function InteractiveDemo() {
  const [active, setActive] = useState(0);
  const steps = ['Account', 'Profile', 'Settings', 'Review'];

  return (
    <div style={{ width: 600 }}>
      <Stepper activeStep={active}>
        {steps.map((label) => (
          <Stepper.Step key={label} label={label} />
        ))}
      </Stepper>
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <button
          type="button"
          onClick={() => setActive((s) => Math.max(0, s - 1))}
          disabled={active === 0}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setActive((s) => Math.min(steps.length, s + 1))}
          disabled={active > steps.length - 1}
        >
          {active === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
