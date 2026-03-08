import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { StreamingText } from './StreamingText';

describe('StreamingText', () => {
  it('renders with immediate mode showing full content', () => {
    renderAI(<StreamingText content="Hello world" immediate data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveTextContent('Hello world');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    renderAI(<StreamingText ref={ref} content="test" immediate />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className', () => {
    renderAI(<StreamingText content="test" immediate className="custom" data-testid="st" />);
    const el = screen.getByTestId('st');
    expect(el.className).toContain('custom');
  });

  it('applies cursor data attribute', () => {
    renderAI(<StreamingText content="test" immediate cursor data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveAttribute('data-ov-cursor', 'true');
  });

  it('applies no cursor when cursor=false', () => {
    renderAI(<StreamingText content="test" immediate cursor={false} data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveAttribute('data-ov-cursor', 'false');
  });

  it('calls onComplete in immediate mode', () => {
    const onComplete = vi.fn();
    renderAI(<StreamingText content="test" immediate onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('defaults to immediate when reduced motion is set', () => {
    document.documentElement.setAttribute('data-ov-motion', 'reduced');
    const onComplete = vi.fn();
    renderAI(<StreamingText content="test" onComplete={onComplete} data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveTextContent('test');
    expect(onComplete).toHaveBeenCalledTimes(1);
    document.documentElement.removeAttribute('data-ov-motion');
  });
});
