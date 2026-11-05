import { useMemo } from 'react';
import type { StackedTimeSeriesChartProps } from './types';
import { stackFrame } from './seriesGeometry';
import { TimePlot } from './TimeSeriesChart';

export function StackedTimeSeriesChart({ frame, ...props }: StackedTimeSeriesChartProps) {
  const stacked = useMemo(
    () => stackFrame(frame, props.hiddenSeriesIds),
    [frame, props.hiddenSeriesIds],
  );
  const series = useMemo(
    () =>
      frame.series.map(
        (item) => stacked.series.find((s) => s.id === item.id) ?? { ...item, points: [] },
      ),
    [frame, stacked],
  );
  return <TimePlot {...props} series={series} bases={stacked.bases} mode="area" />;
}
