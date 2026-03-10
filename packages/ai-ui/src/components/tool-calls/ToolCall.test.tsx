import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { ToolCall } from './ToolCall';

describe('ToolCall', () => {
  it('renders tool name', () => {
    renderAI(<ToolCall name="read_file" status="success" />);
    expect(screen.getByText('read_file')).toBeInTheDocument();
  });

  it('applies status data attribute', () => {
    renderAI(<ToolCall name="test" status="running" data-testid="tc" />);
    expect(screen.getByTestId('tc')).toHaveAttribute('data-ov-status', 'running');
  });

  it('shows duration', () => {
    renderAI(<ToolCall name="test" status="success" duration={1500} />);
    expect(screen.getByText('1.5s')).toBeInTheDocument();
  });

  it('expands to show arguments on click', async () => {
    const args = { path: '/test.txt', encoding: 'utf-8' };
    renderAI(<ToolCall name="read_file" status="success" arguments={args} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/\/test\.txt/)).toBeInTheDocument();
  });

  it('does not expand without arguments or children', () => {
    renderAI(<ToolCall name="test" status="success" />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('renders children (result content) when expanded', async () => {
    renderAI(
      <ToolCall name="kubectl get pods" status="success" arguments={{ ns: 'prod' }}>
        <div>pod-abc Running</div>
      </ToolCall>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('pod-abc Running')).toBeInTheDocument();
  });

  it('renders children without arguments', async () => {
    renderAI(
      <ToolCall name="list_tools" status="success">
        <div>3 tools available</div>
      </ToolCall>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('3 tools available')).toBeInTheDocument();
  });

  it('supports defaultExpanded', () => {
    renderAI(
      <ToolCall name="test" status="success" arguments={{ foo: 'bar' }} defaultExpanded>
        <div>result output</div>
      </ToolCall>,
    );
    expect(screen.getByText('result output')).toBeInTheDocument();
    expect(screen.getByText(/foo/)).toBeInTheDocument();
  });

  it('supports controlled expanded prop', () => {
    const { rerender } = renderAI(
      <ToolCall name="test" status="success" expanded={false}>
        <div>hidden</div>
      </ToolCall>,
    );
    // Content exists in DOM but inside collapsed Collapsible
    rerender(
      <ToolCall name="test" status="success" expanded>
        <div>visible</div>
      </ToolCall>,
    );
    expect(screen.getByText('visible')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ToolCall ref={ref} name="test" status="pending" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<ToolCall name="test" status="pending" className="custom" data-testid="tc" />);
    expect(screen.getByTestId('tc').className).toContain('custom');
  });

  it('renders spinner for running status', () => {
    renderAI(<ToolCall name="t" status="running" data-testid="tc" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders status icons for non-running statuses', () => {
    const { rerender } = renderAI(<ToolCall name="t" status="pending" data-testid="tc" />);
    expect(screen.getByTestId('tc').querySelector('[data-ov-status="pending"] svg')).toBeInTheDocument();
    rerender(<ToolCall name="t" status="success" data-testid="tc" />);
    expect(screen.getByTestId('tc').querySelector('[data-ov-status="success"] svg')).toBeInTheDocument();
    rerender(<ToolCall name="t" status="error" data-testid="tc" />);
    expect(screen.getByTestId('tc').querySelector('[data-ov-status="error"] svg')).toBeInTheDocument();
  });
});
