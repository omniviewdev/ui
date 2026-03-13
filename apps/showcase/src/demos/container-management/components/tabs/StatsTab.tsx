import { Card, Meter } from '@omniview/base-ui';
import {
  LuCpu,
  LuMemoryStick,
  LuNetwork,
  LuHardDrive,
} from 'react-icons/lu';
import type { ContainerDetail } from '../../types';
import styles from './StatsTab.module.css';

export interface StatsTabProps {
  container: ContainerDetail;
}

function SparkBar({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className={styles.sparkBar}>
      {values.map((v, i) => (
        <div
          key={i}
          className={styles.sparkBarItem}
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            opacity: 0.6 + (i / values.length) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

export function StatsTab({ container }: StatsTabProps) {
  const { stats } = container;
  const latestCpu = stats.cpuHistory[stats.cpuHistory.length - 1] ?? 0;
  const latestMem = stats.memoryHistory[stats.memoryHistory.length - 1] ?? 0;
  const memMB = Math.round((latestMem / 100) * container.memoryLimit);

  return (
    <div className={styles.root}>
      <Card.Group columns={2} gap="md">
        {/* CPU Card */}
        <Card elevation={1}>
          <Card.Header>
            <Card.Title>
              <span className={styles.cardTitleInner}>
                <LuCpu aria-hidden />
                CPU Usage
              </span>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Stat mono>
              <span className={styles.statValue}>{latestCpu.toFixed(1)}%</span>
            </Card.Stat>
            <Meter
              value={latestCpu}
              min={0}
              max={100}
              high={80}
              optimum={30}
              size="md"
              aria-label={`CPU: ${latestCpu.toFixed(1)}%`}
            />
            <SparkBar values={stats.cpuHistory} color="var(--ov-color-brand-500)" />
            <Card.KeyValue label="Avg (20s)">
              {(stats.cpuHistory.reduce((a, b) => a + b, 0) / stats.cpuHistory.length).toFixed(1)}%
            </Card.KeyValue>
            <Card.KeyValue label="PIDs">
              {stats.pids}
            </Card.KeyValue>
          </Card.Body>
        </Card>

        {/* Memory Card */}
        <Card elevation={1}>
          <Card.Header>
            <Card.Title>
              <span className={styles.cardTitleInner}>
                <LuMemoryStick aria-hidden />
                Memory Usage
              </span>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Stat mono>
              <span className={styles.statValue}>{memMB} MB</span>
            </Card.Stat>
            <Meter
              value={latestMem}
              min={0}
              max={100}
              high={85}
              optimum={50}
              size="md"
              aria-label={`Memory: ${memMB} MB / ${container.memoryLimit} MB`}
            />
            <SparkBar values={stats.memoryHistory} color="var(--ov-color-success-500)" />
            <Card.KeyValue label="Limit">
              {container.memoryLimit} MB
            </Card.KeyValue>
            <Card.KeyValue label="Usage">
              {latestMem.toFixed(1)}%
            </Card.KeyValue>
          </Card.Body>
        </Card>

        {/* Network Card */}
        <Card elevation={1}>
          <Card.Header>
            <Card.Title>
              <span className={styles.cardTitleInner}>
                <LuNetwork aria-hidden />
                Network I/O
              </span>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.KeyValue label="Received">
              {stats.networkRx}
            </Card.KeyValue>
            <Card.KeyValue label="Transmitted">
              {stats.networkTx}
            </Card.KeyValue>
            <Card.KeyValue label="Network">
              {container.network}
            </Card.KeyValue>
          </Card.Body>
        </Card>

        {/* Disk Card */}
        <Card elevation={1}>
          <Card.Header>
            <Card.Title>
              <span className={styles.cardTitleInner}>
                <LuHardDrive aria-hidden />
                Disk I/O
              </span>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.KeyValue label="Read">
              {stats.diskRead}
            </Card.KeyValue>
            <Card.KeyValue label="Written">
              {stats.diskWrite}
            </Card.KeyValue>
            <Card.KeyValue label="Total Size">
              {container.disk}
            </Card.KeyValue>
          </Card.Body>
        </Card>
      </Card.Group>
    </div>
  );
}
