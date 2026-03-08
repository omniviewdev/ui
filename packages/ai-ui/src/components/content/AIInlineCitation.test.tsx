import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { AIInlineCitation } from './AIInlineCitation';

describe('AIInlineCitation', () => {
  it('renders citation index', () => {
    renderAI(<AIInlineCitation index={1} />);
    expect(screen.getByText('[1]')).toBeInTheDocument();
  });

  it('calls onNavigate on click', async () => {
    const onNavigate = vi.fn();
    renderAI(<AIInlineCitation index={1} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText('[1]'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('shows source as title', () => {
    renderAI(<AIInlineCitation index={1} source="README.md" data-testid="c" />);
    expect(screen.getByTestId('c')).toHaveAttribute('title', 'README.md');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    renderAI(<AIInlineCitation ref={ref} index={1} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
