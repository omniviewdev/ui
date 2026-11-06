import { useEffect } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test/render';
import { CapacityBar } from './CapacityBar';
import { Gauge } from './Gauge';
import { MetricPanel } from './MetricPanel';
import { MetricValue } from './MetricValue';
import { RankedBars } from './RankedBars';
import { SloSummary } from './SloSummary';

const numberUnit = { kind: 'number' } as const;

describe('metric scalars', () => {
  it('preserves panel content during refresh but removes it when access is denied', () => {
    const mounted = vi.fn();
    function Content() {
      useEffect(() => {
        mounted();
      }, []);
      return <input aria-label="Inspection" defaultValue="retained" />;
    }
    const details = { content: <span>private identity labels</span> };
    const { rerender } = renderWithTheme(
      <MetricPanel title="Load" details={details}>
        <Content />
      </MetricPanel>,
    );
    const input = screen.getByRole('textbox');
    rerender(
      <MetricPanel
        title="Load"
        details={details}
        state={{
          kind: 'data',
          updating: true,
          notice: { tone: 'warning', label: 'Partial response' },
        }}
      >
        <Content />
      </MetricPanel>,
    );
    expect(screen.getByRole('textbox')).toBe(input);
    expect(screen.getByText('Partial response')).toBeVisible();
    expect(mounted).toHaveBeenCalledTimes(1);
    rerender(
      <MetricPanel title="Load" details={details} state={{ kind: 'denied' }}>
        <Content />
      </MetricPanel>,
    );
    expect(screen.getByText('Access denied')).toBeVisible();
    expect(screen.queryByRole('textbox', { hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByText('private identity labels')).not.toBeInTheDocument();
  });

  it('distinguishes unknown values from valid zero', () => {
    const { rerender } = renderWithTheme(<MetricValue value={null} unit={numberUnit} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    rerender(<MetricValue value={0} unit={numberUnit} />);
    expect(screen.getByText('0')).toBeVisible();
  });

  it('requires genuine gauge bounds and preserves overrange values', () => {
    const { rerender } = renderWithTheme(
      <Gauge label="Load" value={125} min={0} max={100} unit={numberUnit} />,
    );
    expect(screen.getByText('125')).toBeVisible();
    expect(screen.getByText('Above range')).toBeVisible();
    rerender(<Gauge label="Load" value={125} min={100} max={100} unit={numberUnit} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(<Gauge label="Load" value={null} max={Infinity} unit={numberUnit} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not invent capacity percentage without a bound', () => {
    const { rerender } = renderWithTheme(
      <CapacityBar
        label="Usage"
        value={25}
        references={[{ id: 'request', kind: 'line', label: 'Request', value: 10 }]}
        unit={numberUnit}
      />,
    );
    expect(screen.getByText(/Absolute usage/)).toBeVisible();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    rerender(
      <CapacityBar value={150} bound={{ value: 100, kind: 'capacity' }} unit={numberUnit} />,
    );
    expect(screen.getByText('150')).toBeVisible();
    expect(screen.getByText('Above capacity')).toBeVisible();
  });

  it('uses a shared signed ranking scale and selectable stable IDs', () => {
    const select = vi.fn();
    renderWithTheme(
      <RankedBars
        label="Load ranking"
        unit={numberUnit}
        onSelect={select}
        limit={3}
        items={[
          { id: 'missing', label: 'Unknown', value: null },
          { id: 'negative', label: 'Negative', value: -5 },
          { id: 'positive', label: 'Positive', value: 10 },
          { id: 'zero', label: 'Zero', value: 0 },
        ]}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('Positive');
    expect(buttons[2]).toHaveTextContent('-5');
    fireEvent.click(buttons[2]!);
    expect(select).toHaveBeenCalledWith('negative');
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
  });

  it('retains unknown ranking rows without depicting zero', () => {
    renderWithTheme(
      <RankedBars
        label="Ranking"
        unit={numberUnit}
        items={[{ id: 'missing', label: 'Unknown', value: null }]}
      />,
    );
    expect(screen.getByText('No sample')).toBeVisible();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('never derives a budget or observed success from absent data', () => {
    renderWithTheme(
      <SloSummary
        objectiveRatio={0.999}
        observedRatio={null}
        windowLabel="30 days"
        burnRates={[{ id: 'short', label: 'Short burn', value: null }]}
      />,
    );
    expect(screen.queryByRole('img', { name: /Budget remaining/ })).not.toBeInTheDocument();
    expect(screen.getByText('Observed').nextElementSibling).toHaveTextContent('—');
    expect(screen.getByText('Short burn').nextElementSibling).toHaveTextContent('—');
  });
});
