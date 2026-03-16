// apps/showcase/src/demos/chat-app/data.ts
import type { User, Channel, Workspace, Message } from './types';

// ── Users ──────────────────────────────────────────────────────────────────

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Chen', avatar: 'AC', status: 'online' },
  { id: 'u2', name: 'Bob Park', avatar: 'BP', status: 'online' },
  { id: 'u3', name: 'Carol Wu', avatar: 'CW', status: 'away' },
  { id: 'u4', name: 'Dan Kim', avatar: 'DK', status: 'dnd' },
  { id: 'u5', name: 'Eva Torres', avatar: 'ET', status: 'offline' },
  { id: 'u6', name: 'Frank Liu', avatar: 'FL', status: 'online' },
];

/** The "logged-in" user for reaction toggling and message sending. */
export const CURRENT_USER = USERS[0]!; // Alice Chen

// ── Channels ───────────────────────────────────────────────────────────────

export const CHANNELS: Channel[] = [
  { id: 'ch-general', name: 'general', type: 'channel', unreadCount: 0, members: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] },
  { id: 'ch-engineering', name: 'engineering', type: 'channel', unreadCount: 2, members: ['u1', 'u2', 'u3', 'u6'] },
  { id: 'ch-design', name: 'design', type: 'channel', unreadCount: 3, members: ['u1', 'u3', 'u4'] },
  { id: 'ch-random', name: 'random', type: 'channel', unreadCount: 0, members: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] },
  { id: 'ch-deployments', name: 'deployments', type: 'channel', unreadCount: 0, members: ['u1', 'u2', 'u6'] },
];

export const DM_CHANNELS: Channel[] = [
  { id: 'dm-bob', name: 'Bob Park', type: 'dm', unreadCount: 1, members: ['u1', 'u2'] },
  { id: 'dm-carol', name: 'Carol Wu', type: 'dm', unreadCount: 0, members: ['u1', 'u3'] },
  { id: 'dm-dan', name: 'Dan Kim', type: 'dm', unreadCount: 0, members: ['u1', 'u4'] },
  { id: 'dm-eva', name: 'Eva Torres', type: 'dm', unreadCount: 0, members: ['u1', 'u5'] },
];

// ── Workspaces ─────────────────────────────────────────────────────────────

export const WORKSPACES: Workspace[] = [
  {
    id: 'ws-omniview',
    name: 'Omniview HQ',
    avatar: 'O',
    channels: [...CHANNELS, ...DM_CHANNELS],
    users: USERS,
  },
  {
    id: 'ws-oss',
    name: 'Open Source',
    avatar: 'OS',
    channels: [
      { id: 'ch-contrib', name: 'contributors', type: 'channel', unreadCount: 0, members: ['u1', 'u2'] },
    ],
    users: [USERS[0]!, USERS[1]!],
  },
  {
    id: 'ws-social',
    name: 'After Hours',
    avatar: 'AH',
    channels: [
      { id: 'ch-gaming', name: 'gaming', type: 'channel', unreadCount: 0, members: ['u1', 'u3'] },
    ],
    users: [USERS[0]!, USERS[2]!],
  },
];

// ── Helper ─────────────────────────────────────────────────────────────────

/** Build a timestamp for "today" at a given hour:minute. */
function todayAt(hour: number, minute: number): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

