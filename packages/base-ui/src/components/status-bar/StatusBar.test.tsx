import { createRef } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('renders children', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Item>main</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByText('main')).toBeVisible();
  });

  it('defaults size to sm', () => {
    renderWithTheme(<StatusBar data-testid="sb">content</StatusBar>);
    expect(screen.getByTestId('sb')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('applies size data attribute', () => {
    renderWithTheme(<StatusBar data-testid="sb" size="md">content</StatusBar>);
    expect(screen.getByTestId('sb')).toHaveAttribute('data-ov-size', 'md');
  });

  it('renders sections with align', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section align="start" data-testid="start">left</StatusBar.Section>
        <StatusBar.Section align="end" data-testid="end">right</StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('start')).toHaveAttribute('data-ov-align', 'start');
    expect(screen.getByTestId('end')).toHaveAttribute('data-ov-align', 'end');
  });

  it('renders clickable items as buttons', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Item onClick={handleClick}>Click me</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>,
    );

    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders non-clickable items as divs', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Item>Just text</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Just text')).toBeVisible();
  });

  it('marks active items', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Item active data-testid="item">Active</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('item')).toHaveAttribute('data-ov-active', 'true');
  });

  it('renders separator via the Separator component', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Item>A</StatusBar.Item>
          <StatusBar.Separator data-testid="sep" />
          <StatusBar.Item>B</StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>,
    );

    const sep = screen.getByTestId('sep');
    // The Separator component with decorative renders as role="presentation"
    expect(sep).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<StatusBar ref={ref}>content</StatusBar>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(<StatusBar data-testid="sb" className="custom">content</StatusBar>);
    expect(screen.getByTestId('sb')).toHaveClass('custom');
  });
});

describe('StatusBar.Indicator', () => {
  it('renders dot and label via StatusDot', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Indicator data-testid="ind" label="Connected" />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByText('Connected')).toBeVisible();
  });

  it('applies status', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Indicator data-testid="ind" status="success" label="OK" />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ind')).toHaveAttribute('data-ov-status', 'success');
  });

  it('defaults status to neutral', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Indicator data-testid="ind" label="Status" />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ind')).toHaveAttribute('data-ov-status', 'neutral');
  });

  it('applies pulse', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Indicator data-testid="ind" pulse label="Live" />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ind')).toHaveAttribute('data-ov-pulse', 'true');
  });

  it('does not apply pulse when not set', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Indicator data-testid="ind" label="Static" />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ind')).toHaveAttribute('data-ov-pulse', 'false');
  });

  it('forces size to sm', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Indicator data-testid="ind" label="Compact" />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ind')).toHaveAttribute('data-ov-size', 'sm');
  });
});

describe('StatusBar.Progress', () => {
  it('renders with value via Progress primitive', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Progress value={50} label="Building" />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByText('Building')).toBeVisible();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders indeterminate mode when no value', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Progress label="Loading" />
        </StatusBar.Section>
      </StatusBar>,
    );

    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-ov-indeterminate', 'true');
  });

  it('applies color to inner Progress', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Progress value={75} color="success" />
        </StatusBar.Section>
      </StatusBar>,
    );

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('data-ov-color', 'success');
  });

  it('renders without label', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Progress value={30} />
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('forces size to sm', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.Progress value={30} />
        </StatusBar.Section>
      </StatusBar>,
    );

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('data-ov-size', 'sm');
  });
});

describe('StatusBar.IconItem', () => {
  it('renders icon and text', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.IconItem icon={<svg data-testid="icon" />} data-testid="ii">
            Branch
          </StatusBar.IconItem>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByText('Branch')).toBeVisible();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders as button when clickable', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.IconItem icon={<svg />} onClick={handleClick}>
            Click
          </StatusBar.IconItem>
        </StatusBar.Section>
      </StatusBar>,
    );

    const button = screen.getByRole('button', { name: /Click/ });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as div when not clickable', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.IconItem icon={<svg />}>Static</StatusBar.IconItem>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Static')).toBeVisible();
  });

  it('applies color', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.IconItem icon={<svg />} color="danger" data-testid="ii">
            Error
          </StatusBar.IconItem>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ii')).toHaveAttribute('data-ov-color', 'danger');
  });

  it('applies active state', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.IconItem icon={<svg />} active data-testid="ii">
            Active
          </StatusBar.IconItem>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ii')).toHaveAttribute('data-ov-active', 'true');
  });
});

describe('StatusBar size propagation via context', () => {
  it('propagates size to IconItem', () => {
    renderWithTheme(
      <StatusBar size="lg">
        <StatusBar.Section>
          <StatusBar.IconItem icon={<svg />} data-testid="ii">Item</StatusBar.IconItem>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ii')).toHaveAttribute('data-ov-size', 'lg');
  });

  it('defaults to sm size in context', () => {
    renderWithTheme(
      <StatusBar>
        <StatusBar.Section>
          <StatusBar.IconItem icon={<svg />} data-testid="ii">Item</StatusBar.IconItem>
        </StatusBar.Section>
      </StatusBar>,
    );

    expect(screen.getByTestId('ii')).toHaveAttribute('data-ov-size', 'sm');
  });
});
