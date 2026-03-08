import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('renders steps with labels', () => {
    renderWithTheme(
      <Stepper activeStep={0}>
        <Stepper.Step label="First" />
        <Stepper.Step label="Second" />
        <Stepper.Step label="Third" />
      </Stepper>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('highlights the active step', () => {
    renderWithTheme(
      <Stepper activeStep={1}>
        <Stepper.Step label="First" />
        <Stepper.Step label="Second" />
        <Stepper.Step label="Third" />
      </Stepper>,
    );

    const labels = screen.getAllByText(/First|Second|Third/);
    // Second label should have active status
    expect(labels[1]!.closest('[data-ov-status]')).toHaveAttribute('data-ov-status', 'active');
  });

  it('marks completed steps with a checkmark', () => {
    renderWithTheme(
      <Stepper activeStep={2}>
        <Stepper.Step label="First" />
        <Stepper.Step label="Second" />
        <Stepper.Step label="Third" />
      </Stepper>,
    );

    // Steps 0 and 1 should be completed
    const steps = screen.getByText('First').closest('[data-ov-status]')!;
    expect(steps).toHaveAttribute('data-ov-status', 'completed');

    // Completed steps should render an SVG checkmark instead of a number
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBe(2); // First and Second steps
  });

  it('shows error state', () => {
    renderWithTheme(
      <Stepper activeStep={1}>
        <Stepper.Step label="First" />
        <Stepper.Step label="Second" error />
        <Stepper.Step label="Third" />
      </Stepper>,
    );

    const secondStep = screen.getByText('Second').closest('[data-ov-status]')!;
    expect(secondStep).toHaveAttribute('data-ov-status', 'error');
  });

  it('defaults to horizontal orientation', () => {
    renderWithTheme(
      <Stepper activeStep={0} data-testid="stepper">
        <Stepper.Step label="First" />
        <Stepper.Step label="Second" />
      </Stepper>,
    );

    expect(screen.getByTestId('stepper')).toHaveAttribute('data-ov-orientation', 'horizontal');
  });

  it('supports vertical orientation', () => {
    renderWithTheme(
      <Stepper activeStep={0} orientation="vertical" data-testid="stepper">
        <Stepper.Step label="First" />
        <Stepper.Step label="Second" />
      </Stepper>,
    );

    expect(screen.getByTestId('stepper')).toHaveAttribute('data-ov-orientation', 'vertical');
  });

  it('renders description text', () => {
    renderWithTheme(
      <Stepper activeStep={0}>
        <Stepper.Step label="Account" description="Create your account" />
      </Stepper>,
    );

    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('renders custom icon instead of step number', () => {
    renderWithTheme(
      <Stepper activeStep={0}>
        <Stepper.Step label="Custom" icon={<span data-testid="custom-icon">★</span>} />
      </Stepper>,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // Should not render a number
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('merges custom className onto root', () => {
    renderWithTheme(
      <Stepper activeStep={0} className="my-stepper" data-testid="stepper">
        <Stepper.Step label="First" />
      </Stepper>,
    );

    expect(screen.getByTestId('stepper').className).toContain('my-stepper');
  });

  it('renders disabled step with data-ov-disabled', () => {
    renderWithTheme(
      <Stepper activeStep={0}>
        <Stepper.Step label="First" />
        <Stepper.Step label="Disabled" disabled />
      </Stepper>,
    );

    const disabledStep = screen.getByText('Disabled').closest('[data-ov-disabled]');
    expect(disabledStep).toBeInTheDocument();
    expect(disabledStep).toHaveAttribute('aria-disabled', 'true');
  });

  it('allows completed override via prop', () => {
    renderWithTheme(
      <Stepper activeStep={2}>
        <Stepper.Step label="First" completed={false} />
        <Stepper.Step label="Second" />
        <Stepper.Step label="Third" />
      </Stepper>,
    );

    // First step should NOT be completed despite being before activeStep
    const firstStep = screen.getByText('First').closest('[data-ov-status]')!;
    expect(firstStep).toHaveAttribute('data-ov-status', 'pending');

    // Second step should still auto-complete
    const secondStep = screen.getByText('Second').closest('[data-ov-status]')!;
    expect(secondStep).toHaveAttribute('data-ov-status', 'completed');
  });

  it('renders step numbers for pending steps', () => {
    renderWithTheme(
      <Stepper activeStep={0}>
        <Stepper.Step label="First" />
        <Stepper.Step label="Second" />
        <Stepper.Step label="Third" />
      </Stepper>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render connector before the first step', () => {
    const { container } = renderWithTheme(
      <Stepper activeStep={0}>
        <Stepper.Step label="Only" />
      </Stepper>,
    );

    // With only one step, there should be no connector elements
    const connectors = container.querySelectorAll('[class*="Connector"]');
    expect(connectors.length).toBe(0);
  });
});
