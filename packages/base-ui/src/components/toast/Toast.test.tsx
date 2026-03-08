import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ToastProvider, useToast } from './Toast';

// ---------------------------------------------------------------------------
// Helper: renders a trigger button that invokes useToast inside the provider
// ---------------------------------------------------------------------------

function ToastTrigger({
  message = 'Hello toast',
  severity,
  duration,
  action,
}: {
  message?: string;
  severity?: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
  action?: { label: string; onClick: () => void };
}) {
  const { toast, dismiss, dismissAll } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const id = toast(message, { severity, duration, action });
          // Expose the id for dismiss tests
          (window as unknown as Record<string, string>).__lastToastId = id;
        }}
      >
        trigger
      </button>
      <button
        type="button"
        onClick={() => dismiss((window as unknown as Record<string, string>).__lastToastId ?? '')}
      >
        dismiss-one
      </button>
      <button type="button" onClick={dismissAll}>
        dismiss-all
      </button>
    </>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a toast when triggered via the hook', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider>
        <ToastTrigger message="Item saved" />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger'));
    expect(screen.getByText('Item saved')).toBeVisible();
  });

  it('auto-dismisses after the given duration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider>
        <ToastTrigger message="Will vanish" duration={3000} />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger'));
    expect(screen.getByText('Will vanish')).toBeVisible();

    // Advance past duration + exit animation timeout (200ms)
    act(() => vi.advanceTimersByTime(3200));

    expect(screen.queryByText('Will vanish')).not.toBeInTheDocument();
  });

  it('dismisses on close button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider>
        <ToastTrigger message="Close me" duration={0} />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger'));
    expect(screen.getByText('Close me')).toBeVisible();

    await user.click(screen.getByLabelText('Close'));

    // Allow exit animation timer
    act(() => vi.advanceTimersByTime(300));

    expect(screen.queryByText('Close me')).not.toBeInTheDocument();
  });

  it('applies the correct severity data attribute', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider>
        <ToastTrigger message="Danger!" severity="danger" duration={0} />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger'));

    const toast = screen.getByText('Danger!').closest('[data-ov-component="toast"]');
    expect(toast).toHaveAttribute('data-ov-severity', 'danger');
  });

  it('renders an action button and fires the callback', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderWithTheme(
      <ToastProvider>
        <ToastTrigger
          message="Undo?"
          duration={0}
          action={{ label: 'Undo', onClick: handleAction }}
        />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger'));
    const actionBtn = screen.getByText('Undo');
    await user.click(actionBtn);

    expect(handleAction).toHaveBeenCalledOnce();
  });

  it('limits visible toasts to maxVisible', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider maxVisible={2}>
        <ToastTrigger message="Toast" duration={0} />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger'));
    await user.click(screen.getByText('trigger'));
    await user.click(screen.getByText('trigger'));

    const toasts = screen.getAllByText('Toast');
    expect(toasts).toHaveLength(2);
  });

  it('renders title and message when title is provided', async () => {
    function TitleTrigger() {
      const { toast } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            toast('Description text', { title: 'Title text', severity: 'success', duration: 0 })
          }
        >
          trigger-title
        </button>
      );
    }

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider>
        <TitleTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger-title'));
    expect(screen.getByText('Title text')).toBeVisible();
    expect(screen.getByText('Description text')).toBeVisible();
  });

  it('promise toast transitions from loading to success', async () => {
    let resolver: (value: string) => void;
    const p = new Promise<string>((resolve) => {
      resolver = resolve;
    });

    function PromiseTrigger() {
      const { promise } = useToast();
      return (
        <button
          type="button"
          onClick={() =>
            promise(p, {
              loading: 'Loading...',
              success: (data) => `Done: ${data}`,
              error: 'Failed',
            })
          }
        >
          trigger-promise
        </button>
      );
    }

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider>
        <PromiseTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger-promise'));
    expect(screen.getByText('Loading...')).toBeVisible();

    // Resolve the promise
    await act(async () => {
      resolver!('ok');
    });

    expect(screen.getByText('Done: ok')).toBeVisible();
  });

  it('forwards a custom className on the provider container', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithTheme(
      <ToastProvider className="my-custom-class">
        <ToastTrigger message="Styled" duration={0} />
      </ToastProvider>,
    );

    await user.click(screen.getByText('trigger'));

    const container = screen.getByText('Styled').closest('[data-ov-component="toast-container"]');
    expect(container).toHaveClass('my-custom-class');
  });
});
