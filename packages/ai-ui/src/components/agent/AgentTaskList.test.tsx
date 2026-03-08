import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { AgentTaskList, type AgentTask } from './AgentTaskList';

const tasks: AgentTask[] = [
  { id: '1', label: 'Read files', status: 'complete', detail: '3 files' },
  { id: '2', label: 'Analyze code', status: 'running' },
  { id: '3', label: 'Generate output', status: 'idle' },
];

describe('AgentTaskList', () => {
  it('renders all tasks', () => {
    renderAI(<AgentTaskList tasks={tasks} />);
    expect(screen.getByText('Read files')).toBeInTheDocument();
    expect(screen.getByText('Analyze code')).toBeInTheDocument();
    expect(screen.getByText('Generate output')).toBeInTheDocument();
  });

  it('shows task details', () => {
    renderAI(<AgentTaskList tasks={tasks} />);
    expect(screen.getByText('3 files')).toBeInTheDocument();
  });

  it('returns null for empty tasks', () => {
    const { container } = renderAI(<AgentTaskList tasks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('has role list', () => {
    renderAI(<AgentTaskList tasks={tasks} data-testid="atl" />);
    expect(screen.getByTestId('atl')).toHaveAttribute('role', 'list');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AgentTaskList ref={ref} tasks={tasks} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<AgentTaskList tasks={tasks} className="custom" data-testid="atl" />);
    expect(screen.getByTestId('atl').className).toContain('custom');
  });
});
