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

  it('expands to show arguments', async () => {
    const args = { path: '/test.txt', encoding: 'utf-8' };
    renderAI(<ToolCall name="read_file" status="success" arguments={args} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/\/test\.txt/)).toBeInTheDocument();
  });

  it('toggles collapsed/expanded', async () => {
    const args = { path: '/test.txt' };
    renderAI(<ToolCall name="test" status="success" arguments={args} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/\/test\.txt/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(/\/test\.txt/)).not.toBeInTheDocument();
  });

  it('does not expand without arguments', () => {
    renderAI(<ToolCall name="test" status="success" />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
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

  it('renders all status icons', () => {
    const { rerender } = renderAI(<ToolCall name="t" status="pending" data-testid="tc" />);
    expect(screen.getByText('○')).toBeInTheDocument();
    rerender(<ToolCall name="t" status="running" data-testid="tc" />);
    expect(screen.getByText('◌')).toBeInTheDocument();
    rerender(<ToolCall name="t" status="success" data-testid="tc" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
    rerender(<ToolCall name="t" status="error" data-testid="tc" />);
    expect(screen.getByText('✗')).toBeInTheDocument();
  });
});
