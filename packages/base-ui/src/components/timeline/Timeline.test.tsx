import { createRef } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Timeline } from './Timeline';

describe('Timeline', () => {
  it('renders items', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item>Event A</Timeline.Item>
        <Timeline.Item>Event B</Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByText('Event A')).toBeVisible();
    expect(screen.getByText('Event B')).toBeVisible();
  });

  it('renders timestamp', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item timestamp="10:30 AM">Deployed</Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByText('10:30 AM')).toBeVisible();
    expect(screen.getByText('Deployed')).toBeVisible();
  });

  it('renders icon in dot', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item icon="✓">Done</Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByText('✓')).toBeVisible();
  });

  it('applies color data attribute', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item color="success" data-testid="item">OK</Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByTestId('item')).toHaveAttribute('data-ov-color', 'success');
  });

  it('defaults color to neutral', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item data-testid="item">Event</Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByTestId('item')).toHaveAttribute('data-ov-color', 'neutral');
  });

  it('renders group with label', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Group label="Today">
          <Timeline.Item>Event A</Timeline.Item>
        </Timeline.Group>
      </Timeline>,
    );

    expect(screen.getByText('Today')).toBeVisible();
    expect(screen.getByText('Event A')).toBeVisible();
  });

  it('renders multiple groups', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Group label="Today">
          <Timeline.Item>A</Timeline.Item>
        </Timeline.Group>
        <Timeline.Group label="Yesterday">
          <Timeline.Item>B</Timeline.Item>
        </Timeline.Group>
      </Timeline>,
    );

    expect(screen.getByText('Today')).toBeVisible();
    expect(screen.getByText('Yesterday')).toBeVisible();
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <Timeline ref={ref}>
        <Timeline.Item>A</Timeline.Item>
      </Timeline>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className on root', () => {
    renderWithTheme(
      <Timeline className="custom" data-testid="tl">
        <Timeline.Item>A</Timeline.Item>
      </Timeline>,
    );
    expect(screen.getByTestId('tl')).toHaveClass('custom');
  });

  it('forwards ref on item', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <Timeline>
        <Timeline.Item ref={ref}>A</Timeline.Item>
      </Timeline>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // Size

  it('applies size data attribute to root', () => {
    renderWithTheme(
      <Timeline data-testid="tl" size="sm">
        <Timeline.Item>A</Timeline.Item>
      </Timeline>,
    );
    expect(screen.getByTestId('tl')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('defaults size to md', () => {
    renderWithTheme(
      <Timeline data-testid="tl">
        <Timeline.Item>A</Timeline.Item>
      </Timeline>,
    );
    expect(screen.getByTestId('tl')).toHaveAttribute('data-ov-size', 'md');
  });

  it('propagates size to items', () => {
    renderWithTheme(
      <Timeline size="lg">
        <Timeline.Item data-testid="item">A</Timeline.Item>
      </Timeline>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('data-ov-size', 'lg');
  });

  // Expandable

  it('renders expandable item collapsed by default', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item details={<div>Detail content</div>}>Header</Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByText('Header')).toBeVisible();
    const trigger = screen.getByRole('button', { name: /Header/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands on click', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item details={<div>Detail content</div>}>Header</Timeline.Item>
      </Timeline>,
    );

    const trigger = screen.getByRole('button', { name: /Header/ });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports defaultExpanded', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item details={<div>Detail content</div>} defaultExpanded>
          Header
        </Timeline.Item>
      </Timeline>,
    );

    const trigger = screen.getByRole('button', { name: /Header/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports controlled expanded', () => {
    const onExpandedChange = vi.fn();
    renderWithTheme(
      <Timeline>
        <Timeline.Item
          details={<div>Detail content</div>}
          expanded={false}
          onExpandedChange={onExpandedChange}
        >
          Header
        </Timeline.Item>
      </Timeline>,
    );

    const trigger = screen.getByRole('button', { name: /Header/ });
    fireEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it('renders nested timeline in details', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item
          details={
            <Timeline>
              <Timeline.Item>Sub-step 1</Timeline.Item>
              <Timeline.Item>Sub-step 2</Timeline.Item>
            </Timeline>
          }
          defaultExpanded
        >
          Parent event
        </Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByText('Sub-step 1')).toBeInTheDocument();
    expect(screen.getByText('Sub-step 2')).toBeInTheDocument();
  });

  it('does not render expand trigger when no details', () => {
    renderWithTheme(
      <Timeline>
        <Timeline.Item>Simple event</Timeline.Item>
      </Timeline>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
