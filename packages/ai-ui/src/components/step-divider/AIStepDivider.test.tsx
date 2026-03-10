import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { AIStepDivider } from './AIStepDivider';

describe('AIStepDivider', () => {
  it('renders a plain divider with separator role when no step or label', () => {
    renderAI(<AIStepDivider />);
    const el = screen.getByRole('separator');
    expect(el).toBeInTheDocument();
  });

  it('renders "Step 2" when step={2}', () => {
    renderAI(<AIStepDivider step={2} data-testid="div" />);
    expect(screen.getByTestId('div')).toHaveTextContent('Step 2');
  });

  it('renders custom label when label is provided', () => {
    renderAI(<AIStepDivider label="Re-evaluating" data-testid="div" />);
    expect(screen.getByTestId('div')).toHaveTextContent('Re-evaluating');
  });

  it('label overrides step number', () => {
    renderAI(<AIStepDivider step={3} label="Custom" data-testid="div" />);
    const el = screen.getByTestId('div');
    expect(el).toHaveTextContent('Custom');
    expect(el).not.toHaveTextContent('Step 3');
  });

  it('renders timestamp when provided', () => {
    const ts = new Date(2025, 0, 15, 14, 30, 0);
    renderAI(<AIStepDivider step={1} timestamp={ts} data-testid="div" />);
    const el = screen.getByTestId('div');
    // Should contain time string (format varies by locale, but will have 2:30 or 14:30)
    expect(el.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it('sets variant data attribute', () => {
    renderAI(<AIStepDivider step={1} variant="pill" data-testid="div" />);
    expect(screen.getByTestId('div')).toHaveAttribute('data-ov-variant', 'pill');
  });

  it('defaults variant to line', () => {
    renderAI(<AIStepDivider step={1} data-testid="div" />);
    expect(screen.getByTestId('div')).toHaveAttribute('data-ov-variant', 'line');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AIStepDivider ref={ref} step={1} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<AIStepDivider step={1} className="custom-class" data-testid="div" />);
    const el = screen.getByTestId('div');
    expect(el.className).toContain('custom-class');
  });
});
