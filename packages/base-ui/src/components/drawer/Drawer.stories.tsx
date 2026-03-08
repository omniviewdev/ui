import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { Drawer, type DrawerProps } from './Drawer';

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
