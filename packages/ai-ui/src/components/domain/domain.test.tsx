import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { AIResourceCard } from './AIResourceCard';
import { AICommandSuggestion } from './AICommandSuggestion';
import { AIActionConfirmation } from './AIActionConfirmation';
import { AIHealthSummary } from './AIHealthSummary';
import { AIMetricSnapshot } from './AIMetricSnapshot';

describe('AIResourceCard', () => {
  it('renders kind and name', () => {
    renderAI(<AIResourceCard kind="Pod" name="nginx-abc123" />);
    expect(screen.getByText('Pod')).toBeInTheDocument();
    expect(screen.getByText('nginx-abc123')).toBeInTheDocument();
  });

  it('renders namespace', () => {
    renderAI(<AIResourceCard kind="Pod" name="test" namespace="default" />);
    expect(screen.getByText('default')).toBeInTheDocument();
  });

  it('renders status', () => {
    renderAI(<AIResourceCard kind="Pod" name="test" status="healthy" />);
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('renders detail', () => {
    renderAI(<AIResourceCard kind="Pod" name="test" detail={<span>Running 3/3</span>} />);
    expect(screen.getByText('Running 3/3')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AIResourceCard ref={ref} kind="Pod" name="test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('AICommandSuggestion', () => {
  it('renders command', () => {
    renderAI(<AICommandSuggestion command="kubectl get pods" />);
    expect(screen.getByText('kubectl get pods')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderAI(<AICommandSuggestion command="test" description="List all pods" />);
    expect(screen.getByText('List all pods')).toBeInTheDocument();
  });

  it('calls onApply', async () => {
    const onApply = vi.fn();
    renderAI(<AICommandSuggestion command="test" onApply={onApply} />);
    await userEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('marks destructive commands', () => {
    renderAI(<AICommandSuggestion command="delete" destructive data-testid="cs" />);
    expect(screen.getByTestId('cs')).toHaveAttribute('data-ov-destructive', 'true');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AICommandSuggestion ref={ref} command="test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('AIActionConfirmation', () => {
  it('renders title and description', () => {
    renderAI(
      <AIActionConfirmation
        title="Delete Pod"
        description="This will remove the pod"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Delete Pod')).toBeInTheDocument();
    expect(screen.getByText('This will remove the pod')).toBeInTheDocument();
  });

  it('calls onConfirm', async () => {
    const onConfirm = vi.fn();
    renderAI(
      <AIActionConfirmation
        title="Test"
        description="test"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText('Apply'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel', async () => {
    const onCancel = vi.fn();
    renderAI(
      <AIActionConfirmation
        title="Test"
        description="test"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows Confirm for destructive actions', () => {
    renderAI(
      <AIActionConfirmation
        title="Delete"
        description="test"
        destructive
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('has role alertdialog', () => {
    renderAI(
      <AIActionConfirmation
        title="Test"
        description="test"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        data-testid="ac"
      />,
    );
    expect(screen.getByTestId('ac')).toHaveAttribute('role', 'alertdialog');
  });
});

describe('AIHealthSummary', () => {
  it('renders title and counts', () => {
    renderAI(
      <AIHealthSummary
        title="Pod Health"
        counts={[
          { status: 'healthy', count: 10 },
          { status: 'error', count: 2 },
        ]}
        total={12}
      />,
    );
    expect(screen.getByText('Pod Health')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('12 total')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AIHealthSummary ref={ref} title="Test" counts={[]} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('AIMetricSnapshot', () => {
  it('renders label and value', () => {
    renderAI(<AIMetricSnapshot label="CPU Usage" value="72" unit="%" />);
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('shows trend indicator', () => {
    renderAI(<AIMetricSnapshot label="test" value="50" trend="up" />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('applies status data attribute', () => {
    renderAI(<AIMetricSnapshot label="test" value="95" status="critical" data-testid="ms" />);
    expect(screen.getByTestId('ms')).toHaveAttribute('data-ov-status', 'critical');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AIMetricSnapshot ref={ref} label="test" value="50" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
