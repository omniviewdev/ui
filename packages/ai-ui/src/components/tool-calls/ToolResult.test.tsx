import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { ToolResult } from './ToolResult';

describe('ToolResult', () => {
  it('renders content', () => {
    renderAI(<ToolResult content="File contents here" status="success" />);
    expect(screen.getByText('File contents here')).toBeInTheDocument();
  });

  it('applies status data attribute', () => {
    renderAI(<ToolResult content="err" status="error" data-testid="tr" />);
    expect(screen.getByTestId('tr')).toHaveAttribute('data-ov-status', 'error');
  });

  it('shows expand button when truncated', () => {
    renderAI(
      <ToolResult content="partial..." status="success" truncated onExpand={vi.fn()} />,
    );
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  it('calls onExpand when expand button clicked', async () => {
    const onExpand = vi.fn();
    renderAI(
      <ToolResult content="partial..." status="success" truncated onExpand={onExpand} />,
    );
    await userEvent.click(screen.getByText('Show more'));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('does not show expand button when not truncated', () => {
    renderAI(<ToolResult content="full" status="success" />);
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ToolResult ref={ref} content="test" status="success" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(
      <ToolResult content="test" status="success" className="custom" data-testid="tr" />,
    );
    expect(screen.getByTestId('tr').className).toContain('custom');
  });
});
