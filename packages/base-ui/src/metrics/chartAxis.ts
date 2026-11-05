export interface MetricAxisScale {
  readonly domain: readonly [number, number];
  readonly ticks: readonly number[];
}

/** Expand automatic domains to readable ticks without changing caller-specified bounds. */
export function metricAxisScale(
  bounds: readonly [number, number],
  explicit = false,
): MetricAxisScale {
  const [minimum, maximum] = bounds;
  const span = maximum - minimum;
  const fallback = { domain: bounds, ticks: [maximum, minimum / 2 + maximum / 2, minimum] };
  if (explicit || !Number.isFinite(span) || span <= 0) return fallback;
  const rawStep = span / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  if (!Number.isFinite(magnitude) || magnitude === 0) return fallback;
  const fraction = rawStep / magnitude;
  const step =
    (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10) *
    magnitude;
  const lower = Math.floor(minimum / step) * step;
  const upper = Math.ceil(maximum / step) * step;
  const count = Math.round((upper - lower) / step);
  if (
    !Number.isFinite(lower) ||
    !Number.isFinite(upper) ||
    !Number.isFinite(upper - lower) ||
    count < 1 ||
    count > 8
  )
    return fallback;
  return {
    domain: [lower, upper],
    ticks: Array.from({ length: count + 1 }, (_, index) => {
      const value = upper - index * step;
      return Math.abs(value) < step * 1e-12 ? 0 : value;
    }),
  };
}
