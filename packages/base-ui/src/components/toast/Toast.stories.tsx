import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast, type ToastPosition, type ToastSeverity } from './Toast';

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
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Interactive playground: click buttons to trigger different severity toasts. */
export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
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
