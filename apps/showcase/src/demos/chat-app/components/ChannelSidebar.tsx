// apps/showcase/src/demos/chat-app/components/ChannelSidebar.tsx
import { LuChevronDown, LuHash, LuPlus } from 'react-icons/lu';
import { Avatar, Badge, IconButton, NavList, StatusDot } from '@omniview/base-ui';
import type { Workspace, Channel } from '../types';
import { getUserById, presenceToStatus } from '../data';
import styles from '../index.module.css';

export interface ChannelSidebarProps {
  workspace: Workspace;
  activeChannelId: string;
  onSwitchChannel: (id: string) => void;
}

export function ChannelSidebar({
  workspace,
  activeChannelId,
  onSwitchChannel,
}: ChannelSidebarProps) {
  const channels = workspace.channels.filter((c) => c.type === 'channel');
  const dms = workspace.channels.filter((c) => c.type === 'dm');
  const selectedKeys = new Set<string>([activeChannelId]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span>{workspace.name}</span>
        <LuChevronDown size={14} />
      </div>

      <div className={styles.sidebarBody}>
        <NavList.Root density="compact" selectedKeys={selectedKeys} selectionMode="single">
          <NavList.Group collapsible defaultExpanded>
            <NavList.GroupHeader>Channels</NavList.GroupHeader>
            <NavList.GroupItems>
              {channels.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  onClick={() => onSwitchChannel(ch.id)}
                />
              ))}
            </NavList.GroupItems>
          </NavList.Group>

          <NavList.Group collapsible defaultExpanded>
            <NavList.GroupHeader>Direct Messages</NavList.GroupHeader>
            <NavList.GroupItems>
              {dms.map((dm) => {
                const otherUserId = dm.members.find((id) => id !== workspace.users[0]?.id);
                const otherUser = otherUserId ? getUserById(workspace.users, otherUserId) : null;
                return (
                  <NavList.Item
                    key={dm.id}
                    itemKey={dm.id}
                    onClick={() => onSwitchChannel(dm.id)}
                  >
                    <NavList.ItemIcon>
                      <div className={styles.dmItemPresence}>
                        <Avatar name={otherUser?.name ?? dm.name} shape="circle" size="sm" />
                        {otherUser && (
                          <StatusDot status={presenceToStatus(otherUser.status)} size="sm" />
                        )}
                      </div>
                    </NavList.ItemIcon>
                    <NavList.ItemLabel
                      className={dm.unreadCount > 0 ? styles.channelItemUnread : styles.channelItem}
                    >
                      {dm.name}
                    </NavList.ItemLabel>
                    {dm.unreadCount > 0 && (
                      <NavList.ItemMeta>
                        <Badge content={dm.unreadCount} color="danger" size="sm">
                          <span />
                        </Badge>
                      </NavList.ItemMeta>
                    )}
                  </NavList.Item>
                );
              })}
            </NavList.GroupItems>
          </NavList.Group>
        </NavList.Root>
      </div>

      <div className={styles.sidebarFooter}>
        <IconButton variant="ghost" size="sm" aria-label="Add channel">
          <LuPlus size={14} />
        </IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Add direct message">
          <LuPlus size={14} />
        </IconButton>
      </div>
    </div>
  );
}

function ChannelItem({
  channel,
  onClick,
}: {
  channel: Channel;
  onClick: () => void;
}) {
  return (
    <NavList.Item itemKey={channel.id} onClick={onClick} unread={channel.unreadCount > 0}>
      <NavList.ItemIcon>
        <LuHash size={14} />
      </NavList.ItemIcon>
      <NavList.ItemLabel
        className={channel.unreadCount > 0 ? styles.channelItemUnread : styles.channelItem}
      >
        {channel.name}
      </NavList.ItemLabel>
      {channel.unreadCount > 0 && (
        <NavList.ItemMeta>
          <Badge content={channel.unreadCount} color="danger" size="sm">
            <span />
          </Badge>
        </NavList.ItemMeta>
      )}
    </NavList.Item>
  );
}
