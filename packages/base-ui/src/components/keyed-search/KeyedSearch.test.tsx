import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { KeyedSearch, type KeyedSearchProps } from './KeyedSearch';

const fields = [
  { name: 'region', label: 'Location', values: ['us-east-1', 'eu-west-1', 'North America'] },
  { name: 'status', values: ['healthy', 'pending'] },
];
function Controlled({ initial = '', ...props }: Partial<KeyedSearchProps> & { initial?: string }) {
  const [query, setQuery] = useState(initial);
  return <KeyedSearch fields={fields} query={query} onQueryChange={setQuery} {...props} />;
}
function selectAt(input: HTMLInputElement, start: number, end = start) {
  input.setSelectionRange(start, end);
  fireEvent.select(input);
}

describe('KeyedSearch', () => {
  it('automatically suggests keys, then values, without taking native input focus', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'reg');
    expect(screen.getByRole('option', { name: /region:/ })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('region:');
    expect(input).toHaveFocus();
    expect(await screen.findByRole('option', { name: 'us-east-1' })).toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Tab}');
    expect(input).toHaveValue('region:eu-west-1');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('completes old tokens at the caret and preserves all surrounding text', async () => {
    const user = userEvent.setup();
    render(<Controlled initial="api  region:us status:healthy tail" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    selectAt(input, 14);
    expect(await screen.findByRole('option', { name: 'us-east-1' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'us-east-1' }));
    expect(input).toHaveValue('api  region:us-east-1 status:healthy tail');
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(21);
    selectAt(input, input.value.indexOf('healthy'));
    expect(await screen.findByRole('option', { name: 'pending' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'pending' }));
    expect(input).toHaveValue('api  region:us-east-1 status:pending tail');
  });

  it('routes Escape to suggestions first, then forwards result arrows and direct Enter', async () => {
    const user = userEvent.setup();
    const navigation = vi.fn();
    const submit = vi.fn();
    render(<Controlled onKeyDown={navigation} onSubmit={submit} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Escape}');
    expect(navigation).not.toHaveBeenCalled();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(navigation.mock.calls.map(([event]) => event.key)).toEqual(['ArrowDown', 'Enter']);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0]?.[0]).toMatchObject({ source: '' });
  });

  it('submits immediately when free text has no field completions', async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(<Controlled initial="unmatched" onSubmit={submit} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0]?.[0].text[0].value).toBe('unmatched');
  });

  it('lets result navigation prevent onSubmit and preserves Shift+Tab traversal', async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(
      <>
        <button>Previous</button>
        <Controlled
          initial="unmatched"
          onSubmit={submit}
          onKeyDown={(event) => event.preventDefault()}
        />
      </>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Enter}');
    expect(submit).not.toHaveBeenCalled();
    // A consumer that handles only Enter must not interfere with native focus traversal.
    render(
      <>
        <button>Before search</button>
        <Controlled aria-label="Second search" />
      </>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Second search' }));
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Before search' })).toHaveFocus();
  });

  it('keeps composition native and never accepts, navigates or submits during IME', async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    const navigation = vi.fn();
    render(<Controlled initial="region:" onSubmit={submit} onKeyDown={navigation} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    fireEvent.compositionStart(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'region:東', selectionStart: 8, selectionEnd: 8 } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'ArrowDown', keyCode: 229 });
    expect(input).toHaveValue('region:東');
    expect(submit).not.toHaveBeenCalled();
    expect(navigation).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('does not complete or submit disabled and read-only fields', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const submit = vi.fn();
    const { rerender } = render(
      <KeyedSearch
        fields={fields}
        query="region:"
        disabled
        onQueryChange={change}
        onSubmit={submit}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(input).toBeDisabled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(
      <KeyedSearch
        fields={fields}
        query="region:"
        readOnly
        onQueryChange={change}
        onSubmit={submit}
      />,
    );
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('exposes unique ARIA relationships and visibly reports unknown keys and broken quotes', async () => {
    const user = userEvent.setup();
    const parsed = vi.fn();
    render(
      <>
        <Controlled
          aria-label="First"
          onParsedQueryChange={parsed}
          initial={'unknown:x region:"unfinished'}
        />
        <Controlled aria-label="Second" />
      </>,
    );
    const first = screen.getByRole('combobox', { name: 'First' });
    expect(first).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Unknown field “unknown”.')).toBeVisible();
    expect(screen.getByText('Unclosed quote. Add a matching closing quote.')).toBeVisible();
    expect(parsed.mock.calls.at(-1)?.[0].filters).toHaveLength(2);
    await user.click(screen.getByRole('combobox', { name: 'Second' }));
    const second = screen.getByRole('combobox', { name: 'Second' });
    const list = screen.getByRole('listbox');
    expect(second).toHaveAttribute('aria-controls', list.id);
    expect(document.getElementById(second.getAttribute('aria-activedescendant')!)).toHaveAttribute(
      'role',
      'option',
    );
    expect(first.id).not.toBe(second.id);
    expect(screen.getAllByRole('status', { hidden: true })).toHaveLength(2);
  });

  it('dismisses on outside pointer and focus changes without stealing focus', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Controlled />
        <button>Outside</button>
      </>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  });

  it('keeps selection native, synchronizes highlight scrolling and disables browser rewriting', async () => {
    const user = userEvent.setup();
    const query = 'region:"North America" status:healthy ' + 'long-resource-name/'.repeat(20);
    const { container } = render(<Controlled initial={query} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await user.click(input);
    selectAt(input, 0, 6);
    expect(input.selectionEnd).toBe(6);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    const overlay = container.querySelector<HTMLElement>('[data-ov-keyed-search-highlight]')!;
    expect(overlay.textContent).toBe(query);
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    input.scrollLeft = 150;
    fireEvent.scroll(input);
    expect(overlay.scrollLeft).toBe(150);
    expect(input).toHaveAttribute('autocapitalize', 'off');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('bounds mounted options and keeps portals in the owning nested theme scope', async () => {
    const user = userEvent.setup();
    const large = [
      { name: 'name', values: Array.from({ length: 10_000 }, (_, index) => `resource-${index}`) },
    ];
    render(
      <div data-ov-theme="solarized-light">
        <Controlled initial="name:" fields={large} maxSuggestions={8} />
      </div>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(8);
    expect(screen.getByRole('listbox').closest('[data-ov-theme]')).toHaveAttribute(
      'data-ov-theme',
      'solarized-light',
    );
  });
  it('exposes only the focused search suggestions while the previous popup exits', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Controlled aria-label="Region search" initial="region:" />
        <Controlled aria-label="Status search" initial="status:" />
      </>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Region search' }));
    expect(await screen.findByRole('option', { name: 'us-east-1' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Status search' }));
    const current = await screen.findByRole('listbox');
    expect(screen.getByRole('combobox', { name: 'Status search' })).toHaveAttribute(
      'aria-controls',
      current.id,
    );
    expect(screen.getByRole('option', { name: 'healthy' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'us-east-1' })).not.toBeInTheDocument();
  });
});
