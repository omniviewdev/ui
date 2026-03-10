import { createRef } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { StreamingText } from './StreamingText';

/** Helper: create an async iterable from an array of chunks */
async function* chunksOf(chunks: string[], delayMs = 0): AsyncGenerator<string> {
  for (const chunk of chunks) {
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
    yield chunk;
  }
}

describe('StreamingText', () => {
  it('renders static content immediately when content prop is used', () => {
    renderAI(<StreamingText content="Hello world" data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveTextContent('Hello world');
  });

  it('sets data-ov-streaming to false for static content', () => {
    renderAI(<StreamingText content="test" data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveAttribute('data-ov-streaming', 'false');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<StreamingText ref={ref} content="test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<StreamingText content="test" className="custom" data-testid="st" />);
    const el = screen.getByTestId('st');
    expect(el.className).toContain('custom');
  });

  it('applies cursor data attribute', () => {
    renderAI(<StreamingText content="test" cursor data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveAttribute('data-ov-cursor', 'true');
  });

  it('applies no cursor when cursor=false', () => {
    renderAI(<StreamingText content="test" cursor={false} data-testid="st" />);
    expect(screen.getByTestId('st')).toHaveAttribute('data-ov-cursor', 'false');
  });

  it('streams text from async iterable and calls onComplete', async () => {
    const onComplete = vi.fn();
    const stream = chunksOf(['Hello ', 'world']);
    renderAI(<StreamingText stream={stream} onComplete={onComplete} data-testid="st" />);

    await waitFor(() => {
      expect(screen.getByTestId('st')).toHaveTextContent('Hello world');
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('st')).toHaveAttribute('data-ov-streaming', 'false');
  });

  it('calls onChunk with accumulated text', async () => {
    const onChunk = vi.fn();
    const stream = chunksOf(['a', 'b', 'c']);
    renderAI(<StreamingText stream={stream} onChunk={onChunk} data-testid="st" />);

    await waitFor(() => {
      expect(screen.getByTestId('st')).toHaveTextContent('abc');
    });

    expect(onChunk).toHaveBeenCalledWith('a');
    expect(onChunk).toHaveBeenCalledWith('ab');
    expect(onChunk).toHaveBeenCalledWith('abc');
  });

  it('sets data-ov-streaming to true while streaming', async () => {
    // Use a stream that we can control timing on
    let resolve: () => void;
    const gate = new Promise<void>(r => { resolve = r; });

    async function* controlledStream(): AsyncGenerator<string> {
      yield 'first ';
      await gate;
      yield 'second';
    }

    renderAI(<StreamingText stream={controlledStream()} data-testid="st" />);

    await waitFor(() => {
      expect(screen.getByTestId('st')).toHaveTextContent('first');
    });

    // Still streaming
    expect(screen.getByTestId('st')).toHaveAttribute('data-ov-streaming', 'true');

    // Complete the stream
    resolve!();

    await waitFor(() => {
      expect(screen.getByTestId('st')).toHaveAttribute('data-ov-streaming', 'false');
    });
  });
});
