import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { MultiSelect } from './MultiSelect';

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

  it('applies xs size data attribute to control', () => {
    renderWithTheme(
      <MultiSelect
        items={['default', 'kube-public']}
        size="xs"
      />,
    );

    const control = document.querySelector('[data-ov-slot="control"]');
    expect(control).not.toBeNull();
    expect(control).toHaveAttribute('data-ov-size', 'xs');
  });

  it('applies xl size data attribute to control', () => {
    renderWithTheme(
      <MultiSelect
        items={['default', 'kube-public']}
        size="xl"
      />,
    );

    const control = document.querySelector('[data-ov-slot="control"]');
    expect(control).not.toBeNull();
    expect(control).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery color data attribute to control', () => {
    renderWithTheme(
      <MultiSelect
        items={['default', 'kube-public']}
        color="discovery"
      />,
    );

    const control = document.querySelector('[data-ov-slot="control"]');
    expect(control).not.toBeNull();
    expect(control).toHaveAttribute('data-ov-color', 'discovery');
  });

  it('applies secondary color data attribute to control', () => {
    renderWithTheme(
      <MultiSelect
        items={['default', 'kube-public']}
        color="secondary"
      />,
    );

    const control = document.querySelector('[data-ov-slot="control"]');
    expect(control).not.toBeNull();
    expect(control).toHaveAttribute('data-ov-color', 'secondary');
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
