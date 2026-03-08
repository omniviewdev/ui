import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { ToolCallList, type ToolCallListItem } from './ToolCallList';

const calls: ToolCallListItem[] = [
  { id: '1', name: 'read_file', status: 'success', duration: 120 },
  { id: '2', name: 'write_file', status: 'running' },
  { id: '3', name: 'search', status: 'error', result: 'Timeout', resultStatus: 'error' },
];

describe('ToolCallList', () => {
  it('renders all tool calls', () => {
    renderAI(<ToolCallList calls={calls} />);
    expect(screen.getByText('read_file')).toBeInTheDocument();
    expect(screen.getByText('write_file')).toBeInTheDocument();
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('shows duration', () => {
    renderAI(<ToolCallList calls={calls} />);
    expect(screen.getByText('120ms')).toBeInTheDocument();
  });

  it('shows result content', () => {
    renderAI(<ToolCallList calls={calls} />);
    expect(screen.getByText('Timeout')).toBeInTheDocument();
  });

  it('returns null for empty calls', () => {
    const { container } = renderAI(<ToolCallList calls={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('has role list', () => {
    renderAI(<ToolCallList calls={calls} data-testid="tcl" />);
    expect(screen.getByTestId('tcl')).toHaveAttribute('role', 'list');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ToolCallList ref={ref} calls={calls} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<ToolCallList calls={calls} className="custom" data-testid="tcl" />);
    expect(screen.getByTestId('tcl').className).toContain('custom');
  });
});
