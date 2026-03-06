import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { MultiSelect } from './MultiSelect';

interface RuntimeItem {
  id: string;
  label: string;
  region: string;
}

const runtimeItems: RuntimeItem[] = [
  { id: 'default', label: 'default', region: 'local' },
  { id: 'kube-public', label: 'kube-public', region: 'shared' },
  { id: 'kube-system', label: 'kube-system', region: 'system' },
];

describe('MultiSelect', () => {
  it('opens when clicking the control area', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <MultiSelect
        items={['default', 'kube-public', 'kube-system']}
        label="Namespaces"
        placeholder="All namespaces"
      />,
    );

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    const control = document.querySelector('[data-ov-slot="control"]');
    expect(control).not.toBeNull();

    await user.click(control as HTMLElement);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders themed control and popup items', () => {
    renderWithTheme(
      <MultiSelect
        items={runtimeItems}
        defaultOpen
        defaultValue={[runtimeItems[1]!]}
        getItemLabel={(item) => item.label}
        getItemValue={(item) => item.id}
        renderItemEndDecorator={(item) => item.region}
        label="Namespaces"
        variant="outline"
        color="brand"
        size="sm"
      />,
    );

    const control = document.querySelector('[data-ov-slot="control"]');
    expect(control).not.toBeNull();
    expect(control).toHaveAttribute('data-ov-color', 'brand');
    expect(control).toHaveAttribute('data-ov-size', 'sm');
    expect(control).toHaveAttribute('data-ov-variant', 'outline');

    const option = screen.getByRole('option', { name: /kube-public shared/i });
    expect(option).toHaveAttribute('data-ov-color', 'brand');
    expect(option).toHaveAttribute('data-ov-size', 'sm');
    expect(option).toHaveAttribute('data-ov-variant', 'outline');
    expect(screen.getByText('shared')).toBeInTheDocument();
  });

  it('renders overflow chip count when selected values exceed maxVisibleChips', () => {
    renderWithTheme(
      <MultiSelect
        items={['default', 'kube-public', 'kube-system']}
        defaultValue={['default', 'kube-public', 'kube-system']}
        maxVisibleChips={2}
      />,
    );

    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('clears all selected values from the clear action', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <MultiSelect
        items={['default', 'kube-public', 'kube-system']}
        defaultValue={['default', 'kube-public']}
        placeholder="All namespaces"
        clearButtonLabel="Clear selected namespaces"
      />,
    );

    const clearButton = screen.getByLabelText('Clear selected namespaces');
    await user.click(clearButton);

    expect(screen.getByText('All namespaces')).toBeInTheDocument();
    expect(screen.queryByLabelText('Clear selected namespaces')).not.toBeInTheDocument();
  });
});
