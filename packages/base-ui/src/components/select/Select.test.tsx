import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Select } from './Select';

describe('Select', () => {
  it('renders themed trigger and popup items', async () => {
    await act(async () => {
      renderWithTheme(
        <Select.Root open defaultValue="docker" color="brand" size="sm" variant="outline">
          <Select.Trigger data-testid="select-trigger">
            <Select.Value placeholder="Select runtime" />
            <Select.Icon>v</Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="local">
                    <Select.ItemText>Local Runtime</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="docker">
                    <Select.ItemText>Docker Runtime</Select.ItemText>
                  </Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>,
      );
    });

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveAttribute('data-ov-color', 'brand');
    expect(trigger).toHaveAttribute('data-ov-size', 'sm');
    expect(trigger).toHaveAttribute('data-ov-variant', 'outline');

    const item = await screen.findByRole('option', { name: 'Local Runtime' });
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-ov-color', 'brand');
    expect(item).toHaveAttribute('data-ov-size', 'sm');
    expect(item).toHaveAttribute('data-ov-variant', 'outline');
  });

  it('does not render selection indicators by default in single-select mode', async () => {
    await act(async () => {
      renderWithTheme(
        <Select.Root open defaultValue="docker">
          <Select.Trigger>
            <Select.Value placeholder="Select runtime" />
            <Select.Icon>v</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="local">
                    <Select.ItemText>Local Runtime</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="docker">
                    <Select.ItemText>Docker Runtime</Select.ItemText>
                  </Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>,
      );
    });

    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('renders selection indicators by default in multi-select mode', async () => {
    await act(async () => {
      renderWithTheme(
        <Select.Root<string, true> open multiple defaultValue={['docker']}>
          <Select.Trigger>
            <Select.Value placeholder="Select runtimes" />
            <Select.Icon>v</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="local">
                    <Select.ItemText>Local Runtime</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="docker">
                    <Select.ItemText>Docker Runtime</Select.ItemText>
                  </Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>,
      );
    });

    expect(screen.getAllByText('✓').length).toBeGreaterThan(0);
  });
});
