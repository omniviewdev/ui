// apps/showcase/src/demos/chat-app/index.tsx
import { useCallback } from 'react';
import { ResizableSplitPane } from '@omniview/base-ui';
import { useChat } from './hooks/useChat';
import { WorkspaceRail } from './components/WorkspaceRail';
import { ChannelSidebar } from './components/ChannelSidebar';
import { ChannelHeader } from './components/ChannelHeader';
import { MessageList } from './components/MessageList';
import { MessageComposer } from './components/MessageComposer';
import { ThreadPanel } from './components/ThreadPanel';
import { TypingIndicator } from './components/TypingIndicator';
import styles from './index.module.css';

export default function ChatAppDemo() {
  const chat = useChat();

  const handleToggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      chat.toggleReaction(messageId, emoji);
    },
    [chat.toggleReaction],
  );

  return (
    <div className={styles.shell}>
      {/* Workspace Rail */}
      <WorkspaceRail
        workspaces={chat.workspaces}
        activeWorkspaceId={chat.activeWorkspace.id}
        currentUser={chat.currentUser}
        onSwitchWorkspace={chat.switchWorkspace}
      />

      {/* Channel Sidebar + Main Area */}
      <ResizableSplitPane
        direction="horizontal"
        defaultSize={240}
        minSize={180}
        maxSize={360}
        handleLabel="Resize sidebar"
      >
        <ChannelSidebar
          workspace={chat.activeWorkspace}
          activeChannelId={chat.activeChannel.id}
          onSwitchChannel={chat.switchChannel}
        />

        <div className={styles.main}>
          {/* Chat area */}
          <div className={styles.chatArea}>
            <ChannelHeader channel={chat.activeChannel} />
            <MessageList
              messages={chat.messages}
              users={chat.activeWorkspace.users}
              currentUserId={chat.currentUser.id}
              threadReplies={chat.allThreadReplies}
              onToggleReaction={handleToggleReaction}
              onOpenThread={chat.openThread}
            />
            <TypingIndicator users={chat.typingUsers} />
            <MessageComposer
              placeholder={`Message #${chat.activeChannel.name}`}
              onSend={chat.sendMessage}
            />
          </div>

          {/* Thread Panel */}
          {chat.activeThread && (
            <ThreadPanel
              parentMessage={chat.activeThread}
              replies={chat.threadMessages}
              channel={chat.activeChannel}
              users={chat.activeWorkspace.users}
              currentUserId={chat.currentUser.id}
              onClose={chat.closeThread}
              onSendReply={chat.sendThreadReply}
              onToggleReaction={handleToggleReaction}
            />
          )}
        </div>
      </ResizableSplitPane>
    </div>
  );
}
