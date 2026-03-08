import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { PermissionBadge } from './PermissionBadge';

describe('PermissionBadge', () => {
  it('renders granted label', () => {
    renderAI(<PermissionBadge level="granted" />);
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  it('renders denied label', () => {
    renderAI(<PermissionBadge level="denied" />);
    expect(screen.getByText('Denied')).toBeInTheDocument();
  });

  it('renders ask label', () => {
    renderAI(<PermissionBadge level="ask" />);
    expect(screen.getByText('Ask')).toBeInTheDocument();
  });

  it('uses custom label', () => {
    renderAI(<PermissionBadge level="granted" label="Full access" />);
    expect(screen.getByText('Full access')).toBeInTheDocument();
    expect(screen.queryByText('Allowed')).not.toBeInTheDocument();
  });

  it('applies level data attribute', () => {
    renderAI(<PermissionBadge level="denied" data-testid="pb" />);
    expect(screen.getByTestId('pb')).toHaveAttribute('data-ov-level', 'denied');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    renderAI(<PermissionBadge ref={ref} level="ask" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('merges className', () => {
    renderAI(<PermissionBadge level="granted" className="custom" data-testid="pb" />);
    expect(screen.getByTestId('pb').className).toContain('custom');
  });
});
