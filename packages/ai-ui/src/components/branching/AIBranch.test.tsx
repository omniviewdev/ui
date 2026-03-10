import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAI } from '../../test/render';
import {
  AIBranch,
  AIBranchContent,
  AIBranchSelector,
  AIBranchPrevious,
  AIBranchNext,
  AIBranchIndicator,
} from './AIBranch';

describe('AIBranch', () => {
  it('renders only the active branch content', () => {
    renderAI(
      <AIBranch count={3} active={1}>
        <AIBranchContent index={0}>Branch 0</AIBranchContent>
        <AIBranchContent index={1}>Branch 1</AIBranchContent>
        <AIBranchContent index={2}>Branch 2</AIBranchContent>
      </AIBranch>,
    );
    expect(screen.queryByText('Branch 0')).toBeNull();
    expect(screen.getByText('Branch 1')).toBeInTheDocument();
    expect(screen.queryByText('Branch 2')).toBeNull();
  });

  it('switches content when active changes', () => {
    const { rerender } = renderAI(
      <AIBranch count={2} active={0}>
        <AIBranchContent index={0}>First</AIBranchContent>
        <AIBranchContent index={1}>Second</AIBranchContent>
      </AIBranch>,
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.queryByText('Second')).toBeNull();

    rerender(
      <AIBranch count={2} active={1}>
        <AIBranchContent index={0}>First</AIBranchContent>
        <AIBranchContent index={1}>Second</AIBranchContent>
      </AIBranch>,
    );
    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('previous button calls onChange(active - 1)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderAI(
      <AIBranch count={3} active={2} onChange={onChange}>
        <AIBranchSelector />
      </AIBranch>,
    );
    await user.click(screen.getByRole('button', { name: 'Previous branch' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('next button calls onChange(active + 1)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderAI(
      <AIBranch count={3} active={0} onChange={onChange}>
        <AIBranchSelector />
      </AIBranch>,
    );
    await user.click(screen.getByRole('button', { name: 'Next branch' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('previous is disabled when active === 0', () => {
    renderAI(
      <AIBranch count={3} active={0}>
        <AIBranchSelector />
      </AIBranch>,
    );
    expect(screen.getByRole('button', { name: 'Previous branch' })).toBeDisabled();
  });

  it('next is disabled when active === count - 1', () => {
    renderAI(
      <AIBranch count={3} active={2}>
        <AIBranchSelector />
      </AIBranch>,
    );
    expect(screen.getByRole('button', { name: 'Next branch' })).toBeDisabled();
  });

  it('indicator shows "N of M" text', () => {
    renderAI(
      <AIBranch count={5} active={2}>
        <AIBranchIndicator />
      </AIBranch>,
    );
    expect(screen.getByText('3 of 5')).toBeInTheDocument();
  });

  it('forwards ref on root', () => {
    const ref = vi.fn();
    renderAI(
      <AIBranch ref={ref} count={1} active={0}>
        <span>child</span>
      </AIBranch>,
    );
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0]?.[0]).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className on root', () => {
    const { container } = renderAI(
      <AIBranch count={1} active={0} className="custom-class">
        <span>child</span>
      </AIBranch>,
    );
    const root = container.firstElementChild;
    expect(root?.classList.contains('custom-class')).toBe(true);
  });

  it('selector respects align prop', () => {
    renderAI(
      <AIBranch count={3} active={1}>
        <AIBranchSelector align="end" data-testid="selector" />
      </AIBranch>,
    );
    const selector = screen.getByTestId('selector');
    expect(selector.getAttribute('data-align')).toBe('end');
  });
});
