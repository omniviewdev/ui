import { useMemo } from 'react';
import { LuArrowUp, LuArrowDown } from 'react-icons/lu';
import { Tabs, Progress } from '@omniviewdev/base-ui';
import { formatBytes } from '../data';
import type { Transfer } from '../types';
import styles from './TransferPanel.module.css';

export interface TransferPanelProps {
  transfers: Transfer[];
}

function statusColor(status: Transfer['status']): 'info' | 'danger' | 'success' | 'neutral' {
  switch (status) {
    case 'processing': return 'info';
    case 'failed': return 'danger';
    case 'completed': return 'success';
    default: return 'neutral';
  }
}

function TransferTable({ transfers }: { transfers: Transfer[] }) {
  if (transfers.length === 0) {
    return <div className={styles.empty}>No transfers</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Source</th>
            <th scope="col">Direction</th>
            <th scope="col">Destination</th>
            <th scope="col">Size</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Remaining</th>
            <th scope="col">Speed</th>
            <th scope="col">Progress</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id}>
              <td title={t.source}>{t.source}</td>
              <td>
                <span className={styles.directionIcon} data-dir={t.direction}>
                  {t.direction === 'upload' ? <LuArrowUp size={12} /> : <LuArrowDown size={12} />}
                  {t.direction === 'upload' ? 'Upload' : 'Download'}
                </span>
              </td>
              <td title={t.destination}>{t.destination}</td>
              <td>{formatBytes(t.size)}</td>
              <td>{t.priority}</td>
              <td>
                <span className={styles.statusLabel} data-status={t.status}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
              </td>
              <td>{t.remaining ?? '—'}</td>
              <td>{t.speed ?? '—'}</td>
              <td className={styles.progressCell}>
                <Progress value={t.progress} color={statusColor(t.status)} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TransferPanel({ transfers }: TransferPanelProps) {
  const counts = useMemo(() => ({
    queued: transfers.filter((t) => t.status === 'queued' || t.status === 'processing').length,
    failed: transfers.filter((t) => t.status === 'failed').length,
    completed: transfers.filter((t) => t.status === 'completed').length,
  }), [transfers]);

  const queued = useMemo(() => transfers.filter((t) => t.status === 'queued' || t.status === 'processing'), [transfers]);
  const failed = useMemo(() => transfers.filter((t) => t.status === 'failed'), [transfers]);
  const completed = useMemo(() => transfers.filter((t) => t.status === 'completed'), [transfers]);

  return (
    <div className={styles.root}>
      <Tabs.Root defaultValue="queued" variant="flat" size="sm">
        <Tabs.List className={styles.tabList} aria-label="Transfer status">
          <Tabs.Tab
            value="queued"
            endDecorator={<span className={styles.tabBadge} data-color="queued">{counts.queued}</span>}
          >
            Queued
          </Tabs.Tab>
          <Tabs.Tab
            value="failed"
            endDecorator={<span className={styles.tabBadge} data-color="failed">{counts.failed}</span>}
          >
            Failed Transfers
          </Tabs.Tab>
          <Tabs.Tab
            value="completed"
            endDecorator={<span className={styles.tabBadge} data-color="completed">{counts.completed}</span>}
          >
            Completed Transfers
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Panel value="queued" className={styles.tabPanel}>
          <TransferTable transfers={queued} />
        </Tabs.Panel>
        <Tabs.Panel value="failed" className={styles.tabPanel}>
          <TransferTable transfers={failed} />
        </Tabs.Panel>
        <Tabs.Panel value="completed" className={styles.tabPanel}>
          <TransferTable transfers={completed} />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
