import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast, type ToastPosition, type ToastSeverity } from './Toast';
import type { SurfaceType, SurfaceElevation } from '../../system/types';

// ---------------------------------------------------------------------------
// Helper component that exposes toast triggers inside stories
// ---------------------------------------------------------------------------

function ToastDemo({ position }: { position?: ToastPosition }) {
  const { toast, dismissAll } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <p style={{ margin: 0, fontFamily: 'var(--ov-font-sans)', fontSize: 14, opacity: 0.7 }}>
        Position: <strong>{position ?? 'bottom-right'}</strong>
      </p>
      <button
        type="button"
        onClick={() => toast('Item saved successfully.', { severity: 'success' })}
      >
        Success
      </button>
      <button
        type="button"
        onClick={() => toast('Something needs attention.', { severity: 'warning' })}
      >
        Warning
      </button>
      <button type="button" onClick={() => toast('An error occurred.', { severity: 'danger' })}>
        Danger
      </button>
      <button
        type="button"
        onClick={() => toast('Here is some information.', { severity: 'info' })}
      >
        Info
      </button>
      <button type="button" onClick={dismissAll}>
        Dismiss All
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Feedback/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  args: {
    position: 'bottom-right',
    maxVisible: 5,
    surface: 'raised',
    elevation: 2,
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
    },
    maxVisible: { control: { type: 'number', min: 1, max: 20 } },
    surface: {
      control: 'select',
      options: ['base', 'default', 'raised', 'overlay', 'inset', 'elevated'],
    },
    elevation: {
      control: 'select',
      options: [0, 1, 2, 3],
    },
    children: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Transient notification toasts rendered via a provider + hook pattern. Wrap your app with `<ToastProvider>` and use `useToast()` to trigger notifications.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
} as Meta;

export default meta;

interface StoryArgs {
  position: ToastPosition;
  maxVisible: number;
  surface: SurfaceType;
  elevation: SurfaceElevation;
}

type Story = StoryObj<StoryArgs>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Interactive playground: click buttons to trigger different severity toasts. */
export const Playground: Story = {
  render: (args) => (
    <ToastProvider
      position={args.position}
      maxVisible={args.maxVisible}
      surface={args.surface}
      elevation={args.elevation}
    >
      <ToastDemo position={args.position} />
    </ToastProvider>
  ),
};

/** Showcase of all four severity levels. */
export const AllSeverities: Story = {
  render: () => {
    function AllSeveritiesInner() {
      const { toast } = useToast();
      const severities: ToastSeverity[] = ['success', 'warning', 'danger', 'info'];

      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {severities.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toast(`This is a ${s} toast`, { severity: s, duration: 0 })}
            >
              {s}
            </button>
          ))}
        </div>
      );
    }

    return (
      <ToastProvider>
        <AllSeveritiesInner />
      </ToastProvider>
    );
  },
};

/** Toast with title and description. */
export const WithTitleAndDescription: Story = {
  name: 'Title + Description',
  render: () => {
    function TitleDescInner() {
      const { toast } = useToast();

      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() =>
              toast('Your changes have been saved to the server.', {
                title: 'Changes saved',
                severity: 'success',
                duration: 0,
              })
            }
          >
            Success with title
          </button>
          <button
            type="button"
            onClick={() =>
              toast('Please review the deployment configuration before proceeding.', {
                title: 'Action required',
                severity: 'warning',
                duration: 0,
              })
            }
          >
            Warning with title
          </button>
          <button
            type="button"
            onClick={() =>
              toast('The connection to the database was lost. Retrying in 5s...', {
                title: 'Connection error',
                severity: 'danger',
                duration: 0,
              })
            }
          >
            Error with title
          </button>
        </div>
      );
    }

    return (
      <ToastProvider>
        <TitleDescInner />
      </ToastProvider>
    );
  },
};

