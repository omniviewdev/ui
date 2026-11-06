import { CapacityBar } from './CapacityBar';
import type { MetricCellProps } from './types';

/**
 * Table scalar with a flexible track and one stable, right-aligned value slot.
 * Number and unit stay adjacent. Narrow cells hide the track before clipping.
 * Two fractional digits bound precision; the title retains the complete value.
 * Loading may omit value and unit until the first sample arrives.
 */
export function MetricCell(props: MetricCellProps) {
  return (
    <CapacityBar
      {...props}
      value={props.value ?? null}
      unit={props.unit ?? { kind: 'number' }}
      variant="cell"
    />
  );
}
