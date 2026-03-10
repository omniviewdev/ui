import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { AICommandSuggestion } from './AICommandSuggestion';
import { AIActionConfirmation } from './AIActionConfirmation';

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
