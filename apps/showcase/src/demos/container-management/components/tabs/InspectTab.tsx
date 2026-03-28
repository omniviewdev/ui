import { DescriptionList } from '@omniviewdev/base-ui';
import { ObjectInspector } from '@omniviewdev/editors';
import type { ContainerDetail } from '../../types';
import styles from './InspectTab.module.css';

export interface InspectTabProps {
  container: ContainerDetail;
}

function formatPorts(container: ContainerDetail): string {
  if (container.ports.length === 0) return 'none';
  return container.ports.map((p) => `${p.host}:${p.container}/${p.protocol}`).join(', ');
}

export function InspectTab({ container }: InspectTabProps) {
  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Container Info</h3>
        <DescriptionList layout="grid" columns={2} size="sm">
          <DescriptionList.Item label="ID" copyable>
            {container.id}
          </DescriptionList.Item>
          <DescriptionList.Item label="Name">
            {container.name}
          </DescriptionList.Item>
          <DescriptionList.Item label="Image">
            {container.image}
          </DescriptionList.Item>
          <DescriptionList.Item label="Status">
            {container.status}
          </DescriptionList.Item>
          <DescriptionList.Item label="Network">
            {container.network}
          </DescriptionList.Item>
          <DescriptionList.Item label="Uptime">
            {container.uptime}
          </DescriptionList.Item>
          <DescriptionList.Item label="Created">
            {new Date(container.created).toLocaleString()}
          </DescriptionList.Item>
          <DescriptionList.Item label="Ports">
            {formatPorts(container)}
          </DescriptionList.Item>
          <DescriptionList.Item label="Disk">
            {container.disk}
          </DescriptionList.Item>
          <DescriptionList.Item label="Memory">
            {container.memory} / {container.memoryLimit} MB
          </DescriptionList.Item>
        </DescriptionList>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Configuration</h3>
        <ObjectInspector
          data={container.config}
          defaultExpanded={2}
          searchable
          copyable
          className={styles.inspector}
        />
      </section>
    </div>
  );
}
