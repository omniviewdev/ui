export type StatusValue =
  | 'success'
  | 'healthy'
  | 'running'
  | 'ready'
  | 'active'
  | 'complete'
  | 'connected'
  | 'warning'
  | 'degraded'
  | 'slow'
  | 'danger'
  | 'error'
  | 'failed'
  | 'unhealthy'
  | 'critical'
  | 'disconnected'
  | 'info'
  | 'pending'
  | 'waiting'
  | 'building'
  | 'syncing'
  | 'neutral'
  | 'unknown'
  | 'idle'
  | 'stopped';

export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_MAP: Record<string, StatusColor> = {
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
};

/**
 * Maps a semantic status string to a component color.
 * Case-insensitive. Unknown values default to 'neutral'.
 */
export function statusToColor(status: string): StatusColor {
  return STATUS_MAP[status.toLowerCase()] ?? 'neutral';
}
