import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { ChainOfThought, type ChainOfThoughtStepData } from './ChainOfThought';

const steps: ChainOfThoughtStepData[] = [
  { id: '1', label: 'Analyzing request', content: 'Parsed the input', status: 'complete' },
  { id: '2', label: 'Searching codebase', content: 'Found 3 files', status: 'active' },
  { id: '3', label: 'Generating response', content: '', status: 'pending' },
];

describe('ChainOfThought', () => {
  it('renders all steps', () => {
    renderAI(<ChainOfThought steps={steps} />);
    expect(screen.getByText('Analyzing request')).toBeInTheDocument();
    expect(screen.getByText('Searching codebase')).toBeInTheDocument();
    expect(screen.getByText('Generating response')).toBeInTheDocument();
  });

  it('shows content for non-pending steps', () => {
    renderAI(<ChainOfThought steps={steps} />);
    expect(screen.getByText('Parsed the input')).toBeInTheDocument();
    expect(screen.getByText('Found 3 files')).toBeInTheDocument();
  });

  it('hides content for pending steps', () => {
    const pendingSteps: ChainOfThoughtStepData[] = [
      { id: '1', label: 'Step', content: 'hidden', status: 'pending' },
    ];
    renderAI(<ChainOfThought steps={pendingSteps} />);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('applies status data attributes to steps', () => {
    renderAI(<ChainOfThought steps={steps} data-testid="cot" />);
    const stepElements = screen.getByTestId('cot').querySelectorAll('[data-ov-status]');
    // Steps + icons both have data-ov-status
    expect(stepElements.length).toBeGreaterThanOrEqual(3);
  });

  it('has role list', () => {
    renderAI(<ChainOfThought steps={steps} data-testid="cot" />);
    expect(screen.getByTestId('cot')).toHaveAttribute('role', 'list');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ChainOfThought ref={ref} steps={steps} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<ChainOfThought steps={steps} className="custom" data-testid="cot" />);
    expect(screen.getByTestId('cot').className).toContain('custom');
  });
});
