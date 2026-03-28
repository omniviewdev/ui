import '@omniviewdev/editors/styles.css';

import { useState, useCallback } from 'react';
import { StatusBar } from '@omniviewdev/base-ui';
import {
  LuContainer,
  LuPlay,
  LuSquare,
  LuPause,
  LuRefreshCw,
  LuCircleAlert,
} from 'react-icons/lu';
import { ContainerList } from './components/ContainerList';
import { ContainerDetail } from './components/ContainerDetail';
import { containers, clusterStats } from './data';
import type { Container } from './types';
import styles from './index.module.css';

export default function ContainerManagementDemo() {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  const handleSelectContainer = useCallback((container: Container) => {
    setSelectedContainer(container);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedContainer(null);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {selectedContainer && (
          <ContainerDetail container={selectedContainer} onBack={handleBack} />
        )}
        <div
          className={styles.listWrapper}
          style={{ display: selectedContainer ? 'none' : 'contents' }}
        >
          <ContainerList containers={containers} onSelectContainer={handleSelectContainer} />
        </div>
      </div>

      <StatusBar>
        <StatusBar.Section>
          <StatusBar.IconItem icon={<LuContainer aria-hidden />}>
            {clusterStats.total} containers
          </StatusBar.IconItem>
          <StatusBar.Separator />
          <StatusBar.IconItem icon={<LuPlay aria-hidden />} color="success">
            {clusterStats.running} running
          </StatusBar.IconItem>
          <StatusBar.Separator />
          <StatusBar.IconItem icon={<LuSquare aria-hidden />}>
            {clusterStats.stopped} stopped
          </StatusBar.IconItem>
          {clusterStats.paused > 0 && (
            <>
              <StatusBar.Separator />
              <StatusBar.IconItem icon={<LuPause aria-hidden />} color="warning">
                {clusterStats.paused} paused
              </StatusBar.IconItem>
            </>
          )}
          {clusterStats.restarting > 0 && (
            <>
              <StatusBar.Separator />
              <StatusBar.IconItem icon={<LuRefreshCw aria-hidden />} color="warning">
                {clusterStats.restarting} restarting
              </StatusBar.IconItem>
            </>
          )}
          {clusterStats.exited > 0 && (
            <>
              <StatusBar.Separator />
              <StatusBar.IconItem icon={<LuCircleAlert aria-hidden />} color="danger">
                {clusterStats.exited} exited
              </StatusBar.IconItem>
            </>
          )}
        </StatusBar.Section>

        <StatusBar.Section align="end">
          <StatusBar.Item>
            Mem: {Math.round(clusterStats.totalMemoryMB / 1024 * 10) / 10} GB
          </StatusBar.Item>
          <StatusBar.Separator />
          <StatusBar.Item>
            Avg CPU: {clusterStats.avgCpu.toFixed(1)}%
          </StatusBar.Item>
        </StatusBar.Section>
      </StatusBar>
    </div>
  );
}
