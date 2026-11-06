import { normalizeReferences, referenceDomain, ReferenceLegend, ReferencePlot } from './references';
import { metricAxisScale } from './chartAxis';
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type { NumericPoint, NumericSeries, TimeSeriesChartProps } from './types';
import { formatMetricText, seriesColor } from './format';
import {
  areaPath,
  linePath,
  lowerBound,
  PLOT_WIDTH,
  samplePoints,
  validDomain,
  validPoints,
  valueDomain,
  xPosition,
  yPosition,
} from './seriesGeometry';
import { MetricLegend } from './MetricLegend';
import { Skeleton } from '../components/skeleton';
import { MetricPanelLoadingContext } from './MetricPanel';
import styles from './TimePlots.module.css';

const EMPTY_IDS: readonly string[] = [];
export function TimeSeriesChart(props: TimeSeriesChartProps) {
  return <TimePlot {...props} />;
}
export function TimePlot({
  series,
  bases,
  unit,
  domain,
  mode = 'line',
  height = 180,
  maxGapMs,
  yDomain,
  references,
  cursorTimeMs,
  onCursorTimeChange,
  selectedRange,
  onSelectedRangeChange,
  hiddenSeriesIds = EMPTY_IDS,
  onHiddenSeriesIdsChange,
  emphasizedSeriesId,
  label,
  className,
  loading: requestedLoading,
}: TimeSeriesChartProps & { bases?: readonly NumericSeries[] }) {
  const panelLoading = useContext(MetricPanelLoadingContext);
  const loading = requestedLoading ?? panelLoading ?? false;
  const container = useRef<HTMLDivElement>(null);
  const anchor = useRef<number | null>(null);
  const [width, setWidth] = useState(PLOT_WIDTH);
  const referenceLegend = useRef<HTMLDivElement>(null);
  const [referenceHeight, setReferenceHeight] = useState(0);
  const [inspection, setInspection] = useState<number | null>(null);
  const [inspectionSource, setInspectionSource] = useState<'pointer' | 'keyboard'>('pointer');
  useEffect(() => {
    const element = container.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next && Number.isFinite(next)) setWidth(Math.max(1, Math.min(4096, Math.round(next))));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const element = referenceLegend.current;
    if (!element) return;
    const measure = () => setReferenceHeight(Math.ceil(element.getBoundingClientRect().height));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [references]);
  const plotHeight = Math.max(
    32,
    (Number.isFinite(height) ? Math.max(50, Math.min(1200, height)) : 180) - 18 - referenceHeight,
  );
  const valid =
    validDomain(domain) &&
    (!yDomain ||
      (Number.isFinite(yDomain[0]) &&
        Number.isFinite(yDomain[1]) &&
        yDomain[1] > yDomain[0] &&
        Number.isFinite(yDomain[1] - yDomain[0])));
  const { startMs, endMs } = domain;
  const normalizedReferences = useMemo(() => normalizeReferences(references), [references]);
  const lower = yDomain?.[0];
  const upper = yDomain?.[1];
  const visible = useMemo(
    () => series.filter((s) => !hiddenSeriesIds.includes(s.id)),
    [series, hiddenSeriesIds],
  );
  const validSeries = useMemo(
    () => new Set(visible.filter((item) => validPoints(item.points))),
    [visible],
  );
  const validBases = useMemo(
    () =>
      new Map(bases?.map((item) => [item.id, { series: item, valid: validPoints(item.points) }])),
    [bases],
  );
  const axis = useMemo(
    () =>
      metricAxisScale(
        referenceDomain(
          valueDomain(
            bases ? [...visible, ...bases] : visible,
            { startMs, endMs },
            lower !== undefined && upper !== undefined ? [lower, upper] : undefined,
          ),
          lower !== undefined && upper !== undefined ? [] : normalizedReferences,
        ),
        lower !== undefined && upper !== undefined,
      ),
    [visible, bases, startMs, endMs, lower, upper, normalizedReferences],
  );
  const bounds = axis.domain;
  const drawable = useMemo(
    () =>
      valid &&
      visible.some(
        (s) =>
          validSeries.has(s) &&
          s.points.some((p) => p.timeMs >= startMs && p.timeMs <= endMs && p.value !== null),
      ),
    [valid, visible, validSeries, startMs, endMs],
  );
  const initialLoading = loading && !drawable;
  const cursor = cursorTimeMs !== undefined ? cursorTimeMs : inspection;
  const activeCursor =
    valid &&
    cursor != null &&
    Number.isFinite(cursor) &&
    cursor >= domain.startMs &&
    cursor <= domain.endMs
      ? cursor
      : null;
  const updateCursor = (time: number | null) => {
    if (cursorTimeMs === undefined) setInspection(time);
    onCursorTimeChange?.(time);
  };
  const timeAt = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return (
      domain.startMs +
      Math.max(0, Math.min(1, (event.clientX - rect.left) / (rect.width || 1))) *
        (domain.endMs - domain.startMs)
    );
  };
  const select = (time: number) => {
    if (anchor.current !== null)
      onSelectedRangeChange?.({
        startMs: Math.min(anchor.current, time),
        endMs: Math.max(anchor.current, time),
      });
  };
  const keyboard = (event: KeyboardEvent<SVGSVGElement>) => {
    if (!valid) return;
    setInspectionSource('keyboard');
    if (event.key === 'Escape') {
      anchor.current = null;
      onSelectedRangeChange?.(null);
      updateCursor(null);
      event.preventDefault();
      return;
    }
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    const current = activeCursor ?? domain.startMs;
    if (event.key === 'Enter') {
      if (anchor.current === null) anchor.current = current;
      else {
        select(current);
        anchor.current = null;
      }
      return;
    }
    let next = event.key === 'Home' ? domain.startMs : event.key === 'End' ? domain.endMs : current;
    if (event.key.startsWith('Arrow')) {
      const forward = event.key === 'ArrowRight';
      let candidate = forward ? Infinity : -Infinity;
      for (const item of visible)
        if (validSeries.has(item)) {
          const index = lowerBound(item.points, current);
          const point =
            item.points[
              forward ? (item.points[index]?.timeMs === current ? index + 1 : index) : index - 1
            ];
          if (point && point.timeMs >= domain.startMs && point.timeMs <= domain.endMs)
            candidate = forward
              ? Math.min(candidate, point.timeMs)
              : Math.max(candidate, point.timeMs);
        }
      next = Number.isFinite(candidate) ? candidate : forward ? domain.endMs : domain.startMs;
    }
    if (event.shiftKey) {
      if (anchor.current === null) anchor.current = current;
      select(next);
    } else anchor.current = null;
    updateCursor(next);
  };
  const geometry = useMemo(() => {
    const domain = { startMs, endMs };
    return (
      valid &&
      visible.map((item) => {
        let points = samplePoints(item.points, domain, width, maxGapMs);
        const base = bases?.find((b) => b.id === item.id);
        let bottom: NumericPoint[];
        if (base) {
          const sampledBase = samplePoints(base.points, domain, width, maxGapMs);
          const times = [...new Set([...points, ...sampledBase].map((p) => p.timeMs))].sort(
            (a, b) => a - b,
          );
          const broken = new Set(
            [...points, ...sampledBase].filter((p) => p.value === null).map((p) => p.timeMs),
          );
          points = times.map((timeMs) => ({
            timeMs,
            value: broken.has(timeMs)
              ? null
              : (item.points[lowerBound(item.points, timeMs)]?.value ?? null),
          }));
          bottom = times.map((timeMs) => ({
            timeMs,
            value: broken.has(timeMs)
              ? null
              : (base.points[lowerBound(base.points, timeMs)]?.value ?? null),
          }));
        } else bottom = points.map((p) => ({ timeMs: p.timeMs, value: 0 }));
        const color = seriesColor(item.id, item.color);
        const opacity = emphasizedSeriesId && emphasizedSeriesId !== item.id ? 0.3 : 1;
        const baseline = yPosition(Math.max(bounds[0], Math.min(bounds[1], 0)), bounds, plotHeight);
        const bars =
          mode === 'sample-bars'
            ? points
                .filter((p) => p.value !== null)
                .map((p) => {
                  const x = xPosition(p.timeMs, domain);
                  const y = yPosition(p.value!, bounds, plotHeight);
                  const half = (PLOT_WIDTH / width) * 0.35;
                  return `M${x - half},${baseline}V${y}H${x + half}V${baseline}Z`;
                })
                .join('')
            : '';
        return (
          <g key={item.id} data-series-id={item.id} opacity={opacity}>
            {mode !== 'sample-bars' && (bases || mode === 'area') && (
              <path
                key="area"
                d={areaPath(points, bottom, domain, bounds, plotHeight, maxGapMs)}
                fill={color}
                fillOpacity={bases ? 0.5 : 0.15}
                stroke="none"
              />
            )}
            <path
              key="line"
              data-metric-path={item.id}
              d={
                mode === 'sample-bars'
                  ? bars
                  : linePath(points, domain, bounds, plotHeight, maxGapMs)
              }
              fill={mode === 'sample-bars' ? color : 'none'}
              stroke={mode === 'sample-bars' ? 'none' : color}
              strokeWidth={1.6}
              strokeDasharray={
                item.lineStyle === 'dashed'
                  ? '6 4'
                  : item.lineStyle === 'dotted'
                    ? '2 3'
                    : undefined
              }
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })
    );
  }, [
    valid,
    visible,
    bases,
    startMs,
    endMs,
    width,
    maxGapMs,
    bounds,
    plotHeight,
    mode,
    emphasizedSeriesId,
  ]);
  const range =
    selectedRange && validDomain(selectedRange) && valid
      ? {
          startMs: Math.max(domain.startMs, selectedRange.startMs),
          endMs: Math.min(domain.endMs, selectedRange.endMs),
        }
      : null;
  const timeLabels = useMemo(
    () =>
      [startMs, startMs + (endMs - startMs) / 2, endMs].map((time) => {
        const date = new Date(time);
        return Number.isFinite(date.getTime())
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '—';
      }),
    [startMs, endMs],
  );
  return (
    <div
      ref={container}
      className={[styles.Chart, className].filter(Boolean).join(' ')}
      aria-busy={loading || undefined}
      data-loading={initialLoading || undefined}
    >
      {panelLoading === undefined && (
        <span className={styles.LoadingStatus} role="status">
          {loading ? (initialLoading ? 'Loading samples…' : 'Updating…') : ''}
        </span>
      )}
      <div className={styles.PlotFrame}>
        <div className={styles.ValueAxis} aria-hidden="true">
          {axis.ticks.map((tick) => (
            <span key={tick}>{formatMetricText(tick, unit)}</span>
          ))}
        </div>
        <svg
          className={styles.Plot}
          preserveAspectRatio="none"
          viewBox={`0 0 ${PLOT_WIDTH} ${plotHeight}`}
          height={plotHeight}
          role="application"
          aria-label={`${label}. Arrow keys inspect samples; Shift and arrows select range; Enter starts or ends selection; Escape clears.`}
          tabIndex={initialLoading ? -1 : 0}
          onKeyDown={keyboard}
          onPointerMove={(event) => {
            setInspectionSource('pointer');
            if (valid) updateCursor(timeAt(event));
          }}
          onPointerLeave={() => {
            if (anchor.current === null) updateCursor(null);
          }}
          onPointerDown={(event) => {
            if (!valid || !onSelectedRangeChange) return;
            anchor.current = timeAt(event);
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerUp={(event) => {
            if (valid) select(timeAt(event));
            anchor.current = null;
          }}
          onPointerCancel={() => {
            anchor.current = null;
          }}
        >
          <title>{label}</title>
          {axis.ticks.map((tick) => (
            <line
              key={tick}
              className={styles.Grid}
              x1={0}
              x2={PLOT_WIDTH}
              y1={yPosition(tick, bounds, plotHeight)}
              y2={yPosition(tick, bounds, plotHeight)}
            />
          ))}
          {valid && (
            <ReferencePlot
              references={normalizedReferences}
              unit={unit}
              domain={bounds}
              width={PLOT_WIDTH}
              height={plotHeight}
            />
          )}
          {geometry}
          {range && range.endMs > range.startMs && (
            <rect
              className={styles.Selection}
              x={xPosition(range.startMs, domain)}
              width={xPosition(range.endMs, domain) - xPosition(range.startMs, domain)}
              y={0}
              height={plotHeight}
            />
          )}
          {activeCursor !== null && (
            <line
              className={styles.Cursor}
              x1={xPosition(activeCursor, domain)}
              x2={xPosition(activeCursor, domain)}
              y1={0}
              y2={plotHeight}
            />
          )}
        </svg>
        {initialLoading ? (
          <Skeleton
            variant="rounded"
            className={styles.LoadingPlot}
            height={plotHeight}
            aria-hidden="true"
          />
        ) : (
          !drawable && <div className={styles.Empty}>No drawable samples</div>
        )}
      </div>
      <div className={styles.Axis} aria-hidden="true">
        {timeLabels.map((time, index) => (
          <span key={index}>{time}</span>
        ))}
      </div>
      <div ref={referenceLegend}>
        <ReferenceLegend references={normalizedReferences} unit={unit} domain={bounds} />
      </div>
      <div
        className={styles.Inspection}
        hidden={activeCursor === null}
        aria-live={inspectionSource === 'keyboard' ? 'polite' : 'off'}
      >
        {activeCursor !== null ? (
          <>
            <time>
              {Number.isFinite(new Date(activeCursor).getTime())
                ? new Date(activeCursor).toLocaleString()
                : `${activeCursor} ms`}
            </time>
            {visible.slice(0, 12).map((item) => {
              const index = validSeries.has(item) ? lowerBound(item.points, activeCursor) : -1;
              const point =
                index >= 0
                  ? item.points[index]?.timeMs === activeCursor
                    ? item.points[index]
                    : item.points[index - 1]
                  : undefined;
              const baseEntry = validBases.get(item.id);
              const base = baseEntry?.series;
              const basePoint =
                point && baseEntry?.valid && base
                  ? base.points[lowerBound(base.points, point.timeMs)]
                  : undefined;
              const value =
                point &&
                point.timeMs >= domain.startMs &&
                (maxGapMs === undefined || activeCursor - point.timeMs <= maxGapMs)
                  ? point.value === null || (base && basePoint?.value == null)
                    ? null
                    : point.value - (basePoint?.value ?? 0)
                  : null;
              return (
                <span key={item.id}>
                  {item.label}: {formatMetricText(value ?? null, unit)}
                </span>
              );
            })}
            <ReferenceLegend
              references={normalizedReferences}
              unit={unit}
              domain={bounds}
              inspection
            />
          </>
        ) : (
          <span>Arrow keys inspect · Shift + arrows select</span>
        )}
      </div>
      {series.length > 1 && (
        <MetricLegend
          items={series}
          hiddenIds={hiddenSeriesIds}
          onHiddenIdsChange={onHiddenSeriesIdsChange}
          emphasizedId={emphasizedSeriesId}
        />
      )}
    </div>
  );
}
