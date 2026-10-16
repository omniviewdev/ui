import type { Meta, StoryObj } from '@storybook/react';
import { BUILT_IN_THEMES } from '../../theme/registry/catalog';
import { Button } from '../button';
import { Card } from '../card';
import { Separator, type SeparatorProps } from './Separator';

const meta = {
  title: 'Layout/Separator',
  component: Separator,
  tags: ['autodocs'],
  args: {
    variant: 'solid',
    color: 'neutral',
    size: 'md',
    orientation: 'horizontal',
    inset: 'none',
    label: '',
    labelAlign: 'center',
    decorative: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    inset: { control: 'inline-radio', options: ['none', 'start', 'end', 'middle'] },
    labelAlign: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    decorative: { control: 'boolean' },
  },
  render: (args) =>
    args.orientation === 'vertical' ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 12,
          minHeight: 72,
          border: '1px solid var(--ov-color-border-default)',
          borderRadius: 'var(--ov-radius-surface)',
          padding: 12,
        }}
      >
        <span style={{ alignSelf: 'center' }}>Left Pane</span>
        <Separator {...args} />
        <span style={{ alignSelf: 'center' }}>Right Pane</span>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: 12, width: '100%' }}>
        <span>Above</span>
        <Separator {...args} />
        <span>Below</span>
      </div>
    ),
} satisfies Meta<SeparatorProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const LabeledVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 14 }}>
      <Separator label="Workspace" labelAlign="start" />
      <Separator label="Runtime" labelAlign="center" color="brand" />
      <Separator label="Diagnostics" labelAlign="end" color="warning" />
    </div>
  ),
};

export const InCardUsage: Story = {
  render: () => (
    <Card style={{ width: 460 }}>
      <Card.Header>
        <Card.Title>Session</Card.Title>
        <Card.Description>Connected to runtime and healthy.</Card.Description>
      </Card.Header>
      <Separator inset="middle" />
      <Card.Body style={{ display: 'grid', gap: 8 }}>
        <div>Queue depth: 3</div>
        <div>Workers online: 12</div>
      </Card.Body>
      <Separator inset="middle" label="Actions" />
      <Card.Footer>
        <Button color="brand" variant="solid">
          Open
        </Button>
        <Button variant="ghost">Dismiss</Button>
      </Card.Footer>
    </Card>
  ),
};

export const VerticalPaneDivider: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'stretch',
        gap: 0,
        minHeight: 140,
        border: '1px solid var(--ov-color-border-default)',
        borderRadius: 'var(--ov-radius-surface)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 12, background: 'var(--ov-color-bg-surface)' }}>Explorer</div>
      <Separator orientation="vertical" variant="solid" color="neutral" />
      <div style={{ padding: 12, background: 'var(--ov-color-bg-surface-raised)' }}>Editor</div>
    </div>
  ),
};

const BOUNDARY_VARIANTS = ['default', 'soft', 'solid', 'outline', 'ghost'] as const;
const BOUNDARY_COLORS = ['brand', 'success', 'warning', 'danger', 'info', 'discovery', 'secondary'] as const;

