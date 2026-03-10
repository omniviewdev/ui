import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Meter } from './Meter';

describe('Meter', () => {
  it('renders with role="meter"', () => {
    renderWithTheme(<Meter value={50} aria-label="CPU" />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
  });

  it('sets aria-valuenow, aria-valuemin, aria-valuemax', () => {
    renderWithTheme(<Meter value={75} min={0} max={100} aria-label="Mem" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '75');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value to min/max', () => {
    renderWithTheme(<Meter value={150} min={0} max={100} aria-label="CPU" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps value below min', () => {
    renderWithTheme(<Meter value={-10} min={0} max={100} aria-label="CPU" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies size data attribute', () => {
    renderWithTheme(<Meter value={50} size="lg" aria-label="CPU" />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-ov-size', 'lg');
  });

  it('defaults size to md', () => {
    renderWithTheme(<Meter value={50} aria-label="CPU" />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-ov-size', 'md');
  });

  it('applies explicit color override', () => {
    renderWithTheme(<Meter value={50} color="danger" aria-label="CPU" />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-ov-color', 'danger');
  });

  it('computes zone=medium when value is in optimum range', () => {
    renderWithTheme(
      <Meter value={50} low={25} high={75} optimum={50} aria-label="Temp" />,
    );
    expect(screen.getByRole('meter')).toHaveAttribute('data-ov-zone', 'medium');
  });

  it('computes zone=high when value far from optimum', () => {
    renderWithTheme(
      <Meter value={90} low={25} high={75} optimum={10} aria-label="Temp" />,
    );
    expect(screen.getByRole('meter')).toHaveAttribute('data-ov-zone', 'high');
  });

  it('renders label', () => {
    renderWithTheme(<Meter value={73} label="CPU: 73%" aria-label="CPU" />);
    expect(screen.getByText('CPU: 73%')).toBeVisible();
  });

  it('uses string label as aria-label', () => {
    renderWithTheme(<Meter value={73} label="CPU usage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-label', 'CPU usage');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<Meter ref={ref} value={50} aria-label="CPU" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(<Meter value={50} className="custom" aria-label="CPU" />);
    expect(screen.getByRole('meter')).toHaveClass('custom');
  });
});
