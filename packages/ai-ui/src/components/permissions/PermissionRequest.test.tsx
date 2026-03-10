import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { PermissionRequest } from './PermissionRequest';

const defaultProps = {
  tool: 'write_file',
  description: 'Write to a file in the workspace',
  scope: 'workspace',
  onAllow: vi.fn(),
  onDeny: vi.fn(),
};

describe('PermissionRequest', () => {
  it('renders tool name', () => {
    renderAI(<PermissionRequest {...defaultProps} />);
    expect(screen.getByText('write_file')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderAI(<PermissionRequest {...defaultProps} />);
    expect(screen.getByText('Write to a file in the workspace')).toBeInTheDocument();
  });

  it('renders scope', () => {
    renderAI(<PermissionRequest {...defaultProps} />);
    expect(screen.getByText('workspace')).toBeInTheDocument();
  });

  it('calls onAllow when Allow clicked', async () => {
    const onAllow = vi.fn();
    renderAI(<PermissionRequest {...defaultProps} onAllow={onAllow} />);
    await userEvent.click(screen.getByText('Allow'));
    expect(onAllow).toHaveBeenCalledTimes(1);
  });

  it('calls onDeny when Deny clicked', async () => {
    const onDeny = vi.fn();
    renderAI(<PermissionRequest {...defaultProps} onDeny={onDeny} />);
    await userEvent.click(screen.getByText('Deny'));
    expect(onDeny).toHaveBeenCalledTimes(1);
  });

  it('shows Always Allow when onAllowAlways provided', async () => {
    const onAllowAlways = vi.fn();
    renderAI(<PermissionRequest {...defaultProps} onAllowAlways={onAllowAlways} />);
    await userEvent.click(screen.getByText('Always Allow'));
    expect(onAllowAlways).toHaveBeenCalledTimes(1);
  });

  it('hides Always Allow when not provided', () => {
    renderAI(<PermissionRequest {...defaultProps} />);
    expect(screen.queryByText('Always Allow')).not.toBeInTheDocument();
  });

  it('has role alertdialog', () => {
    renderAI(<PermissionRequest {...defaultProps} data-testid="pr" />);
    expect(screen.getByTestId('pr')).toHaveAttribute('role', 'alertdialog');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<PermissionRequest ref={ref} {...defaultProps} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<PermissionRequest {...defaultProps} className="custom" data-testid="pr" />);
    expect(screen.getByTestId('pr').className).toContain('custom');
  });
});