export const BoundaryRegression: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Computed-style regression matrix for every built-in theme. Run in Chromium at compact and comfortable density; the play function checks real borders, labeled pseudo-elements, and vertical geometry.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {BUILT_IN_THEMES.map(({ id, name }) => (
        <section
          key={id}
          data-ov-theme={id}
          style={{ background: 'var(--ov-color-bg-base)', color: 'var(--ov-color-fg-default)', padding: 16 }}
        >
          <h2>{name}</h2>
          {(['base', 'surface'] as const).map((surface) => (
            <div key={surface} style={{ display: 'grid', gap: 16, padding: 16, background: `var(--ov-color-bg-${surface})` }}>
              <h3>{surface}</h3>
              {BOUNDARY_VARIANTS.map((variant) => {
                const props = variant === 'default' ? {} : { variant };
                const name = `${id}/${surface}/${variant}`;
                return (
                  <div key={variant} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 48px', gap: 16, alignItems: 'center', minHeight: 40 }}>
                    <span>{variant}</span>
                    <Separator {...props} data-boundary-case={`${name}/horizontal`} />
                    <Separator {...props} label="Group" data-boundary-case={`${name}/labeled`} />
                    <Separator {...props} orientation="vertical" data-boundary-case={`${name}/vertical`} />
                  </div>
                );
              })}
              {BOUNDARY_COLORS.map((color) => (
                <Separator key={color} color={color} data-boundary-case={`${id}/${surface}/${color}`} />
              ))}
              <div style={{ display: 'grid', gap: 12 }}>
                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <Separator key={size} size={size} data-boundary-case={`${id}/${surface}/size-${size}`} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
  play: ({ canvasElement }) => {
    delete canvasElement.dataset.boundaryRegressionStatus;
    delete canvasElement.dataset.boundaryRegressionCases;
    const separators = canvasElement.querySelectorAll<HTMLElement>('[data-boundary-case]');
    if (separators.length === 0) throw new Error('Boundary regression matrix did not render');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Boundary regression requires a real browser canvas');

    const boundaryColor = (parent: Element, token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      parent.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    for (const section of canvasElement.querySelectorAll('section[data-ov-theme]')) {
      if (boundaryColor(section, '--ov-color-border-overlay') !== boundaryColor(section, '--ov-color-border-default')) {
        throw new Error(`${section.getAttribute('data-ov-theme')}: overlay must resolve to the ordinary enclosure boundary`);
      }
    }

    const assertBorder = (element: HTMLElement, pseudo?: '::before' | '::after') => {
      const style = getComputedStyle(element, pseudo);
      const vertical = element.dataset.ovOrientation === 'vertical';
      const width = vertical ? style.borderLeftWidth : style.borderTopWidth;
      const borderStyle = vertical ? style.borderLeftStyle : style.borderTopStyle;
      const color = vertical ? style.borderLeftColor : style.borderTopColor;
      const name = `${element.dataset.boundaryCase}${pseudo ?? ''}`;
      if (borderStyle !== 'solid' || !(Number.parseFloat(width) > 0)) {
        throw new Error(`${name}: expected a visible solid border, received ${width} ${borderStyle}`);
      }
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      if (context.getImageData(0, 0, 1, 1).data[3] === 0) {
        throw new Error(`${name}: separator border is transparent`);
      }
      if (pseudo && !(Number.parseFloat(style.width) > 0)) {
        throw new Error(`${name}: labeled separator line has no inline extent`);
      }
      if (!style.getPropertyValue('--_ov-separator-color').trim()) {
        throw new Error(`${name}: separator color is unresolved (possible custom-property cycle)`);
      }
      if (
        element.dataset.ovColor === 'neutral'
        && element.dataset.ovVariant === 'soft'
        && color !== boundaryColor(element, '--ov-color-border-muted')
      ) {
        throw new Error(`${name}: neutral hairline must use the muted boundary, not a text color`);
      }
    };

    for (const separator of separators) {
      if (separator.dataset.ovHasLabel === 'true') {
        assertBorder(separator, '::before');
        assertBorder(separator, '::after');
      } else {
        assertBorder(separator);
        const rect = separator.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          throw new Error(`${separator.dataset.boundaryCase}: separator has empty geometry`);
        }
      }
      if (
        separator.closest('[data-ov-density]')?.getAttribute('data-ov-density') === 'compact'
        && separator.dataset.ovSize === 'md'
      ) {
        const style = getComputedStyle(separator, separator.dataset.ovHasLabel === 'true' ? '::before' : null);
        const width = separator.dataset.ovOrientation === 'vertical' ? style.borderLeftWidth : style.borderTopWidth;
        if (width !== '1px') throw new Error(`${separator.dataset.boundaryCase}: compact default must be a one-pixel hairline`);
      }
    }
    canvasElement.dataset.boundaryRegressionCases = String(separators.length);
    canvasElement.dataset.boundaryRegressionStatus = 'passed';
  },
};
