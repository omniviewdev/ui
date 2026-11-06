import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test/render';
import { MetricValue } from './MetricValue';
import type { MetricReference } from './types';

const unit = { kind: 'number' } as const;
const references: readonly MetricReference[] = [
  { id: 'zero', kind: 'line', label: 'Zero target', value: 0, source: 'Current configuration' },
  { id: 'range', kind: 'band', label: 'Operating range', from: 10, to: 20 },
  { id: 'missing', kind: 'line', label: 'Unknown limit', value: null },
  { id: 'partial', kind: 'band', label: 'Incomplete range', from: 0 },
  { id: 'invalid', kind: 'line', label: 'Invalid setting', value: Infinity },
];

describe('MetricValue references', () => {
  it('retains inspectable zero configuration and bands without inventing a stat scale', () => {
    const { rerender } = renderWithTheme(
      <MetricValue value={0} unit={unit} references={references} />,
    );
    const legend = screen.getByRole('group', { name: 'Current configuration references' });
    expect(legend).toHaveTextContent('Zero target: 0');
    expect(legend).toHaveTextContent('Operating range: 10 – 20');
    expect(screen.getByTitle('Zero target: 0 (Current configuration)')).toBeVisible();
    expect(legend).not.toHaveTextContent('Current configuration');
    expect(
      screen.queryByText(/Unknown limit|Incomplete range|Invalid setting/),
    ).not.toBeInTheDocument();
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    rerender(<MetricValue value={null} unit={unit} references={references} />);
    expect(screen.getByText('—')).toBeVisible();
    expect(screen.getByText('Zero target: 0')).toBeVisible();
  });

  it('adds no reference DOM for absent or invalid references and retains the scalar node during updates', () => {
    const { container, rerender } = renderWithTheme(<MetricValue value={4} unit={unit} />);
    const scalar = container.querySelector('[data-size]')!;
    const parent = scalar.parentElement!;
    const initialChildren = parent.childElementCount;
    rerender(
      <MetricValue
        value={4}
        unit={unit}
        references={[{ id: 'missing', kind: 'line', label: 'Missing' }]}
      />,
    );
    expect(parent.childElementCount).toBe(initialChildren);
    expect(
      screen.queryByRole('group', { name: 'Current configuration references' }),
    ).not.toBeInTheDocument();
    rerender(<MetricValue value={4} unit={unit} references={references} />);
    expect(container.querySelector('[data-size]')).toBe(scalar);
    expect(parent.childElementCount).toBe(initialChildren + 1);
    expect(scalar.nextElementSibling).toHaveAccessibleName('Current configuration references');
    rerender(<MetricValue value={5} unit={unit} references={[]} />);
    expect(container.querySelector('[data-size]')).toBe(scalar);
    expect(scalar).toHaveTextContent('5');
    expect(parent.childElementCount).toBe(initialChildren);
  });
});
