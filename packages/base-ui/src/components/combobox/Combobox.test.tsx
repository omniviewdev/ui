import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Combobox } from './Combobox';

interface Runtime {
  id: string;
  label: string;
}

const runtimes: Runtime[] = [
  { id: 'local', label: 'Local Runtime' },
  { id: 'docker', label: 'Docker Runtime' },
];

describe('Combobox', () => {
  it('renders themed input and list items', () => {
    renderWithTheme(
      <Combobox.Root
        defaultOpen
        color="brand"
        size="sm"
        variant="outline"
        itemToStringLabel={(item: Runtime) => item.label}
        itemToStringValue={(item: Runtime) => item.id}
        items={runtimes}
      >
        <Combobox.Input placeholder="Select runtime" />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Popup>
              <Combobox.List>
                {(runtime: Runtime) => (
                  <Combobox.Item key={runtime.id} value={runtime}>
                    {runtime.label}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>,
    );

    const input = screen.getByPlaceholderText('Select runtime');
    expect(input).toHaveAttribute('data-ov-color', 'brand');
    expect(input).toHaveAttribute('data-ov-size', 'sm');
    expect(input).toHaveAttribute('data-ov-variant', 'outline');

    expect(screen.getByText('Local Runtime')).toBeInTheDocument();
  });
});
