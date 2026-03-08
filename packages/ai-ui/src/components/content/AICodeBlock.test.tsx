import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { AICodeBlock } from './AICodeBlock';

describe('AICodeBlock', () => {
  it('renders code content', () => {
    renderAI(<AICodeBlock code="const x = 1;" data-testid="cb" />);
    expect(screen.getByTestId('cb')).toHaveTextContent('const x = 1;');
  });

  it('renders filename header', () => {
    renderAI(<AICodeBlock code="test" filename="index.ts" />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  it('renders language when no filename', () => {
    renderAI(<AICodeBlock code="test" language="typescript" />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('applies language data attribute', () => {
    renderAI(<AICodeBlock code="test" language="python" data-testid="cb" />);
    expect(screen.getByTestId('cb')).toHaveAttribute('data-language', 'python');
  });

  it('shows line numbers when enabled', () => {
    renderAI(
      <AICodeBlock code={'line1\nline2\nline3'} showLineNumbers data-testid="cb" />,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders copy button', () => {
    renderAI(<AICodeBlock code="test" language="js" />);
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('renders custom actions', () => {
    renderAI(
      <AICodeBlock
        code="test"
        language="js"
        actions={<button data-testid="apply">Apply</button>}
      />,
    );
    expect(screen.getByTestId('apply')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AICodeBlock ref={ref} code="test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<AICodeBlock code="test" className="custom" data-testid="cb" />);
    expect(screen.getByTestId('cb').className).toContain('custom');
  });
});
