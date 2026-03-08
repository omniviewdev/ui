import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { ChatAvatar } from './ChatAvatar';

describe('ChatAvatar', () => {
  it('renders role data attribute', () => {
    renderAI(<ChatAvatar role="user" data-testid="ca" />);
    expect(screen.getByTestId('ca')).toHaveAttribute('data-ov-role', 'user');
  });

  it('renders initials from name', () => {
    renderAI(<ChatAvatar role="user" name="John Doe" data-testid="ca" />);
    expect(screen.getByTestId('ca')).toHaveTextContent('JD');
  });

  it('renders role icon when no name or src', () => {
    renderAI(<ChatAvatar role="assistant" data-testid="ca" />);
    expect(screen.getByTestId('ca')).toHaveTextContent('✦');
  });

  it('renders image when src is provided', () => {
    renderAI(<ChatAvatar role="user" src="test.png" name="Test" data-testid="ca" />);
    const img = screen.getByTestId('ca').querySelector('img');
    expect(img).toHaveAttribute('src', 'test.png');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ChatAvatar ref={ref} role="user" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<ChatAvatar role="user" className="custom" data-testid="ca" />);
    expect(screen.getByTestId('ca').className).toContain('custom');
  });

  it('sets aria-label to name', () => {
    renderAI(<ChatAvatar role="user" name="John" data-testid="ca" />);
    expect(screen.getByTestId('ca')).toHaveAttribute('aria-label', 'John');
  });
});
