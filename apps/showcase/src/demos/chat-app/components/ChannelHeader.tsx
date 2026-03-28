// apps/showcase/src/demos/chat-app/components/ChannelHeader.tsx
import { LuHash, LuSearch, LuPin, LuInfo, LuUsers } from 'react-icons/lu';
import { IconButton } from '@omniviewdev/base-ui';
import type { Channel } from '../types';
import styles from '../index.module.css';

export interface ChannelHeaderProps {
  channel: Channel;
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const isChannel = channel.type === 'channel';

  return (
    <div className={styles.channelHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {isChannel && <LuHash size={16} />}
        <span className={styles.channelHeaderTitle}>{channel.name}</span>
      </div>
      <div className={styles.channelHeaderActions}>
        <span className={styles.channelHeaderMeta}>
          <LuUsers size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {channel.members.length}
        </span>
        <IconButton variant="ghost" size="sm" aria-label="Search">
          <LuSearch size={14} />
        </IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Pinned messages">
          <LuPin size={14} />
        </IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Channel info">
          <LuInfo size={14} />
        </IconButton>
      </div>
    </div>
  );
}
