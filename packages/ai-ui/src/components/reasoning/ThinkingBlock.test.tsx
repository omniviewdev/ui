import { createRef } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { ThinkingBlock } from './ThinkingBlock';

describe('ThinkingBlock', () => {
  it('renders collapsed by default', () => {
    renderAI(<ThinkingBlock content="reasoning text" data-testid="tb" />);
    expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-expanded', 'false');
    // Collapse wrapper has aria-hidden=true when collapsed
    const collapse = screen.getByTestId('tb').querySelector('[aria-hidden="true"]');
    expect(collapse).toBeInTheDocument();
  });

  it('renders expanded when defaultExpanded', () => {
    renderAI(<ThinkingBlock content="reasoning text" defaultExpanded />);
    expect(screen.getByText('reasoning text')).toBeVisible();
  });

  it('toggles on click', async () => {
    renderAI(<ThinkingBlock content="reasoning text" data-testid="tb" />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('reasoning text')).toBeVisible();
    await userEvent.click(screen.getByRole('button'));
    // After closing, content is hidden via height: 0 + overflow: hidden
    expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-expanded', 'false');
  });

  it('shows streaming indicator', () => {
    renderAI(<ThinkingBlock content="partial" streaming defaultExpanded data-testid="tb" />);
    expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-streaming', 'true');
    expect(screen.getByText('Thinking\u2026')).toBeInTheDocument();
  });

  it('shows duration with "Thought for X seconds"', () => {
    renderAI(<ThinkingBlock content="done" duration={2500} />);
    expect(screen.getByText('Thought for 3 seconds')).toBeInTheDocument();
  });

  it('formats ms duration', () => {
    renderAI(<ThinkingBlock content="done" duration={500} />);
    expect(screen.getByText('Thought for 500ms')).toBeInTheDocument();
  });

  it('shows brain icon', () => {
    renderAI(<ThinkingBlock content="test" data-testid="tb" />);
    expect(screen.getByTestId('tb').querySelector('svg')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ThinkingBlock ref={ref} content="test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<ThinkingBlock content="test" className="custom" data-testid="tb" />);
    expect(screen.getByTestId('tb').className).toContain('custom');
  });

  // --- Stream prop tests ---

  it('consumes stream and renders accumulated content', async () => {
    async function* gen(): AsyncGenerator<string> {
      yield 'Hello ';
      yield 'world';
    }

    renderAI(<ThinkingBlock stream={gen()} data-testid="tb" />);

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  it('sets streaming state while stream is active', async () => {
    let resolve: () => void;
    const gate = new Promise<void>((r) => { resolve = r; });

    async function* gen(): AsyncGenerator<string> {
      yield 'chunk';
      await gate;
    }

    renderAI(<ThinkingBlock stream={gen()} data-testid="tb" />);

    // While stream is open, should be streaming
    await waitFor(() => {
      expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-streaming', 'true');
    });

    // Finish the stream
    resolve!();

    await waitFor(() => {
      expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-streaming', 'false');
    });
  });

  it('calls onComplete when stream finishes', async () => {
    const onComplete = vi.fn();

    async function* gen(): AsyncGenerator<string> {
      yield 'done';
    }

    renderAI(<ThinkingBlock stream={gen()} onComplete={onComplete} data-testid="tb" />);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('auto-opens when stream starts', async () => {
    async function* gen(): AsyncGenerator<string> {
      yield 'thinking...';
    }

    renderAI(<ThinkingBlock stream={gen()} data-testid="tb" />);

    await waitFor(() => {
      expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-expanded', 'true');
    });
  });

  it('works without content or stream (renders empty)', () => {
    renderAI(<ThinkingBlock data-testid="tb" />);
    expect(screen.getByTestId('tb')).toBeInTheDocument();
  });
});
