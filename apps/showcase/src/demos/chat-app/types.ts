// apps/showcase/src/demos/chat-app/types.ts

export type UserStatus = 'online' | 'away' | 'dnd' | 'offline';

export interface User {
  id: string;
  name: string;
  avatar: string;        // initials or emoji
  status: UserStatus;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  timestamp: number;
  reactions: Reaction[];
  replyCount: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unreadCount: number;
  members: string[];     // user IDs
}

export interface Workspace {
  id: string;
  name: string;
  avatar: string;        // initials or emoji
  channels: Channel[];
  users: User[];
}
