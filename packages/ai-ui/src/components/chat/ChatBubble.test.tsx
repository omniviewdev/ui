import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { ChatBubble } from './ChatBubble';

describe('ChatBubble', () => {
  it('renders children', () => {
    renderAI(<ChatBubble role="user">Hello</ChatBubble>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies role data attribute', () => {
    renderAI(<ChatBubble role="assistant" data-testid="cb">Hi</ChatBubble>);
    expect(screen.getByTestId('cb')).toHaveAttribute('data-ov-role', 'assistant');
  });

  it('renders avatar slot', () => {
    renderAI(
      <ChatBubble role="user" avatar={<span data-testid="avatar">A</span>}>
        Hi
      </ChatBubble>,
    );
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('renders timestamp', () => {
    const date = new Date('2024-01-01T12:30:00');
    renderAI(<ChatBubble role="user" timestamp={date}>Hi</ChatBubble>);
    const time = document.querySelector('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('datetime', date.toISOString());
  });

  it('renders actions slot', () => {
    renderAI(
      <ChatBubble role="user" actions={<button data-testid="action">Copy</button>}>
        Hi
      </ChatBubble>,
    );
    expect(screen.getByTestId('action')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ChatBubble ref={ref} role="user">Hi</ChatBubble>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<ChatBubble role="user" className="custom" data-testid="cb">Hi</ChatBubble>);
    expect(screen.getByTestId('cb').className).toContain('custom');
  });

  it('renders system role', () => {
    renderAI(<ChatBubble role="system" data-testid="cb">System message</ChatBubble>);
    expect(screen.getByTestId('cb')).toHaveAttribute('data-ov-role', 'system');
  });
});