function yesterdayAt(hour: number, minute: number): number {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

// ── Messages ───────────────────────────────────────────────────────────────

export const MESSAGES: Record<string, Message[]> = {
  'ch-general': [
    {
      id: 'msg-1',
      channelId: 'ch-general',
      userId: 'u2',
      content: 'Good morning team! Just pushed the latest changes to the staging environment.',
      timestamp: yesterdayAt(9, 15),
      reactions: [{ emoji: '👋', userIds: ['u1', 'u3'] }],
      replyCount: 0,
    },
    {
      id: 'msg-2',
      channelId: 'ch-general',
      userId: 'u3',
      content: 'Nice! I\'ll start testing after standup.',
      timestamp: yesterdayAt(9, 17),
      reactions: [],
      replyCount: 0,
    },
    {
      id: 'msg-3',
      channelId: 'ch-general',
      userId: 'u1',
      content: 'Hey everyone, the new component library docs are live at https://docs.omniview.dev/components. Please review when you get a chance!',
      timestamp: todayAt(10, 32),
      reactions: [
        { emoji: '🚀', userIds: ['u2', 'u3', 'u6'] },
        { emoji: '👍', userIds: ['u4'] },
      ],
      replyCount: 3,
    },
    {
      id: 'msg-4',
      channelId: 'ch-general',
      userId: 'u2',
      content: 'Looks great @Alice! I noticed the DataTable docs are missing the sorting examples though.',
      timestamp: todayAt(10, 34),
      reactions: [],
      replyCount: 0,
    },
    {
      id: 'msg-5',
      channelId: 'ch-general',
      userId: 'u6',
      content: '@Bob good catch. I\'ll add those this afternoon. Also want to add the virtualization section.',
      timestamp: todayAt(10, 36),
      reactions: [{ emoji: '👍', userIds: ['u2'] }],
      replyCount: 0,
    },
    {
      id: 'msg-6',
      channelId: 'ch-general',
      userId: 'u4',
      content: 'Reminder: design review at 2pm today. I\'ll share the Figma link in #design.',
      timestamp: todayAt(11, 0),
      reactions: [{ emoji: '📅', userIds: ['u1', 'u3'] }],
      replyCount: 0,
    },
  ],

  'ch-engineering': [
    {
      id: 'msg-eng-1',
      channelId: 'ch-engineering',
      userId: 'u2',
      content: 'PR #142 is ready for review — refactored the auth middleware to support JWT rotation.\n\n```typescript\nconst rotateToken = async (token: string) => {\n  const decoded = verify(token, currentKey);\n  return sign(decoded.payload, nextKey);\n};\n```',
      timestamp: todayAt(9, 0),
      reactions: [{ emoji: '👀', userIds: ['u1'] }],
      replyCount: 2,
    },
    {
      id: 'msg-eng-2',
      channelId: 'ch-engineering',
      userId: 'u6',
      content: 'I\'m seeing some flaky tests in CI. The `useVirtualizer` hook tests timeout intermittently. Anyone else hitting this?',
      timestamp: todayAt(9, 45),
      reactions: [{ emoji: '🤔', userIds: ['u2'] }],
      replyCount: 0,
    },
    {
      id: 'msg-eng-3',
      channelId: 'ch-engineering',
      userId: 'u1',
      content: '@Frank yeah, I think it\'s a race condition with the resize observer. Try wrapping the assertion in `waitFor`:\n\n```typescript\nawait waitFor(() => {\n  expect(virtualizer.getVirtualItems()).toHaveLength(10);\n});\n```',
      timestamp: todayAt(9, 52),
      reactions: [{ emoji: '🙏', userIds: ['u6'] }],
      replyCount: 0,
    },
    {
      id: 'msg-eng-4',
      channelId: 'ch-engineering',
      userId: 'u3',
      content: 'Heads up — I\'m bumping React to 19.1 in the next release. No breaking changes expected but keep an eye on the compiler output.',
      timestamp: todayAt(11, 30),
      reactions: [],
      replyCount: 0,
    },
  ],

  'ch-design': [
    {
      id: 'msg-des-1',
      channelId: 'ch-design',
      userId: 'u4',
      content: 'New icon set proposal attached. Going for a more rounded, friendly feel to match the pill tab direction.',
      timestamp: todayAt(10, 0),
      reactions: [{ emoji: '😍', userIds: ['u1', 'u3'] }],
      replyCount: 0,
    },
    {
      id: 'msg-des-2',
      channelId: 'ch-design',
      userId: 'u3',
      content: 'Love the direction! Can we also look at the spacing tokens? I think `--ov-space-stack-md` is too tight for card layouts.',
      timestamp: todayAt(10, 15),
      reactions: [],
      replyCount: 0,
    },
    {
      id: 'msg-des-3',
      channelId: 'ch-design',
      userId: 'u4',
      content: 'Agreed. I\'ll put together a comparison with 12px vs 16px spacing and share at the 2pm review.',
      timestamp: todayAt(10, 20),
      reactions: [{ emoji: '👍', userIds: ['u3'] }],
      replyCount: 0,
    },
    {
      id: 'msg-des-4',
      channelId: 'ch-design',
      userId: 'u4',
      content: 'Here\'s the updated icon set: [file:icons-v3-rounded.fig]',
      timestamp: todayAt(10, 30),
      reactions: [{ emoji: '🎨', userIds: ['u1', 'u3'] }],
      replyCount: 0,
    },
  ],

  'ch-random': [
    {
      id: 'msg-rnd-1',
      channelId: 'ch-random',
      userId: 'u5',
      content: 'Anyone want to grab lunch at the new ramen place? 🍜',
      timestamp: todayAt(11, 45),
      reactions: [
        { emoji: '🍜', userIds: ['u1', 'u2', 'u3'] },
        { emoji: '👍', userIds: ['u4', 'u6'] },
      ],
      replyCount: 0,
    },
  ],

  'ch-deployments': [
    {
      id: 'msg-dep-1',
      channelId: 'ch-deployments',
      userId: 'u2',
      content: '🟢 **Production deploy successful**\n`v2.4.1` rolled out to all regions. No errors in the first 5 minutes.',
      timestamp: todayAt(8, 30),
      reactions: [{ emoji: '🎉', userIds: ['u1', 'u3', 'u6'] }],
      replyCount: 0,
    },
  ],

  'dm-bob': [
    {
      id: 'msg-dm-1',
      channelId: 'dm-bob',
      userId: 'u2',
      content: 'Hey, can you review my PR when you get a sec? It\'s the auth middleware one.',
      timestamp: todayAt(9, 5),
      reactions: [],
      replyCount: 0,
    },
    {
      id: 'msg-dm-2',
      channelId: 'dm-bob',
      userId: 'u1',
      content: 'Sure! I\'ll take a look after standup.',
      timestamp: todayAt(9, 8),
      reactions: [{ emoji: '🙌', userIds: ['u2'] }],
      replyCount: 0,
    },
  ],
};

// ── Thread replies ─────────────────────────────────────────────────────────

/** Thread replies keyed by parent message ID. */
export const THREAD_REPLIES: Record<string, Message[]> = {
  'msg-3': [
    {
      id: 'reply-3-1',
      channelId: 'ch-general',
      userId: 'u2',
      content: 'The Avatar docs look great. Love the shape examples.',
      timestamp: todayAt(10, 40),
      reactions: [],
      replyCount: 0,
    },
    {
      id: 'reply-3-2',
      channelId: 'ch-general',
      userId: 'u3',
      content: 'Should we add a migration guide from the old API?',
      timestamp: todayAt(10, 45),
      reactions: [{ emoji: '💯', userIds: ['u1'] }],
      replyCount: 0,
    },
    {
      id: 'reply-3-3',
      channelId: 'ch-general',
      userId: 'u1',
      content: 'Good idea @Carol. I\'ll draft one this week.',
      timestamp: todayAt(10, 50),
      reactions: [],
      replyCount: 0,
    },
  ],
  'msg-eng-1': [
    {
      id: 'reply-eng-1',
      channelId: 'ch-engineering',
      userId: 'u1',
      content: 'Looks solid. One question — should `rotateToken` handle expired tokens or let them fail?',
      timestamp: todayAt(9, 20),
      reactions: [],
      replyCount: 0,
    },
    {
      id: 'reply-eng-2',
      channelId: 'ch-engineering',
      userId: 'u2',
      content: 'Good question. I think we should let them fail and force a re-auth. Added a comment in the PR.',
      timestamp: todayAt(9, 25),
      reactions: [{ emoji: '👍', userIds: ['u1'] }],
      replyCount: 0,
    },
  ],
};

// ── Helpers for components ─────────────────────────────────────────────────

export function getUserById(users: User[], id: string): User {
  return users.find((u) => u.id === id) ?? { id, name: 'Unknown', avatar: '?', status: 'offline' as const };
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDateSeparator(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && now.getDate() === date.getDate()) return 'Today';
  if (diffDays <= 1 && now.getDate() - date.getDate() === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
}

/** Presence status → StatusDot status mapping */
export function presenceToStatus(status: User['status']): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'online': return 'success';
    case 'away': return 'warning';
    case 'dnd': return 'danger';
    case 'offline': return 'neutral';
  }
}
