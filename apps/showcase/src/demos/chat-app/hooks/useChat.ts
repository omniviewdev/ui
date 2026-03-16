// apps/showcase/src/demos/chat-app/hooks/useChat.ts
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { User, Workspace, Channel, Message } from '../types';
import {
  WORKSPACES,
  MESSAGES,
  THREAD_REPLIES,
  CURRENT_USER,
  getUserById,
} from '../data';

export interface UseChatReturn {
  currentUser: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  activeChannel: Channel;
  activeThread: Message | null;
  messages: Message[];
  threadMessages: Message[];
  allThreadReplies: Record<string, Message[]>;
  typingUsers: User[];

  switchWorkspace: (id: string) => void;
  switchChannel: (id: string) => void;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  sendMessage: (content: string) => void;
  sendThreadReply: (content: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
}

let nextMsgId = 1000;
function makeMsgId(): string {
  return `msg-new-${nextMsgId++}`;
}

export function useChat(): UseChatReturn {
  const [workspaces] = useState<Workspace[]>(WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws-omniview');
  const [activeChannelId, setActiveChannelId] = useState('ch-general');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Messages stored per-channel
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>(MESSAGES);
  // Thread replies stored per-parent-message
  const [threadReplies, setThreadReplies] = useState<Record<string, Message[]>>(THREAD_REPLIES);

  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0]!,
    [workspaces, activeWorkspaceId],
  );

  const activeChannel = useMemo(
    () => activeWorkspace.channels.find((c) => c.id === activeChannelId) ?? activeWorkspace.channels[0]!,
    [activeWorkspace, activeChannelId],
  );

  const messages = useMemo(
    () => messagesByChannel[activeChannelId] ?? [],
    [messagesByChannel, activeChannelId],
  );

  const activeThread = useMemo(
    () => (activeThreadId ? messages.find((m) => m.id === activeThreadId) ?? null : null),
    [messages, activeThreadId],
  );

  const threadMessages = useMemo(
    () => (activeThreadId ? threadReplies[activeThreadId] ?? [] : []),
    [threadReplies, activeThreadId],
  );

  const switchWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
    const ws = workspaces.find((w) => w.id === id);
    if (ws && ws.channels.length > 0) {
      setActiveChannelId(ws.channels[0]!.id);
    }
    setActiveThreadId(null);
  }, [workspaces]);

  const switchChannel = useCallback((id: string) => {
    setActiveChannelId(id);
    setActiveThreadId(null);
  }, []);

  const openThread = useCallback((messageId: string) => {
    setActiveThreadId(messageId);
  }, []);

  const closeThread = useCallback(() => {
    setActiveThreadId(null);
  }, []);

  const simulateTyping = useCallback(() => {
    // Pick a random user (not current user) to show typing
    const others = activeWorkspace.users.filter((u) => u.id !== CURRENT_USER.id);
    const randomUser = others[Math.floor(Math.random() * others.length)];
    if (!randomUser) return;

    setTypingUsers([randomUser]);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers([]);
    }, 3000);
  }, [activeWorkspace.users]);

  const sendMessage = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newMsg: Message = {
      id: makeMsgId(),
      channelId: activeChannelId,
      userId: CURRENT_USER.id,
      content: trimmed,
      timestamp: Date.now(),
      reactions: [],
      replyCount: 0,
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] ?? []), newMsg],
    }));

    simulateTyping();
  }, [activeChannelId, simulateTyping]);

  const sendThreadReply = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed || !activeThreadId) return;

    const newReply: Message = {
      id: makeMsgId(),
      channelId: activeChannelId,
      userId: CURRENT_USER.id,
      content: trimmed,
      timestamp: Date.now(),
      reactions: [],
      replyCount: 0,
    };

    // Add reply to thread
    setThreadReplies((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] ?? []), newReply],
    }));

    // Increment replyCount on parent message
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: (prev[activeChannelId] ?? []).map((m) =>
        m.id === activeThreadId ? { ...m, replyCount: m.replyCount + 1 } : m,
      ),
    }));
  }, [activeChannelId, activeThreadId]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    const toggleInList = (msgs: Message[]): Message[] =>
      msgs.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          const hasUser = existing.userIds.includes(CURRENT_USER.id);
          const updatedUserIds = hasUser
            ? existing.userIds.filter((uid) => uid !== CURRENT_USER.id)
            : [...existing.userIds, CURRENT_USER.id];
          return {
            ...m,
            reactions: updatedUserIds.length > 0
              ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, userIds: updatedUserIds } : r))
              : m.reactions.filter((r) => r.emoji !== emoji),
          };
        }
        return { ...m, reactions: [...m.reactions, { emoji, userIds: [CURRENT_USER.id] }] };
      });

    // Try channel messages first
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: toggleInList(prev[activeChannelId] ?? []),
    }));

    // Also try thread replies
    if (activeThreadId) {
      setThreadReplies((prev) => ({
        ...prev,
        [activeThreadId]: toggleInList(prev[activeThreadId] ?? []),
      }));
    }
  }, [activeChannelId, activeThreadId]);

  return {
    currentUser: CURRENT_USER,
    workspaces,
    activeWorkspace,
    activeChannel,
    activeThread,
    messages,
    threadMessages,
    allThreadReplies: threadReplies,
    typingUsers,
    switchWorkspace,
    switchChannel,
    openThread,
    closeThread,
    sendMessage,
    sendThreadReply,
    toggleReaction,
  };
}

// Re-export getUserById for convenience
export { getUserById };
