import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { VisualizationPanel, VisualizationFields } from './Visualization';
import {
  VisualizationBindingEditor,
  type VisualizationBindings,
} from './VisualizationBindingEditor';

describe('VisualizationPanel', () => {
  it.each(['empty', 'error', 'unavailable', 'denied'] as const)(
    'explains %s without mounting protected or failed content',
    (status) => {
      const content = vi.fn(() => <p>Private data</p>);
      function Content() {
        return content();
      }
      renderWithTheme(
        <VisualizationPanel
          title="Inventory"
          status={status}
          description="Host supplied reason"
          detail="Safe diagnostic"
        >
          <Content />
        </VisualizationPanel>,
      );
      expect(screen.queryByText('Private data')).not.toBeInTheDocument();
      expect(content).not.toHaveBeenCalled();
      expect(screen.getByText('Host supplied reason')).toBeInTheDocument();
      expect(screen.getByText('Safe diagnostic')).toBeInTheDocument();
    },
  );

  it('mounts only ready content and marks loading as busy', () => {
    const { rerender } = renderWithTheme(
      <VisualizationPanel title="Inventory" status="loading">
        <p>Values</p>
      </VisualizationPanel>,
    );
    expect(screen.getByRole('region', { name: 'Inventory' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Values')).not.toBeInTheDocument();
    rerender(
      <VisualizationPanel title="Inventory" status="ready">
        <p>Values</p>
      </VisualizationPanel>,
    );
    expect(screen.getByText('Values')).toBeInTheDocument();
  });

  it('renders prepared nested scalar, array and map values without evaluating field paths', () => {
    renderWithTheme(
      <VisualizationFields
        presentation="key-value"
        fields={[
          { id: 'count', label: 'Count', value: { status: 'ready', value: '9007199254740993' } },
          {
            id: 'tags',
            label: 'Tags',
            value: { status: 'ready', value: ['green', { zone: 'eu.1' }] },
          },
          {
            id: 'absent',
            label: 'Absent',
            value: { status: 'missing', message: 'Field not present' },
          },
          {
            id: 'invalid',
            label: 'Invalid',
            value: { status: 'type-error', message: 'Expected integer' },
          },
        ]}
      />,
    );
    expect(screen.getByText('9007199254740993')).toBeInTheDocument();
    expect(screen.getByText('green')).toBeInTheDocument();
    expect(screen.getByText('zone')).toBeInTheDocument();
    expect(screen.getByText('eu.1')).toBeInTheDocument();
    expect(screen.getByText('Field not present')).toBeInTheDocument();
    expect(screen.getByText('Expected integer')).toBeInTheDocument();
  });
});

describe('VisualizationBindingEditor', () => {
  it('preserves unavailable bindings until an explicit user edit and exposes host validation', async () => {
    const user = userEvent.setup();
    function Example() {
      const [value, setValue] = useState<VisualizationBindings>({ primary: 'removed.field' });
      return (
        <>
          <VisualizationBindingEditor
            slots={[{ id: 'primary', label: 'Primary field', required: true }]}
            fields={[
              { id: 'opaque:name', label: 'Name', type: 'string' },
              { id: 'secret', label: 'Secret', type: 'string', disabledReason: 'Not allowed' },
            ]}
            value={value}
            onChange={setValue}
            diagnostics={[{ slotId: 'primary', message: 'Schema changed', severity: 'error' }]}
          />
          <output>{value.primary}</output>
        </>
      );
    }
    renderWithTheme(<Example />);
    expect(screen.getByText('Schema changed')).toBeInTheDocument();
    expect(screen.getByText('removed.field', { selector: 'output' })).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: /Primary field/ }));
    expect(await screen.findByRole('option', { name: /Secret/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.click(screen.getByRole('option', { name: /Name/ }));
    expect(screen.getByText('opaque:name', { selector: 'output' })).toBeInTheDocument();
  });

  it('clears an optional binding only through its explicit clear control', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <VisualizationBindingEditor
        slots={[{ id: 'subtitle', label: 'Subtitle' }]}
        fields={[{ id: 'name', label: 'Name', type: 'string' }]}
        value={{ subtitle: 'name' }}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear Subtitle' }));
    expect(onChange).toHaveBeenCalledWith({ subtitle: undefined });
  });
});
