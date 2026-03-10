import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { AISources, type AISource } from './AISources';

const sources: AISource[] = [
  { id: '1', label: 'README.md', detail: 'line 42' },
  { id: '2', label: 'config.ts', url: '/config.ts' },
];

describe('AISources', () => {
  it('renders sources', () => {
    renderAI(<AISources sources={sources} />);
    expect(screen.getByText('README.md')).toBeInTheDocument();
    expect(screen.getByText('config.ts')).toBeInTheDocument();
  });

  it('shows detail', () => {
    renderAI(<AISources sources={sources} />);
    expect(screen.getByText('line 42')).toBeInTheDocument();
  });

  it('calls onNavigate with source', async () => {
    const onNavigate = vi.fn();
    renderAI(<AISources sources={sources} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText('README.md'));
    expect(onNavigate).toHaveBeenCalledWith(sources[0]);
  });

  it('returns null for empty sources', () => {
    const { container } = renderAI(<AISources sources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AISources ref={ref} sources={sources} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
