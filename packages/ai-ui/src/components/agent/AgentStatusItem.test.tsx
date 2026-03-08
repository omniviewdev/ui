import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { AgentStatusItem } from './AgentStatusItem';

describe('AgentStatusItem', () => {
  it('renders label', () => {
    renderAI(<AgentStatusItem label="Analyzing code" status="running" />);
    expect(screen.getByText('Analyzing code')).toBeInTheDocument();
  });

  it('applies status data attribute', () => {
    renderAI(<AgentStatusItem label="test" status="complete" data-testid="asi" />);
    expect(screen.getByTestId('asi')).toHaveAttribute('data-ov-status', 'complete');
  });

  it('renders detail', () => {
    renderAI(<AgentStatusItem label="test" status="running" detail="3 files" />);
    expect(screen.getByText('3 files')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AgentStatusItem ref={ref} label="test" status="idle" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<AgentStatusItem label="test" status="idle" className="custom" data-testid="asi" />);
    expect(screen.getByTestId('asi').className).toContain('custom');
  });
});
