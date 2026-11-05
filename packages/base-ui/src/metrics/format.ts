import type {
  FormattedMetric,
  MetricFormatOptions,
  MetricTone,
  MetricUnit,
  SeriesColor,
} from './types';

const formatters = new Map<string, Intl.NumberFormat>();
function numberText(value: number, options: MetricFormatOptions, fallback: number): string {
  const requested = options.maximumFractionDigits ?? fallback;
  const digits = Number.isFinite(requested)
    ? Math.max(0, Math.min(20, Math.floor(requested)))
    : fallback;
  const key = `${options.locale ?? ''}:${digits}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(options.locale, { maximumFractionDigits: digits });
    if (formatters.size >= 64) formatters.delete(formatters.keys().next().value!);
    formatters.set(key, formatter);
  }
  return formatter.format(Object.is(value, -0) ? 0 : value);
}
function scaled(value: number, base: number, suffixes: readonly string[]): [number, string] {
  let index = 0;
  while (Math.abs(value) >= base && index < suffixes.length - 1) {
    value /= base;
    index++;
  }
  return [value, suffixes[index]!];
}
/** Inputs stay in their declared base unit; formatting never changes source measurements. */
export function formatMetric(
  value: number | null,
  unit: MetricUnit,
  options: MetricFormatOptions = {},
): FormattedMetric {
  if (value === null || !Number.isFinite(value)) return { value: '—', unit: '' };
  let amount = value;
  let suffix = '';
  let precision = 2;
  switch (unit.kind) {
    case 'cpu': {
      const cores = unit.base === 'millicores' ? value / 1000 : value;
      const milli = Math.abs(cores) < 1;
      amount = milli ? cores * 1000 : cores;
      suffix = milli ? 'm' : 'cores';
      break;
    }
    case 'bytes': {
      [amount, suffix] = scaled(
        value,
        unit.display === 'binary' ? 1024 : 1000,
        unit.display === 'binary'
          ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
          : ['B', 'kB', 'MB', 'GB', 'TB', 'PB'],
      );
      break;
    }
    case 'duration': {
      const seconds = unit.base === 'milliseconds' ? value / 1000 : value;
      const absolute = Math.abs(seconds);
      if (absolute > 0 && absolute < 0.001) {
        amount = seconds * 1e6;
        suffix = 'µs';
      } else if (absolute < 1) {
        amount = seconds * 1000;
        suffix = 'ms';
      } else if (absolute >= 3600) {
        amount = seconds / 3600;
        suffix = 'h';
      } else if (absolute >= 60) {
        amount = seconds / 60;
        suffix = 'min';
      } else {
        amount = seconds;
        suffix = 's';
      }
      break;
    }
    case 'ratio':
      amount *= 100;
      suffix = '%';
      break;
    case 'percent':
      suffix = '%';
      break;
    case 'rate': {
      if (unit.numerator === 'bytes') {
        [amount, suffix] = scaled(value, 1024, ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']);
        suffix += '/s';
      } else {
        [amount, suffix] = scaled(value, 1000, ['', 'k', 'M', 'G', 'T']);
        suffix += '/s';
      }
      break;
    }
    case 'count':
      precision = 0;
      break;
    case 'number':
      break;
  }
  return { value: numberText(amount, options, precision), unit: suffix };
}
export function formatMetricText(
  value: number | null,
  unit: MetricUnit,
  options?: MetricFormatOptions,
): string {
  const result = formatMetric(value, unit, options);
  return result.unit ? `${result.value} ${result.unit}` : result.value;
}
/** Series identity, not position or health, selects a categorical palette entry. */
export function seriesColor(id: string, color?: SeriesColor): string {
  if (color) return `var(--ov-color-chart-${color})`;
  let hash = 2166136261;
  for (let index = 0; index < id.length; index++)
    hash = Math.imul(hash ^ id.charCodeAt(index), 16777619);
  return `var(--ov-color-chart-series-${((hash >>> 0) % 8) + 1})`;
}
export function toneColor(tone: MetricTone = 'neutral'): string {
  return tone === 'neutral' ? 'var(--ov-color-fg-muted)' : `var(--ov-color-${tone})`;
}
