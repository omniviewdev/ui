import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { SliderRootProps } from './Slider';
import { Slider } from './Slider';

interface StepMarksProps {
  min: number;
  max: number;
  step: number;
}

function StepMarks({ min, max, step }: StepMarksProps) {
  const marks: number[] = [];

  for (let value = min; value <= max; value += step) {
    marks.push(value);
  }

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {marks.map((value) => {
        const percentage = ((value - min) / (max - min)) * 100;
        const style: CSSProperties = {
          position: 'absolute',
          insetInlineStart: `${percentage}%`,
          insetBlockStart: '50%',
          transform: 'translate(-50%, -50%)',
          inlineSize: '1px',
          blockSize: '72%',
          background: 'color-mix(in srgb, var(--ov-color-border-strong) 72%, transparent 28%)',
        };

        return <span key={value} style={style} />;
      })}
    </div>
  );
}

const meta = {
  title: 'Components/Slider',
  component: Slider.Root,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'brand',
    size: 'md',
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    largeStep: 10,
    thumbAlignment: 'center',
    orientation: 'horizontal',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    thumbAlignment: { control: 'inline-radio', options: ['center', 'edge', 'edge-client-only'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    largeStep: { control: 'number' },
    minStepsBetweenValues: { control: 'number' },
  },
  render: (args: SliderRootProps) => {
    const isVertical = args.orientation === 'vertical';

    return (
      <div
        style={{ width: isVertical ? '140px' : '420px', height: isVertical ? '260px' : undefined }}
      >
        <Slider.Root {...args} aria-labelledby="slider-playground-label">
          <Slider.Label id="slider-playground-label">Execution priority</Slider.Label>
          <Slider.Value />
          <Slider.Control style={isVertical ? { height: '200px' } : undefined}>
            <Slider.Track>
              <Slider.Indicator />
              <Slider.Thumb />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </div>
    );
  },
} satisfies Meta<typeof Slider.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Range: Story = {
  render: (args) => (
    <div style={{ width: 440, display: 'grid', gap: 8 }}>
      <Slider.Root
        {...args}
        defaultValue={[25, 78]}
        min={0}
        max={100}
        step={2}
        minStepsBetweenValues={3}
        aria-labelledby="slider-range-label"
      >
        <Slider.Label id="slider-range-label">Workspace memory window</Slider.Label>
        <Slider.Value
          children={(formattedValues) => `${formattedValues[0]} GB - ${formattedValues[1]} GB`}
        />
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb index={0} />
            <Slider.Thumb index={1} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  ),
};

export const SteppedValues: Story = {
  render: (args) => (
    <div style={{ width: 420, display: 'grid', gap: 6 }}>
      <Slider.Root
        {...args}
        variant="outline"
        color="neutral"
        defaultValue={2}
        min={0}
        max={5}
        step={1}
        largeStep={1}
        aria-labelledby="slider-step-label"
      >
        <Slider.Label id="slider-step-label">Delay until repeat</Slider.Label>
        <Slider.Value children={(_, values) => `${values[0]} ticks`} />
        <Slider.Control>
          <Slider.Track>
            <StepMarks min={0} max={5} step={1} />
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          color: 'var(--ov-color-fg-subtle)',
          fontSize: 'var(--ov-font-size-caption)',
        }}
      >
        <span>Long</span>
        <span style={{ textAlign: 'end' }}>Short</span>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <div style={{ height: 260, width: 180, display: 'grid', placeItems: 'center' }}>
      <Slider.Root
        {...args}
        orientation="vertical"
        defaultValue={[20, 70]}
        min={0}
        max={100}
        step={5}
        aria-labelledby="slider-vertical-label"
      >
        <Slider.Label id="slider-vertical-label">Brightness window</Slider.Label>
        <Slider.Value
          children={(formattedValues) => `${formattedValues[0]}% - ${formattedValues[1]}%`}
        />
        <Slider.Control style={{ height: 190 }}>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb index={0} />
            <Slider.Thumb index={1} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  ),
};
