import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ToastProvider, useToast, type ToastController } from './Toast';

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

    // Expiry commits the exit state; its effect then starts the 200ms transition.
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('Will vanish')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(199));
    expect(screen.getByText('Will vanish')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));

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
});

describe('controlled toast presentation', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(maxVisible = 5) {
    let api!: ToastController;
    function Consumer() {
      api = useToast();
      return null;
    }
    const view = renderWithTheme(
      <ToastProvider maxVisible={maxVisible}>
        <Consumer />
      </ToastProvider>,
    );
    return { api: () => api, ...view };
  }

  it('upserts and patches content without moving, remounting, or announcing progress', () => {
    const { api } = setup();
    const card = (count: number) => (
      <section>
        <button>Card action</button>
        <span>{count} units</span>
      </section>
    );
    act(() => {
      api().toast('Work started', { id: 'work', content: card(1), duration: 0 });
      api().toast('Other', { duration: 0 });
    });
    const button = screen.getByRole('button', { name: 'Card action' });
    button.focus();
    const parent = button.closest('[data-ov-component="toast"]');
    const order = parent?.parentElement?.textContent;
    act(() => api().toast('Work started', { id: 'work', content: card(2) }));
    expect(screen.getByRole('button', { name: 'Card action' })).toBe(button);
    expect(button).toHaveFocus();
    expect(button.closest('[data-ov-component="toast"]')).toBe(parent);
    expect(parent?.parentElement?.firstElementChild).toBe(parent);
    expect(order).toContain('Other');
    expect(screen.getByText('2 units')).toBeVisible();
    expect(screen.getAllByRole('status').map((node) => node.textContent)).toEqual([
      'Work started',
      'Other',
    ]);
    act(() => api().update('work', { content: card(3) }));
    expect(screen.getAllByRole('status').map((node) => node.textContent)).toEqual([
      'Work started',
      'Other',
    ]);
    act(() => api().update('work', { message: 'Completed', title: 'Transfer' }));
    expect(screen.getAllByRole('status').map((node) => node.textContent)).toEqual([
      'Transfer. Completed',
      'Other',
    ]);
    expect(screen.getByRole('button', { name: 'Card action' })).toBe(button);
    act(() => api().dismiss('work'));
    act(() => api().update('work', { message: 'Resurrected', content: card(3) }));
    expect(screen.queryByText('3 units')).not.toBeInTheDocument();
  });

  it('keeps ordinary action dismissal default and supports persistent actions', () => {
    const { api } = setup();
    const action = vi.fn();
    const dismissed = vi.fn();
    act(() =>
      api().toast('Stay', {
        id: 'stay',
        duration: 0,
        action: { label: 'Inspect', onClick: action },
        dismissOnAction: false,
        onDismiss: dismissed,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    expect(action).toHaveBeenCalledOnce();
    expect(dismissed).not.toHaveBeenCalled();
    act(() => api().update('stay', { dismissOnAction: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText('Stay')).not.toBeInTheDocument();
    expect(dismissed).toHaveBeenCalledExactlyOnceWith('action');
  });

  it('pauses remaining lifetime for hover and focus together without restarting on updates', () => {
    const { api } = setup();
    const dismissed = vi.fn();
    act(() => api().toast('Timer', { id: 'timer', duration: 1000, onDismiss: dismissed }));
    const close = screen.getByRole('button', { name: 'Close' });
    const toast = close.parentElement!;
    act(() => vi.advanceTimersByTime(400));
    fireEvent.mouseEnter(toast);
    fireEvent.focus(close);
    act(() => {
      vi.advanceTimersByTime(2000);
      api().update('timer', { message: 'Still here', duration: 1000 });
    });
    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(2000));
    expect(dismissed).not.toHaveBeenCalled();
    fireEvent.blur(close, { relatedTarget: document.body });
    act(() => vi.advanceTimersByTime(599));
    expect(dismissed).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(dismissed).toHaveBeenCalledExactlyOnceWith('timeout');
    act(() => api().dismissAll());
    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  it('starts terminal expiry once and ignores content or unchanged duration patches', () => {
    const { api } = setup();
    const dismissed = vi.fn();
    act(() => api().toast('Running', { id: 'task', duration: 0, onDismiss: dismissed }));
    act(() => vi.advanceTimersByTime(10000));
    act(() => api().update('task', { message: 'Done', duration: 1000 }));
    act(() => vi.advanceTimersByTime(600));
    act(() => api().update('task', { message: 'Details', duration: 1000 }));
    act(() => vi.advanceTimersByTime(400));
    expect(dismissed).toHaveBeenCalledExactlyOnceWith('timeout');
  });

  it('applies an explicitly changed positive duration without content updates resetting it', () => {
    const { api } = setup();
    const dismissed = vi.fn();
    act(() =>
      api().toast('Long lifetime', { id: 'duration', duration: 5000, onDismiss: dismissed }),
    );
    act(() => vi.advanceTimersByTime(400));
    act(() => api().update('duration', { duration: 1000 }));
    act(() => vi.advanceTimersByTime(600));
    act(() => api().update('duration', { message: 'Updated content', duration: 1000 }));
    act(() => vi.advanceTimersByTime(399));
    expect(dismissed).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(dismissed).toHaveBeenCalledExactlyOnceWith('timeout');
  });

  it('reports overflow, programmatic, close and dismissAll once per presentation', () => {
    const { api } = setup(1);
    const overflow = vi.fn();
    const programmatic = vi.fn();
    const close = vi.fn();
    const all = vi.fn();
    act(() => {
      api().toast('First', { id: 'first', duration: 0, onDismiss: overflow });
      api().toast('Second', { id: 'second', duration: 0, onDismiss: programmatic });
      api().dismiss('second');
      api().dismiss('second');
      api().toast('Third', { id: 'third', duration: 0, onDismiss: close });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    act(() => {
      api().update('third', { message: 'Cannot update exit' });
      api().dismissAll();
      api().toast('Fourth', { duration: 0, onDismiss: all });
      api().dismissAll();
      api().dismissAll();
    });
    expect(overflow).toHaveBeenCalledExactlyOnceWith('overflow');
    expect(programmatic).toHaveBeenCalledExactlyOnceWith('programmatic');
    expect(close).toHaveBeenCalledExactlyOnceWith('close');
    expect(all).toHaveBeenCalledExactlyOnceWith('dismissAll');
    expect(screen.queryByText('Cannot update exit')).not.toBeInTheDocument();
  });

  it('preserves promise rejection and never revives a dismissed loading toast', async () => {
    const { api } = setup();
    let reject!: (error: Error) => void;
    const pending = new Promise<string>((_resolve, rejectPromise) => {
      reject = rejectPromise;
    });
    let returned!: Promise<string>;
    act(() => {
      returned = api().promise(pending, {
        loading: 'Pending work',
        success: 'Finished',
        error: 'Failed work',
      });
    });
    expect(returned).toBe(pending);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    act(() => api().dismissAll());
    const failure = new Error('Failure');
    const observed = returned.catch((error: unknown) => error);
    await act(async () => {
      reject(failure);
      await observed;
    });
    expect(await observed).toBe(failure);
    expect(screen.queryByText('Failed work')).not.toBeInTheDocument();
  });

  it('clears expiry and exit timers when provider unmounts', () => {
    const { api, unmount } = setup();
    const dismissed = vi.fn();
    act(() => {
      api().toast('Expiry', { duration: 1000, onDismiss: dismissed });
      api().toast('Exit', { duration: 0 });
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]!);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(2000));
    expect(dismissed).not.toHaveBeenCalled();
  });
});
