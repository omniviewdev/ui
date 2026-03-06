import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';

const meta = {
  title: 'Surfaces/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  args: {
    variant: 'soft',
    color: 'neutral',
    size: 'md',
    elevation: 0,
    surface: 'default',
    children: 'A lightweight surface container for grouping content.',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
    color: { control: 'select', options: ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    elevation: { control: 'inline-radio', options: [0, 1, 2, 3] },
    surface: { control: 'select', options: ['base', 'default', 'raised', 'overlay', 'inset', 'elevated'] },
    as: { control: 'select', options: ['div', 'section', 'article', 'aside'] },
  },
  render: (args) => <Sheet {...args} style={{ width: 360 }} />,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Elevations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {([0, 1, 2, 3] as const).map((elevation) => (
        <Sheet key={elevation} elevation={elevation} style={{ width: 160, textAlign: 'center' }}>
          Elevation {elevation}
        </Sheet>
      ))}
    </div>
  ),
};

export const SurfaceLevels: Story = {
  name: 'Surface Levels',
  render: () => {
    const levels = ['inset', 'base', 'default', 'raised', 'overlay', 'elevated'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Swatch strip — large blocks side-by-side so difference is obvious */}
        <div style={{ display: 'flex', gap: 0, borderRadius: 'var(--ov-radius-surface)', overflow: 'hidden', border: '1px solid var(--ov-color-border-muted)' }}>
          {levels.map((level) => (
            <Sheet
              key={level}
              surface={level}
              variant="ghost"
              style={{
                flex: 1,
                height: 120,
                borderRadius: 0,
                border: 'none',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: 12,
              }}
            >
              <span style={{ fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-muted)' }}>
                {level}
              </span>
            </Sheet>
          ))}
        </div>

        {/* Nested demonstration — each layer nests inside the next */}
        <Sheet surface="inset" variant="ghost" style={{ padding: 20, border: 'none' }}>
          <p style={{ margin: '0 0 8px', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-subtle)' }}>inset</p>
          <Sheet surface="base" variant="ghost" style={{ padding: 20, border: 'none' }}>
            <p style={{ margin: '0 0 8px', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-subtle)' }}>base</p>
            <Sheet surface="default" variant="ghost" style={{ padding: 20, border: 'none' }}>
              <p style={{ margin: '0 0 8px', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-subtle)' }}>default</p>
              <Sheet surface="raised" variant="ghost" style={{ padding: 20, border: 'none' }}>
                <p style={{ margin: '0 0 8px', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-subtle)' }}>raised</p>
                <Sheet surface="overlay" variant="ghost" style={{ padding: 20, border: 'none' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-subtle)' }}>overlay</p>
                  <Sheet surface="elevated" variant="ghost" style={{ padding: 20, border: 'none' }}>
                    <p style={{ margin: 0, fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-subtle)' }}>elevated</p>
                  </Sheet>
                </Sheet>
              </Sheet>
            </Sheet>
          </Sheet>
        </Sheet>
      </div>
    );
  },
};

export const IDELayout: Story = {
  name: 'IDE-Like Layout',
  render: () => (
    <Sheet surface="base" variant="ghost" style={{ display: 'flex', height: 360, width: '100%', gap: 0, padding: 0, borderRadius: 'var(--ov-radius-surface)', overflow: 'hidden', border: '1px solid var(--ov-color-border-muted)' }}>
      {/* Sidebar */}
      <Sheet surface="default" variant="ghost" as="aside" style={{ width: 200, padding: '12px 0', borderRadius: 0, border: 'none', borderRight: '1px solid var(--ov-color-border-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ margin: 0, padding: '0 12px 8px', fontSize: 'var(--ov-font-size-caption)', fontWeight: 'var(--ov-font-weight-title)' as never }}>Explorer</p>
        {['src', 'components', 'theme', 'utils'].map((item) => (
          <div key={item} style={{ padding: '4px 12px', fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-muted)', cursor: 'pointer' }}>
            {item}
          </div>
        ))}
      </Sheet>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Editor area */}
        <Sheet surface="raised" variant="ghost" style={{ flex: 1, padding: 16, borderRadius: 0, border: 'none' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 'var(--ov-font-weight-title)' as never }}>Editor</p>
          {/* Inset code block */}
          <Sheet surface="inset" variant="ghost" size="sm" style={{ fontFamily: 'var(--ov-font-mono)', fontSize: 'var(--ov-font-size-caption)', lineHeight: 1.6, border: 'none' }}>
            <div style={{ color: 'var(--ov-color-fg-subtle)' }}>{'const theme = {'}</div>
            <div style={{ paddingLeft: 16 }}>{'mode: "dark",'}</div>
            <div style={{ paddingLeft: 16, color: 'var(--ov-color-fg-subtle)' }}>{'density: "comfortable",'}</div>
            <div style={{ color: 'var(--ov-color-fg-subtle)' }}>{'};'}</div>
          </Sheet>
        </Sheet>
        {/* Bottom panel */}
        <Sheet surface="default" variant="ghost" style={{ height: 100, padding: 12, borderRadius: 0, border: 'none', borderTop: '1px solid var(--ov-color-border-muted)' }}>
          <p style={{ margin: 0, fontSize: 'var(--ov-font-size-caption)', color: 'var(--ov-color-fg-subtle)' }}>Terminal</p>
        </Sheet>
      </div>
    </Sheet>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const).map((color) => (
        <Sheet key={color} color={color} variant="solid">
          {color}
        </Sheet>
      ))}
    </div>
  ),
};
