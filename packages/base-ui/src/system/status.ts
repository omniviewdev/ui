export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_MAP = {
  success: 'success',
  healthy: 'success',
  running: 'success',
  ready: 'success',
  active: 'success',
  complete: 'success',
  connected: 'success',
  warning: 'warning',
  degraded: 'warning',
  slow: 'warning',
  danger: 'danger',
  error: 'danger',
  failed: 'danger',
  unhealthy: 'danger',
  critical: 'danger',
  disconnected: 'danger',
  info: 'info',
  pending: 'info',
  waiting: 'info',
  building: 'info',
  syncing: 'info',
  neutral: 'neutral',
  unknown: 'neutral',
  idle: 'neutral',
  stopped: 'neutral',
} as const satisfies Record<string, StatusColor>;

export type StatusValue = keyof typeof STATUS_MAP;

/**
 * Maps a semantic status string to a component color.
 * Case-insensitive. Unknown values default to 'neutral'.
 */
export function statusToColor(status: string): StatusColor {
  return (STATUS_MAP as Record<string, StatusColor>)[status.toLowerCase()] ?? 'neutral';
}
