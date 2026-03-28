// apps/showcase/src/demos/chat-app/components/WorkspaceRail.tsx
import { LuPlus } from 'react-icons/lu';
import { Avatar, Separator, StatusDot, Tooltip } from '@omniviewdev/base-ui';
import type { Workspace, User } from '../types';
import { presenceToStatus } from '../data';
import styles from '../index.module.css';

export interface WorkspaceRailProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  currentUser: User;
  onSwitchWorkspace: (id: string) => void;
}

export function WorkspaceRail({
  workspaces,
  activeWorkspaceId,
  currentUser,
  onSwitchWorkspace,
}: WorkspaceRailProps) {
  return (
    <div className={styles.rail}>
      {workspaces.map((ws) => (
        <Tooltip.Root key={ws.id} lazy>
          <Tooltip.Trigger
            className={styles.railWorkspace}
            data-active={ws.id === activeWorkspaceId ? '' : undefined}
            onClick={() => onSwitchWorkspace(ws.id)}
          >
            <span className={styles.railIndicator} />
            <Avatar name={ws.name} shape="rounded" size="md" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>{ws.name}</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      ))}

      <Separator orientation="horizontal" />

      <button type="button" className={styles.railAddButton} aria-label="Add workspace">
        <LuPlus size={16} />
      </button>

      <div className={styles.railSpacer} />

      <div className={styles.railUserAvatar}>
        <Avatar name={currentUser.name} shape="circle" size="sm" />
        <StatusDot
          status={presenceToStatus(currentUser.status)}
          size="sm"
          className={styles.railUserStatus}
        />
      </div>
    </div>
  );
}
