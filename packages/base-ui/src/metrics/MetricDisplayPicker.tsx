import {
  LuActivity,
  LuChartArea,
  LuChartBar,
  LuChartColumn,
  LuChartLine,
  LuChartNoAxesCombined,
  LuCheck,
  LuChevronDown,
  LuGauge,
  LuGrid2X2,
  LuHash,
  LuLayers,
  LuListOrdered,
  LuTarget,
} from 'react-icons/lu';
import { Button } from '../components/button';
import { Menu } from '../components/menu';
import { cn } from '../system/classnames';
import type { MetricDisplay, MetricDisplayPickerProps } from './types';
import styles from './Controls.module.css';

const displayIcons: Record<MetricDisplay, typeof LuChartLine> = {
  line: LuChartLine,
  area: LuChartArea,
  'sample-bars': LuChartColumn,
  stat: LuHash,
  capacity: LuChartBar,
  gauge: LuGauge,
  stacked: LuLayers,
  timeline: LuActivity,
  histogram: LuChartColumn,
  heatmap: LuGrid2X2,
  ranking: LuListOrdered,
  'small-multiples': LuGrid2X2,
  slo: LuTarget,
};

export function MetricDisplayPicker({
  value,
  options,
  onChange,
  label = 'Display',
  className,
  presentation = 'segmented',
}: MetricDisplayPickerProps) {
  if (presentation === 'segmented') {
    return (
      <div className={cn(styles.displayPicker, className)} role="group" aria-label={label}>
        {options.map((option) => {
          const Icon = displayIcons[option.value];
          const description = option.reason ? `${option.label}: ${option.reason}` : option.label;
          return (
            <span key={option.value} className={styles.displayOption} title={description}>
              <Button
                className={styles.displayButton}
                size="sm"
                variant="ghost"
                color="neutral"
                aria-label={description}
                aria-pressed={option.value === value}
                disabled={option.disabled}
                onClick={() => onChange(option.value)}
              >
                <Icon aria-hidden="true" />
              </Button>
            </span>
          );
        })}
      </div>
    );
  }
  return (
    <Menu.Root size="sm" variant="ghost" color="neutral">
      <Menu.Trigger
        className={className}
        aria-label={`${label}: ${options.find((option) => option.value === value)?.label ?? value}`}
      >
        <LuChartNoAxesCombined />
        {options.find((option) => option.value === value)?.label ?? label}
        <LuChevronDown />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={4}>
          <Menu.Popup>
            <Menu.Group>
              <Menu.GroupLabel>{label}</Menu.GroupLabel>
              {options.map((option) => (
                <Menu.Item
                  key={option.value}
                  disabled={option.disabled}
                  onClick={() => onChange(option.value)}
                  startDecorator={option.value === value ? <LuCheck /> : undefined}
                >
                  <span className={styles.option}>
                    {option.label}
                    {option.reason && <small>{option.reason}</small>}
                  </span>
                </Menu.Item>
              ))}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
