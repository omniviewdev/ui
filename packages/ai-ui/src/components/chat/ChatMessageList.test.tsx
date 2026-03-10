import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { ChatMessageList } from './ChatMessageList';
import type { ChatMessageListHandle } from './ChatMessageList';

const messages = Array.from({ length: 20 }, (_, i) => `Message ${i}`);

describe('ChatMessageList', () => {
  it('renders the virtualizer container with correct total size', () => {
    renderAI(
      <ChatMessageList
        count={messages.length}
        estimateSize={80}
        renderItem={(i) => <div>{messages[i]}</div>}
        data-testid="cml"
        style={{ height: 300 }}
      />,
    );
    // The inner container should have height = count * estimateSize
    const wrapper = screen.getByTestId('cml');
    const inner = wrapper.querySelector('[class*="Inner"]');
    expect(inner).toBeInTheDocument();
    expect(inner).toHaveStyle({ height: '1600px' });
  });

  it('exposes imperative handle with scrollToBottom, scrollToIndex, and getScrollElement', () => {
    const ref = createRef<ChatMessageListHandle>();
    renderAI(
      <ChatMessageList
        ref={ref}
        count={5}
        renderItem={(i) => <div>Item {i}</div>}
        style={{ height: 300 }}
      />,
    );
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current!.scrollToBottom).toBe('function');
    expect(typeof ref.current!.scrollToIndex).toBe('function');
    expect(typeof ref.current!.getScrollElement).toBe('function');
    expect(ref.current!.getScrollElement()).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className on wrapper', () => {
    renderAI(
      <ChatMessageList
        count={5}
        renderItem={(i) => <div>Item {i}</div>}
        className="custom"
        data-testid="cml"
        style={{ height: 300 }}
      />,
    );
    expect(screen.getByTestId('cml').className).toContain('custom');
  });

  it('does not call onScrollToTop without scrolling', () => {
    const onScrollToTop = vi.fn();
    renderAI(
      <ChatMessageList
        count={5}
        renderItem={(i) => <div>Item {i}</div>}
        onScrollToTop={onScrollToTop}
        style={{ height: 300 }}
      />,
    );
    expect(onScrollToTop).not.toHaveBeenCalled();
  });
});
