import { useMemo } from 'react';
import {
  Tabs,
  Breadcrumbs,
  IconButton,
  Button,
  StatusDot,
  useToast,
} from '@omniview/base-ui';
import {
  LuArrowLeft,
  LuPlay,
  LuSquare,
  LuRefreshCw,
  LuTrash2,
  LuTerminal,
  LuSearch,
  LuBarChart2,
  LuFolderOpen,
} from 'react-icons/lu';
import { getContainerDetail, containerStatusColor } from '../data';
import type { Container } from '../types';
import { LogsTab } from './tabs/LogsTab';
import { InspectTab } from './tabs/InspectTab';
import { StatsTab } from './tabs/StatsTab';
import { FilesTab } from './tabs/FilesTab';
import styles from './ContainerDetail.module.css';

export interface ContainerDetailProps {
  container: Container;
  onBack: () => void;
}

export function ContainerDetail({ container, onBack }: ContainerDetailProps) {
  const { toast } = useToast();
  const detail = useMemo(() => getContainerDetail(container), [container]);
  const isRunning = container.status === 'running';

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <IconButton
            variant="ghost"
            size="sm"
            dense
            aria-label="Back to container list"
            onClick={onBack}
          >
            <LuArrowLeft />
          </IconButton>

          <Breadcrumbs size="sm">
            <Breadcrumbs.Item onClick={onBack} style={{ cursor: 'pointer' }}>
              Containers
            </Breadcrumbs.Item>
            <Breadcrumbs.Item active>
              {container.name}
            </Breadcrumbs.Item>
          </Breadcrumbs>

          <StatusDot
            status={containerStatusColor(container.status)}
            label={container.status}
            size="sm"
          />
        </div>

        <div className={styles.containerMeta}>
          <span className={styles.metaChip}>{container.id.slice(0, 12)}</span>
          <span className={styles.metaChip}>{container.image}</span>
          {container.ports.slice(0, 2).map((p) => (
            <span key={`${p.host}`} className={styles.metaChip}>
              {p.host}:{p.container}
            </span>
          ))}
        </div>

        <div className={styles.headerRight}>
          <Button
            variant="soft"
            size="sm"
            startDecorator={isRunning ? <LuSquare /> : <LuPlay />}
            onClick={() =>
              toast(`${isRunning ? 'Stopping' : 'Starting'} ${container.name}`, {
                severity: 'info',
              })
            }
          >
            {isRunning ? 'Stop' : 'Start'}
          </Button>
          <Button
            variant="soft"
            size="sm"
            startDecorator={<LuRefreshCw />}
            onClick={() => toast(`Restarting ${container.name}`, { severity: 'info' })}
          >
            Restart
          </Button>
          <IconButton
            variant="ghost"
            size="sm"
            dense
            color="danger"
            aria-label={`Delete ${container.name}`}
            onClick={() => toast(`Deleting ${container.name}`, { severity: 'warning' })}
          >
            <LuTrash2 />
          </IconButton>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root className={styles.tabsRoot} defaultValue="logs">
        <Tabs.List className={styles.tabsList}>
          <Tabs.Tab value="logs">
            <LuTerminal aria-hidden />
            Logs
          </Tabs.Tab>
          <Tabs.Tab value="inspect">
            <LuSearch aria-hidden />
            Inspect
          </Tabs.Tab>
          <Tabs.Tab value="stats">
            <LuBarChart2 aria-hidden />
            Stats
          </Tabs.Tab>
          <Tabs.Tab value="files">
            <LuFolderOpen aria-hidden />
            Files
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Panel value="logs" className={styles.tabPanel}>
          <div className={styles.tabPanelInner}>
            <LogsTab container={detail} />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="inspect" className={styles.tabPanel}>
          <div className={styles.tabPanelInner}>
            <InspectTab container={detail} />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="stats" className={styles.tabPanel}>
          <div className={styles.tabPanelInner}>
            <StatsTab container={detail} />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="files" className={styles.tabPanel}>
          <div className={styles.tabPanelInner}>
            <FilesTab container={detail} />
          </div>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
