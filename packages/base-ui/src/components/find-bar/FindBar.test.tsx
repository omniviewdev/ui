import { createRef } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { FindBar } from './FindBar';

describe('FindBar', () => {
  it('renders when open', () => {
    renderWithTheme(<FindBar open />);
    expect(screen.getByRole('search')).toBeVisible();
  });

  it('does not render when closed', () => {
    renderWithTheme(<FindBar open={false} />);
    expect(screen.queryByRole('search')).not.toBeInTheDocument();
  });

  it('renders themed Input.Control for find field', () => {
    renderWithTheme(<FindBar open />);
    const input = screen.getByPlaceholderText('Find');
    expect(input).toBeVisible();
  });

  it('displays query value in the input', () => {
    renderWithTheme(<FindBar open query="hello" />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('calls onQueryChange', () => {
    const handleChange = vi.fn();
    renderWithTheme(<FindBar open onQueryChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText('Find'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('displays match count with current position', () => {
    renderWithTheme(<FindBar open matchCount={5} currentMatch={2} />);
    expect(screen.getByText('2 of 5')).toBeVisible();
  });

  it('displays match count without current', () => {
    renderWithTheme(<FindBar open matchCount={3} />);
    expect(screen.getByText('3 matches')).toBeVisible();
  });

  it('displays singular match', () => {
    renderWithTheme(<FindBar open matchCount={1} />);
    expect(screen.getByText('1 match')).toBeVisible();
  });

  it('calls onNext on Enter', () => {
    const onNext = vi.fn();
    renderWithTheme(<FindBar open onNext={onNext} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Find'), { key: 'Enter' });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious on Shift+Enter', () => {
    const onPrevious = vi.fn();
    renderWithTheme(<FindBar open onPrevious={onPrevious} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Find'), { key: 'Enter', shiftKey: true });
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) on Escape', () => {
    const onOpenChange = vi.fn();
    renderWithTheme(<FindBar open onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByPlaceholderText('Find'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders themed replace Input.Control when enabled', () => {
    renderWithTheme(<FindBar open replaceEnabled />);
    expect(screen.getByPlaceholderText('Replace')).toBeVisible();
  });

  it('does not render replace row by default', () => {
    renderWithTheme(<FindBar open />);
    expect(screen.queryByPlaceholderText('Replace')).not.toBeInTheDocument();
  });

  it('renders ToggleButton controls for match options', () => {
    renderWithTheme(
      <FindBar
        open
        onCaseSensitiveChange={() => {}}
        onWholeWordChange={() => {}}
        onRegexChange={() => {}}
      />,
    );

    expect(screen.getByLabelText('Match case')).toBeVisible();
    expect(screen.getByLabelText('Match whole word')).toBeVisible();
    expect(screen.getByLabelText('Use regular expression')).toBeVisible();
  });

  it('uses themed IconButton for navigation', () => {
    renderWithTheme(<FindBar open onNext={() => {}} onPrevious={() => {}} />);
    expect(screen.getByLabelText('Previous match')).toBeVisible();
    expect(screen.getByLabelText('Next match')).toBeVisible();
    expect(screen.getByLabelText('Close')).toBeVisible();
  });

  it('toggles case sensitivity via ToggleButton', () => {
    const handleToggle = vi.fn();
    renderWithTheme(
      <FindBar open caseSensitive={false} onCaseSensitiveChange={handleToggle} />,
    );

    fireEvent.click(screen.getByLabelText('Match case'));
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<FindBar ref={ref} open />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(<FindBar open className="custom" />);
    expect(screen.getByRole('search')).toHaveClass('custom');
  });
});
