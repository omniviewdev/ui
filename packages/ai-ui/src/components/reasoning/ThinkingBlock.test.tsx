import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { ThinkingBlock } from './ThinkingBlock';

describe('ThinkingBlock', () => {
  it('renders collapsed by default', () => {
    renderAI(<ThinkingBlock content="reasoning text" data-testid="tb" />);
    expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-expanded', 'false');
    expect(screen.queryByText('reasoning text')).not.toBeInTheDocument();
  });

  it('renders expanded when defaultExpanded', () => {
    renderAI(<ThinkingBlock content="reasoning text" defaultExpanded />);
    expect(screen.getByText('reasoning text')).toBeInTheDocument();
  });

  it('toggles on click', async () => {
    renderAI(<ThinkingBlock content="reasoning text" data-testid="tb" />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('reasoning text')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('reasoning text')).not.toBeInTheDocument();
  });

  it('shows streaming indicator', () => {
    renderAI(<ThinkingBlock content="partial" streaming defaultExpanded data-testid="tb" />);
    expect(screen.getByTestId('tb')).toHaveAttribute('data-ov-streaming', 'true');
    expect(screen.getByText('Thinking…')).toBeInTheDocument();
  });

  it('shows duration badge', () => {
    renderAI(<ThinkingBlock content="done" duration={2500} />);
    expect(screen.getByText('2.5s')).toBeInTheDocument();
  });

  it('formats ms duration', () => {
    renderAI(<ThinkingBlock content="done" duration={500} />);
    expect(screen.getByText('500ms')).toBeInTheDocument();
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
});
