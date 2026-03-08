import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import { ChatSuggestions } from './ChatSuggestions';

const suggestions = [
  { label: 'What can you do?', value: 'capabilities' },
  { label: 'Show logs', value: 'logs' },
];

describe('ChatSuggestions', () => {
  it('renders suggestions', () => {
    renderAI(<ChatSuggestions suggestions={suggestions} onSelect={vi.fn()} />);
    expect(screen.getByText('What can you do?')).toBeInTheDocument();
    expect(screen.getByText('Show logs')).toBeInTheDocument();
  });

  it('calls onSelect with value when clicked', async () => {
    const onSelect = vi.fn();
    renderAI(<ChatSuggestions suggestions={suggestions} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Show logs'));
    expect(onSelect).toHaveBeenCalledWith('logs');
  });

  it('renders nothing when suggestions is empty', () => {
    const { container } = renderAI(
      <ChatSuggestions suggestions={[]} onSelect={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ChatSuggestions ref={ref} suggestions={suggestions} onSelect={vi.fn()} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has role list', () => {
    renderAI(
      <ChatSuggestions suggestions={suggestions} onSelect={vi.fn()} data-testid="cs" />,
    );
    expect(screen.getByTestId('cs')).toHaveAttribute('role', 'list');
  });
});
