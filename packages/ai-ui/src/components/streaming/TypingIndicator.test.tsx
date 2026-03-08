import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator', () => {
  it('renders three dots', () => {
    renderAI(<TypingIndicator data-testid="ti" />);
    const el = screen.getByTestId('ti');
    const dotsContainer = el.querySelector('[class*="Dots"]');
    expect(dotsContainer).toBeInTheDocument();
    const dots = dotsContainer!.children;
    expect(dots).toHaveLength(3);
  });

  it('renders with label', () => {
    renderAI(<TypingIndicator label="Claude is thinking..." />);
    expect(screen.getByText('Claude is thinking...')).toBeInTheDocument();
  });

  it('has role status', () => {
    renderAI(<TypingIndicator data-testid="ti" />);
    expect(screen.getByTestId('ti')).toHaveAttribute('role', 'status');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    renderAI(<TypingIndicator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className', () => {
    renderAI(<TypingIndicator className="custom" data-testid="ti" />);
    expect(screen.getByTestId('ti').className).toContain('custom');
  });
});
