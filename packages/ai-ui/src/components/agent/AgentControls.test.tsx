import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { AgentControls } from './AgentControls';

describe('AgentControls', () => {
  it('shows Ready status when idle', () => {
    renderAI(<AgentControls status="idle" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('shows Start button when idle', () => {
    renderAI(<AgentControls status="idle" onStart={vi.fn()} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('calls onStart when clicked', async () => {
    const onStart = vi.fn();
    renderAI(<AgentControls status="idle" onStart={onStart} />);
    await userEvent.click(screen.getByText('Start'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('shows Pause and Stop when running', () => {
    renderAI(<AgentControls status="running" onPause={vi.fn()} onStop={vi.fn()} />);
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('shows Resume and Stop when paused', () => {
    renderAI(<AgentControls status="paused" onResume={vi.fn()} onStop={vi.fn()} />);
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('shows no action buttons when complete', () => {
    renderAI(<AgentControls status="complete" data-testid="ac" />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies status data attribute', () => {
    renderAI(<AgentControls status="error" data-testid="ac" />);
    expect(screen.getByTestId('ac')).toHaveAttribute('data-ov-status', 'error');
  });

  it('has role toolbar', () => {
    renderAI(<AgentControls status="idle" data-testid="ac" />);
    expect(screen.getByTestId('ac')).toHaveAttribute('role', 'toolbar');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AgentControls ref={ref} status="idle" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<AgentControls status="idle" className="custom" data-testid="ac" />);
    expect(screen.getByTestId('ac').className).toContain('custom');
  });
});
