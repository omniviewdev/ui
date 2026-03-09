import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { SplitButton } from './SplitButton';
import { Menu } from '../menu';

describe('SplitButton', () => {
  it('renders action and menu trigger', () => {
    renderWithTheme(
      <SplitButton>
        <SplitButton.Action>Save</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Save as Draft</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    // menu trigger has aria-haspopup
    const trigger = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-haspopup') != null);
    expect(trigger).toBeDefined();
  });

  it('fires action handler on primary click', () => {
    const onClick = vi.fn();
    renderWithTheme(
      <SplitButton>
        <SplitButton.Action onClick={onClick}>Deploy</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Deploy to staging</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('opens dropdown on trigger click', () => {
    renderWithTheme(
      <SplitButton>
        <SplitButton.Action>Save</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Save as Draft</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>,
    );

    // Dropdown should not be visible initially
    expect(screen.queryByText('Save as Draft')).not.toBeInTheDocument();

    // Click trigger
    const trigger = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-haspopup') != null)!;
    fireEvent.click(trigger);

    // Dropdown should be visible
    expect(screen.getByText('Save as Draft')).toBeInTheDocument();
  });

  it('applies style data attributes', () => {
    renderWithTheme(
      <SplitButton variant="outline" color="danger" size="lg">
        <SplitButton.Action>Delete</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Delete permanently</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>,
    );

    const action = screen.getByRole('button', { name: 'Delete' });
    expect(action).toHaveAttribute('data-ov-variant', 'outline');
    expect(action).toHaveAttribute('data-ov-color', 'danger');
    expect(action).toHaveAttribute('data-ov-size', 'lg');
  });

  it('disables all buttons when SplitButton is disabled', () => {
    renderWithTheme(
      <SplitButton disabled>
        <SplitButton.Action>Save</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Save as Draft</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>,
    );

    const action = screen.getByRole('button', { name: 'Save' });
    expect(action).toBeDisabled();

    const trigger = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-haspopup') != null);
    expect(trigger).toBeDisabled();
  });

  it('merges className on root', () => {
    const { container } = renderWithTheme(
      <SplitButton className="my-custom-class">
        <SplitButton.Action>Run</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Option</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>,
    );

    const root = container.firstElementChild!;
    expect(root.className).toContain('my-custom-class');
  });

  it('forwards ref to root element', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <SplitButton ref={ref}>
        <SplitButton.Action>Run</SplitButton.Action>
        <SplitButton.Menu>
          <Menu.Item>Option</Menu.Item>
        </SplitButton.Menu>
      </SplitButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
