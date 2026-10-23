import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { ResourceScopePicker } from './ResourceScopePicker';
import { ResourceGroupingControls } from './ResourceGroupingControls';

const targets = [
  {
    id: 'target',
    provider: 'Provider',
    connection: 'Route',
    resourceType: 'Objects',
    dimensions: [
      {
        id: 'project',
        label: 'Project',
        allowAny: true,
        values: [{ id: 'a', label: 'Project A' }],
      },
    ],
  },
];

describe('scope catalog availability', () => {
  it('disables custom checkbox presentation as well as native fieldsets', async () => {
    const onScopeChange = vi.fn();
    const onGroupingChange = vi.fn();
    renderWithTheme(
      <>
        <ResourceScopePicker
          disabled
          targets={targets}
          value={[{ targetId: 'target', dimensions: {} }]}
          onChange={onScopeChange}
        />
        <ResourceGroupingControls
          disabled
          fields={[{ id: 'type', label: 'Type', groupable: true, splittable: true }]}
          value={{ groupBy: [], splitBy: [] }}
          onChange={onGroupingChange}
        />
      </>,
    );
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(checkbox);
    }
    expect(onScopeChange).not.toHaveBeenCalled();
    expect(onGroupingChange).not.toHaveBeenCalled();
  });

  it('preserves unknown dimensions until the user explicitly removes them', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ResourceScopePicker
        targets={targets}
        value={[{ targetId: 'target', dimensions: { removed: ['opaque'] } }]}
        onChange={onChange}
      />,
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText('Unavailable scope dimension: removed. Selection is preserved.'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove scope dimension removed' }));
    expect(onChange).toHaveBeenCalledWith([{ targetId: 'target', dimensions: {} }]);
  });

  it('retains selected scope values when the source becomes denied but permits removing the source', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ResourceScopePicker
        targets={targets.map((target) => ({
          ...target,
          status: 'denied',
          reason: 'Access changed',
        }))}
        value={[{ targetId: 'target', dimensions: { project: ['a'] } }]}
        onChange={onChange}
      />,
    );
    const source = screen.getByRole('checkbox', { name: 'Objects — Route' });
    expect(source).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('checkbox', { name: 'Project A' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await userEvent.click(source);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
