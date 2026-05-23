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

  it('applies xs size data attribute to input', () => {
    renderWithTheme(
      <Autocomplete.Root items={tags} defaultOpen size="xs">
        <Autocomplete.Input placeholder="Search tags xs" />
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

    const input = screen.getByPlaceholderText('Search tags xs');
    expect(input).toHaveAttribute('data-ov-size', 'xs');
  });

  it('applies xl size data attribute to input', () => {
    renderWithTheme(
      <Autocomplete.Root items={tags} defaultOpen size="xl">
        <Autocomplete.Input placeholder="Search tags xl" />
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

    const input = screen.getByPlaceholderText('Search tags xl');
    expect(input).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery color data attribute to input', () => {
    renderWithTheme(
      <Autocomplete.Root items={tags} defaultOpen color="discovery">
        <Autocomplete.Input placeholder="Search tags discovery" />
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

    const input = screen.getByPlaceholderText('Search tags discovery');
    expect(input).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('applies secondary color data attribute to input', () => {
    renderWithTheme(
      <Autocomplete.Root items={tags} defaultOpen color="secondary">
        <Autocomplete.Input placeholder="Search tags secondary" />
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

    const input = screen.getByPlaceholderText('Search tags secondary');
    expect(input).toHaveAttribute('data-ov-color', 'secondary');
  });
});
