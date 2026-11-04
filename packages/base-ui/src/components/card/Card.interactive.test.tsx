import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Menu } from '../menu';
import { Card } from './Card';

describe('interactive Card', () => {
  it('changes visual selection through its native control without asserting selection on a section', async () => {
    const user = userEvent.setup();
    function Fixture() {
      const [selected, setSelected] = useState(false);
      return (
        <Card interactive selected={selected} data-testid="card">
          <Card.Header>
            <Card.Title>
              <Card.ActionArea
                as="button"
                stretched
                aria-pressed={selected}
                onClick={() => setSelected(!selected)}
              >
                Design workspace
              </Card.ActionArea>
            </Card.Title>
          </Card.Header>
        </Card>
      );
    }
    renderWithTheme(<Fixture />);
    const card = screen.getByTestId('card');
    const primary = screen.getByRole('button', { name: 'Design workspace' });
    await user.tab();
    expect(primary).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(card).toHaveAttribute('data-ov-selected', 'true');
    expect(primary).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(card).toHaveAttribute('data-ov-selected', 'false');
    expect(card).not.toHaveAttribute('aria-selected');
    expect(card).not.toHaveAttribute('aria-pressed');
    expect(card).not.toHaveAttribute('role');
  });

  it('uses native button activation once per key without submitting a surrounding form', async () => {
    const user = userEvent.setup();
    const activate = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    renderWithTheme(
      <form onSubmit={submit}>
        <Card>
          <Card.ActionArea as="button" ref={ref} onClick={activate}>
            Open project
          </Card.ActionArea>
        </Card>
      </form>,
    );
    await user.tab();
    expect(ref.current).toHaveFocus();
    expect(ref.current).toHaveAttribute('type', 'button');
    await user.keyboard('{Enter}');
    expect(activate).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(activate).toHaveBeenCalledTimes(2);
    expect(submit).not.toHaveBeenCalled();
  });

  it('preserves a full accessible link name, navigation attributes, and modified clicks', async () => {
    const user = userEvent.setup();
    const name = 'Production workspace with a very long name that remains fully accessible';
    const activate = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLAnchorElement>();
    renderWithTheme(
      <Card interactive>
        <Card.Header>
          <Card.Title>
            <Card.ActionArea
              as="a"
              ref={ref}
              href="#production"
              target="_blank"
              rel="noopener"
              stretched
              onClick={activate}
            >
              <span>{name}</span>
            </Card.ActionArea>
          </Card.Title>
        </Card.Header>
      </Card>,
    );
    const link = screen.getByRole('link', { name });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('href', '#production');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(activate).toHaveBeenCalledTimes(1);
    fireEvent.click(link, { metaKey: true });
    expect(activate.mock.calls[1]?.[0].metaKey).toBe(true);
    expect(link.querySelector('button, a, [role="button"]')).toBeNull();
  });

  it('opens sibling overflow by keyboard, runs its item, and returns focus without activating navigation', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn((event) => event.preventDefault());
    const pin = vi.fn();
    renderWithTheme(
      <Card interactive>
        <Card.Header>
          <Card.Title>
            <Card.ActionArea as="a" href="#design" stretched onClick={navigate}>
              Design workspace
            </Card.ActionArea>
          </Card.Title>
          <Card.Action>
            <Menu.Root>
              <Menu.Trigger aria-label="Workspace actions">Actions</Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item onClick={pin}>Pin workspace</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </Card.Action>
        </Card.Header>
      </Card>,
    );
    const link = screen.getByRole('link', { name: 'Design workspace' });
    const trigger = screen.getByRole('button', { name: 'Workspace actions' });
    expect(link.contains(trigger)).toBe(false);
    await user.tab();
    expect(link).toHaveFocus();
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const item = await screen.findByRole('menuitem', { name: 'Pin workspace' });
    await waitFor(() => expect(item).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(pin).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.tab({ shift: true });
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('disables every primary form while leaving a sibling action independent', async () => {
    const user = userEvent.setup();
    const activate = vi.fn();
    const action = vi.fn();
    renderWithTheme(
      <Card interactive disabled>
        <Card.ActionArea onClick={activate}>Legacy primary</Card.ActionArea>
        <Card.ActionArea as="button" onClick={activate}>
          Button primary
        </Card.ActionArea>
        <Card.ActionArea as="a" href="#disabled" onClick={activate}>
          Link primary
        </Card.ActionArea>
        <Card.Action>
          <button onClick={action} type="button">
            Retry connection
          </button>
        </Card.Action>
      </Card>,
    );
    const legacy = screen.getByRole('button', { name: 'Legacy primary' });
    const button = screen.getByRole('button', { name: 'Button primary' });
    const link = screen.getByRole('link', { name: 'Link primary' });
    expect(button).toBeDisabled();
    expect(legacy).toHaveAttribute('tabindex', '-1');
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(link).not.toHaveAttribute('href');
    fireEvent.click(legacy);
    fireEvent.keyDown(legacy, { key: 'Enter' });
    fireEvent.click(button);
    expect(fireEvent.click(link)).toBe(false);
    expect(activate).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Retry connection' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('respects keyboard cancellation and repeat on the existing div ActionArea', () => {
    const activate = vi.fn();
    const { rerender } = renderWithTheme(
      <Card.ActionArea onClick={activate} onKeyDown={(event) => event.preventDefault()}>
        Legacy action
      </Card.ActionArea>,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(activate).not.toHaveBeenCalled();
    rerender(<Card.ActionArea onClick={activate}>Legacy action</Card.ActionArea>);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter', repeat: true });
    expect(activate).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(screen.getByRole('button'), { key: ' ', repeat: true })).toBe(false);
    expect(activate).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(activate).toHaveBeenCalledTimes(1);
  });
});
