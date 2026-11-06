import { CapacityBar } from './CapacityBar';
import type { MetricCellProps } from './types';

/** Compact table scalar. Only genuine bounds determine the track fill. */
export function MetricCell(props: MetricCellProps) {
  return <CapacityBar {...props} variant="cell" />;
}
