import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Autocomplete } from './Autocomplete';

interface Tag {
  id: string;
  value: string;
}

const tags: Tag[] = [
  { id: '1', value: 'feature' },
  { id: '2', value: 'component: alert dialog' },
];

describe('Autocomplete', () => {
  it('renders themed input and list items', () => {
    renderWithTheme(
      <Autocomplete.Root items={tags} defaultOpen color="brand" size="sm" variant="outline">
        <Autocomplete.Input placeholder="Search tags" />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(tag: Tag) => (
                  <Autocomplete.Item key={tag.id} value={tag}>
                    {tag.value}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>,
    );

    const input = screen.getByPlaceholderText('Search tags');
    expect(input).toHaveAttribute('data-ov-color', 'brand');
    expect(input).toHaveAttribute('data-ov-size', 'sm');
    expect(input).toHaveAttribute('data-ov-variant', 'outline');

    expect(screen.getByText('feature')).toBeInTheDocument();
  });
});