/** Promise toast that transitions from loading to success/error. */
export const PromiseToast: Story = {
  name: 'Promise (async)',
  render: () => {
    function PromiseInner() {
      const { promise } = useToast();

      const simulateSuccess = () => {
        const p = new Promise<{ name: string }>((resolve) =>
          setTimeout(() => resolve({ name: 'Deployment' }), 2000),
        );
        promise(p, {
          loading: 'Deploying...',
          success: (data) => `${data.name} completed successfully!`,
          error: 'Deployment failed',
        });
      };

      const simulateError = () => {
        const p = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 2000),
        );
        promise(p, {
          loading: 'Saving changes...',
          success: 'Changes saved!',
          error: 'Failed to save changes',
        });
      };

      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={simulateSuccess}>
            Simulate success (2s)
          </button>
          <button type="button" onClick={simulateError}>
            Simulate error (2s)
          </button>
        </div>
      );
    }

    return (
      <ToastProvider>
        <PromiseInner />
      </ToastProvider>
    );
  },
};

/** Toast with an action button that performs a callback. */
export const WithAction: Story = {
  render: () => {
    function WithActionInner() {
      const { toast } = useToast();

      return (
        <button
          type="button"
          onClick={() =>
            toast('Message archived.', {
              severity: 'info',
              duration: 0,
              action: {
                label: 'Undo',
                onClick: () => undefined,
              },
            })
          }
        >
          Archive with Undo
        </button>
      );
    }

    return (
      <ToastProvider>
        <WithActionInner />
      </ToastProvider>
    );
  },
};

/** Position the toast container at different screen corners. */
export const CustomPosition: Story = {
  render: () => {
    function PositionPicker() {
      const [pos, setPos] = useState<ToastPosition>('top-right');
      const positions: ToastPosition[] = [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ];

      return (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {positions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPos(p)}
                style={{ fontWeight: pos === p ? 'bold' : 'normal' }}
              >
                {p}
              </button>
            ))}
          </div>
          <ToastProvider position={pos}>
            <ToastDemo position={pos} />
          </ToastProvider>
        </div>
      );
    }

    return <PositionPicker />;
  },
};

/** Persistent toast that stays until manually dismissed (duration: 0). */
export const Persistent: Story = {
  render: () => {
    function PersistentInner() {
      const { toast } = useToast();

      return (
        <button
          type="button"
          onClick={() =>
            toast('This toast will not auto-dismiss.', {
              severity: 'warning',
              duration: 0,
            })
          }
        >
          Show Persistent Toast
        </button>
      );
    }

    return (
      <ToastProvider>
        <PersistentInner />
      </ToastProvider>
    );
  },
};

/** Compare different surface backgrounds and elevation levels. */
export const SurfaceAndElevation: Story = {
  name: 'Surface & Elevation',
  render: () => {
    const surfaces: SurfaceType[] = ['base', 'default', 'raised', 'overlay', 'inset', 'elevated'];
    const elevations: SurfaceElevation[] = [0, 1, 2, 3];

    function SurfaceElevationInner({
      surface,
      elevation,
    }: {
      surface: SurfaceType;
      elevation: SurfaceElevation;
    }) {
      const { toast } = useToast();

      return (
        <button
          type="button"
          onClick={() =>
            toast(`surface=${surface}, elevation=${elevation}`, {
              severity: 'info',
              duration: 0,
              title: `${surface} / e${elevation}`,
            })
          }
        >
          Toast
        </button>
      );
    }

    function Picker() {
      const [surface, setSurface] = useState<SurfaceType>('raised');
      const [elevation, setElevation] = useState<SurfaceElevation>(2);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <div>
            <strong style={{ display: 'block', marginBottom: 4 }}>Surface</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {surfaces.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSurface(s)}
                  style={{ fontWeight: surface === s ? 'bold' : 'normal' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <strong style={{ display: 'block', marginBottom: 4 }}>Elevation</strong>
            <div style={{ display: 'flex', gap: 6 }}>
              {elevations.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setElevation(e)}
                  style={{ fontWeight: elevation === e ? 'bold' : 'normal' }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <ToastProvider position="bottom-right" surface={surface} elevation={elevation}>
            <SurfaceElevationInner surface={surface} elevation={elevation} />
          </ToastProvider>
        </div>
      );
    }

    return <Picker />;
  },
};
