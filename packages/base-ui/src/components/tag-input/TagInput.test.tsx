import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('renders with initial tags', () => {
    renderWithTheme(<TagInput value={['alpha', 'beta']} onChange={() => {}} />);

    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('creates tag on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TagInput value={[]} onChange={onChange} placeholder="Add tags" />);

    const input = screen.getByPlaceholderText('Add tags');
    await user.type(input, 'react{Enter}');

    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('removes tag on x click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TagInput value={['alpha', 'beta']} onChange={onChange} />);

    const removeButton = screen.getByRole('button', { name: 'Remove alpha' });
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(['beta']);
  });

  it('backspace removes last tag when input is empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TagInput value={['alpha', 'beta']} onChange={onChange} placeholder="Add tags" />,
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledWith(['alpha']);
  });

  it('prevents duplicate tags by default', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TagInput value={['alpha']} onChange={onChange} placeholder="Add tags" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'alpha{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows duplicates when allowDuplicates is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TagInput value={['alpha']} onChange={onChange} allowDuplicates placeholder="Add tags" />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'alpha{Enter}');

    expect(onChange).toHaveBeenCalledWith(['alpha', 'alpha']);
  });

  it('enforces max limit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TagInput value={['a', 'b']} onChange={onChange} max={2} placeholder="Add tags" />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'c{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('filters invalid tags with validate function', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const validate = (tag: string) => tag.length >= 3;

    renderWithTheme(
      <TagInput value={[]} onChange={onChange} validate={validate} placeholder="Add tags" />,
    );

    const input = screen.getByPlaceholderText('Add tags');
    await user.type(input, 'ab{Enter}');
    expect(onChange).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, 'abc{Enter}');
    expect(onChange).toHaveBeenCalledWith(['abc']);
  });

  it('splits pasted text by delimiter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<TagInput value={[]} onChange={onChange} placeholder="Add tags" />);

    const input = screen.getByPlaceholderText('Add tags');
    await user.click(input);
    await user.paste('foo,bar,baz');

    expect(onChange).toHaveBeenCalledWith(['foo', 'bar', 'baz']);
  });

  it('disables interaction when disabled', () => {
    renderWithTheme(
      <TagInput value={['alpha']} onChange={() => {}} disabled placeholder="Add tags" />,
    );

    const container = screen.getByText('alpha').closest('[data-ov-disabled]');
    expect(container).toHaveAttribute('data-ov-disabled', 'true');

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    const removeButton = screen.getByRole('button', { name: 'Remove alpha' });
    expect(removeButton).toBeDisabled();
  });

  it('shows placeholder when no tags and input is empty', () => {
    renderWithTheme(<TagInput value={[]} onChange={() => {}} placeholder="Type here..." />);

    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('hides placeholder when tags exist', () => {
    renderWithTheme(<TagInput value={['tag1']} onChange={() => {}} placeholder="Type here..." />);

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('placeholder');
  });

  it('merges className onto root', () => {
    const { container } = renderWithTheme(
      <TagInput value={[]} onChange={() => {}} className="custom-class" />,
    );

    const root = container.firstChild as HTMLElement;
    expect(root.classList.contains('custom-class')).toBe(true);
  });

  it('forwards ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();

    renderWithTheme(<TagInput ref={ref} value={[]} onChange={() => {}} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies data-ov-size attribute', () => {
    const { container } = renderWithTheme(<TagInput value={[]} onChange={() => {}} size="sm" />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-ov-size', 'sm');
  });

  it('creates tag on delimiter key press', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <TagInput value={[]} onChange={onChange} delimiter="," placeholder="Add tags" />,
    );

    const input = screen.getByPlaceholderText('Add tags');
    await user.type(input, 'hello,');

    expect(onChange).toHaveBeenCalledWith(['hello']);
  });

  it('renders xs and xl sizes', () => {
    const { container, rerender } = renderWithTheme(
      <TagInput value={[]} onChange={() => {}} size="xs" />,
    );
    expect(container.firstChild as HTMLElement).toHaveAttribute('data-ov-size', 'xs');

    rerender(<TagInput value={[]} onChange={() => {}} size="xl" />);
    expect(container.firstChild as HTMLElement).toHaveAttribute('data-ov-size', 'xl');
  });
});
