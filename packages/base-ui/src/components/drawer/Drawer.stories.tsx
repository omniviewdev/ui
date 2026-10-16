import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Drawer, type DrawerProps } from './Drawer';
import { BUILT_IN_THEMES } from '../../theme/registry/catalog';

const meta = {
  title: 'Surfaces/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: {
    open: true,
    anchor: 'bottom',
    defaultSize: 280,
    minSize: 120,
    resizable: true,
    overlay: false,
    modal: false,
    animate: true,
  },
  argTypes: {
    anchor: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    handleVariant: { control: 'inline-radio', options: ['bar', 'edge'] },
    defaultSize: { control: { type: 'number', min: 100, max: 600 } },
    minSize: { control: { type: 'number', min: 50, max: 300 } },
    resizable: { control: 'boolean' },
    overlay: { control: 'boolean' },
    modal: { control: 'boolean' },
    animate: { control: 'boolean' },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundStory(args: DrawerProps) {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        position: 'relative',
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--ov-color-border-muted)',
        borderRadius: 'var(--ov-radius-surface)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ov-panel-padding)',
        }}
      >
        <Button variant="outline" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Open'} Drawer
        </Button>
      </div>
      <Drawer {...args} open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <p
            style={{
              margin: 0,
              color: 'var(--ov-color-fg-muted)',
              fontSize: 'var(--ov-font-size-caption)',
            }}
          >
            Drag the handle to resize. This panel supports min/max constraints.
          </p>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}

export const Playground: Story = {
  render: (args) => <PlaygroundStory {...args} />,
};

export const HandleContrast: Story = {
  args: { animate: false, handleVariant: 'bar' },
  render: (args) => <PlaygroundStory {...args} />,
  play: ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-ov-theme');
    const drawer = canvasElement.querySelector<HTMLElement>('[data-ov-handle="bar"]');
    const handle = drawer?.querySelector<HTMLElement>('[role="separator"] > div');
    if (!drawer || !handle) throw new Error('Expected a visible default drawer resize bar');

    const luminance = (color: string) => {
      const match = /^rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*\)$/.exec(color);
      if (!match) throw new Error(`Expected an opaque computed RGB color, received ${color}`);
      const [red, green, blue] = match.slice(1).map((channel) => {
        const value = Number(channel) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
    };

    // Measure idle paint, not a hover/focus cue or an intermediate theme transition.
    if (handle.parentElement?.matches(':hover')) throw new Error('Move the pointer off the resize handle');
    const previousTransition = handle.style.transition;
    handle.style.transition = 'none';
    try {
      for (const { id } of BUILT_IN_THEMES) {
        root.dataset.ovTheme = id;
        const barBounds = handle.getBoundingClientRect();
        if (barBounds.width <= 0 || barBounds.height <= 0) throw new Error(`${id}: resize bar is not visible`);
        const foreground = luminance(getComputedStyle(handle).backgroundColor);
        const background = luminance(getComputedStyle(drawer).backgroundColor);
        const ratio = (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
        if (ratio < 3) throw new Error(`${id}: idle resize bar contrast ${ratio.toFixed(2)}:1 is below 3:1`);
      }
    } finally {
      if (previousTheme === null) root.removeAttribute('data-ov-theme');
      else root.setAttribute('data-ov-theme', previousTheme);
      handle.style.transition = previousTransition;
    }
  },
};

function OverlayModalStory() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="solid" color="brand" onClick={() => setOpen(true)}>
        Open Modal Drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} overlay modal anchor="right" defaultSize={360}>
        <Drawer.Content>
          <h3 style={{ margin: '0 0 12px', fontSize: 'var(--ov-font-size-title)' }}>
            Detail Panel
          </h3>
          <p style={{ margin: 0, color: 'var(--ov-color-fg-muted)' }}>
            This drawer slides in from the right with a backdrop overlay.
          </p>
        </Drawer.Content>
      </Drawer>
    </>
  );
}

export const OverlayModal: Story = {
  args: { open: false },
  render: () => <OverlayModalStory />,
};

function AnchorsStory() {
  const [anchor, setAnchor] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [open, setOpen] = useState(true);
  const isVertical = anchor === 'left' || anchor === 'right';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['top', 'bottom', 'left', 'right'] as const).map((a) => (
          <Button
            key={a}
            variant={anchor === a ? 'solid' : 'outline'}
            size="sm"
            onClick={() => {
              setAnchor(a);
              setOpen(true);
            }}
          >
            {a}
          </Button>
        ))}
      </div>
      <div
        style={{
          position: 'relative',
          height: 360,
          display: 'flex',
          flexDirection: isVertical ? 'row' : 'column',
          border: '1px solid var(--ov-color-border-muted)',
          borderRadius: 'var(--ov-radius-surface)',
          overflow: 'hidden',
        }}
      >
        {(anchor === 'top' || anchor === 'left') && (
          <Drawer open={open} onOpenChange={setOpen} anchor={anchor} defaultSize={180}>
            <Drawer.Content>
              <p
                style={{
                  margin: 0,
                  color: 'var(--ov-color-fg-muted)',
                  fontSize: 'var(--ov-font-size-caption)',
                }}
              >
                {anchor} drawer
              </p>
            </Drawer.Content>
          </Drawer>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
            Toggle
          </Button>
        </div>
        {(anchor === 'bottom' || anchor === 'right') && (
          <Drawer open={open} onOpenChange={setOpen} anchor={anchor} defaultSize={180}>
            <Drawer.Content>
              <p
                style={{
                  margin: 0,
                  color: 'var(--ov-color-fg-muted)',
                  fontSize: 'var(--ov-font-size-caption)',
                }}
              >
                {anchor} drawer
              </p>
            </Drawer.Content>
          </Drawer>
        )}
      </div>
    </div>
  );
}

export const Anchors: Story = {
  args: { open: true },
  render: () => <AnchorsStory />,
};

function EdgeHandleStory() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--ov-font-size-caption)',
          color: 'var(--ov-color-fg-muted)',
        }}
      >
        The edge itself is the drag handle. Hover over the border to see the accent highlight.
      </p>
      <div
        style={{
          position: 'relative',
          height: 360,
          display: 'flex',
          flexDirection: 'row',
          border: '1px solid var(--ov-color-border-muted)',
          borderRadius: 'var(--ov-radius-surface)',
          overflow: 'hidden',
        }}
      >
        <Drawer
          open={open}
          onOpenChange={setOpen}
          anchor="left"
          defaultSize={240}
          handleVariant="edge"
        >
          <Drawer.Content>
            <p style={{ margin: '0 0 8px', fontWeight: 'var(--ov-font-weight-title)' as never }}>
              Sidebar
            </p>
            <p
              style={{
                margin: 0,
                color: 'var(--ov-color-fg-muted)',
                fontSize: 'var(--ov-font-size-caption)',
              }}
            >
              Drag the right edge to resize.
            </p>
          </Drawer.Content>
        </Drawer>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
            Toggle
          </Button>
        </div>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          anchor="right"
          defaultSize={200}
          handleVariant="edge"
        >
          <Drawer.Content>
            <p style={{ margin: '0 0 8px', fontWeight: 'var(--ov-font-weight-title)' as never }}>
              Detail
            </p>
            <p
              style={{
                margin: 0,
                color: 'var(--ov-color-fg-muted)',
                fontSize: 'var(--ov-font-size-caption)',
              }}
            >
              Drag the left edge to resize.
            </p>
          </Drawer.Content>
        </Drawer>
      </div>
    </div>
  );
}

export const EdgeHandle: Story = {
  name: 'Edge Handle',
  render: () => <EdgeHandleStory />,
};
