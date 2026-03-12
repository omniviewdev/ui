import '@omniview/ai-ui/styles.css';

import { useState, useCallback, useRef } from 'react';
import {
  ResizableSplitPane,
} from '@omniview/base-ui';
import {
  AIConversationHeader,
  AIModelSelector,
  ChatMessageList,
  ChatSuggestions,
  ChatInput,
  AIFollowUp,
  TypingIndicator,
  AIMarkdown,
  ThinkingBlock,
  AIStopButton,
  ToolCall,
  ToolResult,
} from '@omniview/ai-ui';
import type { ChatMessageListHandle } from '@omniview/ai-ui';

import { MessageRenderer } from './components/MessageRenderer';
import { ArtifactPanel } from './components/ArtifactPanel';
import { useScriptedReplay } from './hooks/useScriptedReplay';
import type { ChatMessage, ArtifactData } from './types';
import {
  prebuiltMessages,
  replayArtifact,
  replayStreamedText,
  chatSuggestions,
  followUpSuggestions,
  modelOptions,
} from './data';
import styles from './index.module.css';

const PHASE_ORDER = [
  'idle',
  'typing',
  'thinking',
  'tool-call',
  'streaming',
  'artifact',
  'follow-up',
  'done',
] as const;

function phaseIndex(phase: string): number {
  return PHASE_ORDER.indexOf(phase as typeof PHASE_ORDER[number]);
}

function pastPhase(current: string, target: string): boolean {
  return phaseIndex(current) >= phaseIndex(target);
}

export default function AiChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>(prebuiltMessages);
  const [selectedModel, setSelectedModel] = useState(modelOptions[0].id);
  const [inputValue, setInputValue] = useState('');
  const [artifact, setArtifact] = useState<ArtifactData | null>(null);
  const [replayUserMessage, setReplayUserMessage] = useState<ChatMessage | null>(null);

  const listRef = useRef<ChatMessageListHandle>(null);

  const { state, startReplay, reset } = useScriptedReplay({
    thinkingText: 'Let me think about the best way to implement this fibonacci function...',
    toolCallName: 'write_file',
    streamedText: replayStreamedText,
    artifact: replayArtifact,
    followUps: followUpSuggestions,
  });

  // Expose artifact from replay state
  const displayedArtifact = artifact ?? state.artifact;

  const handleSend = useCallback((value: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: value,
      contextFiles: ['src/utils/math.py', 'tests/test_math.py'],
    };
    setMessages((prev) => [...prev, userMsg]);
    setReplayUserMessage(userMsg);
    setInputValue('');
    // Reset artifact from previous replay
    setArtifact(null);
    // Small delay so the message renders before replay starts
    setTimeout(() => {
      startReplay();
      requestAnimationFrame(() => {
        listRef.current?.scrollToBottom();
      });
    }, 50);
  }, [startReplay]);

  const handleSuggestionSelect = useCallback((value: string) => {
    handleSend(value);
  }, [handleSend]);

  const handleFollowUpSelect = useCallback((suggestion: string) => {
    handleSend(suggestion);
  }, [handleSend]);

  const handleStop = useCallback(() => {
    reset();
  }, [reset]);

  const handleCloseArtifact = useCallback(() => {
    setArtifact(null);
    // also clear replay artifact
    reset();
  }, [reset]);

  const handleCopyArtifact = useCallback((code: string) => {
    void navigator.clipboard.writeText(code);
  }, []);

  // Build combined item list for the virtual list
  // Static messages + replay items (cumulative, once visible they stay)
  const isReplaying = state.phase !== 'idle' && state.phase !== 'done' || (state.phase === 'done' && replayUserMessage != null);
  const showTyping = isReplaying && pastPhase(state.phase, 'typing') && !pastPhase(state.phase, 'thinking');
  const showThinking = isReplaying && pastPhase(state.phase, 'thinking');
  const showToolCall = isReplaying && pastPhase(state.phase, 'tool-call');
  const showStreaming = isReplaying && pastPhase(state.phase, 'streaming');
  const showFollowUp = isReplaying && pastPhase(state.phase, 'follow-up');

  // Count of static messages (after replay user message is moved to replay section)
  const staticMessages = replayUserMessage
    ? messages.filter((m) => m.id !== replayUserMessage.id)
    : messages;

  // Replay items list (appears below static messages)
  type ReplayItem =
    | { type: 'user-replay'; message: ChatMessage }
    | { type: 'typing' }
    | { type: 'assistant-replay' };

  const replayItems: ReplayItem[] = [];
  if (replayUserMessage) {
    replayItems.push({ type: 'user-replay', message: replayUserMessage });
    if (showTyping) {
      replayItems.push({ type: 'typing' });
    }
    if (showThinking || showToolCall || showStreaming) {
      replayItems.push({ type: 'assistant-replay' });
    }
  }

  const totalCount = staticMessages.length + replayItems.length;

  const renderItem = useCallback(
    (index: number) => {
      if (index < staticMessages.length) {
        return (
          <div style={{ padding: '8px 16px' }}>
            <MessageRenderer
              message={staticMessages[index]}
              onCopy={(content) => void navigator.clipboard.writeText(content)}
            />
          </div>
        );
      }

      const replayIndex = index - staticMessages.length;
      const replayItem = replayItems[replayIndex];

      if (!replayItem) return null;

      if (replayItem.type === 'user-replay') {
        return (
          <div style={{ padding: '8px 16px' }}>
            <MessageRenderer message={replayItem.message} />
          </div>
        );
      }

      if (replayItem.type === 'typing') {
        return (
          <div className={styles.TypingRow}>
            <TypingIndicator label="Claude is thinking..." />
          </div>
        );
      }

      if (replayItem.type === 'assistant-replay') {
        return (
          <div style={{ padding: '8px 16px' }}>
            {showThinking && (
              <ThinkingBlock
                content={state.thinkingText}
                streaming={state.phase === 'thinking'}
                duration={state.phase !== 'thinking' ? 2100 : undefined}
              />
            )}
            {showToolCall && (
              <div className={styles.ReplayRow}>
                <ToolCall
                  name="write_file"
                  status={state.toolCallStatus}
                  duration={state.toolCallStatus === 'success' ? 1200 : undefined}
                  arguments={{ filename: 'fibonacci.py' }}
                >
                  {state.toolCallStatus === 'success' && (
                    <ToolResult content="File written successfully." status="success" />
                  )}
                </ToolCall>
              </div>
            )}
            {showStreaming && (
              <AIMarkdown
                content={state.streamedText}
                streaming={state.phase === 'streaming'}
              />
            )}
          </div>
        );
      }

      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [staticMessages, replayItems, showThinking, showToolCall, showStreaming, state],
  );

  const isStreaming = state.phase === 'streaming' || state.phase === 'typing' || state.phase === 'thinking' || state.phase === 'tool-call';

  const chatPane = (
    <div className={styles.ChatPane}>
      <AIConversationHeader
        title="AI Chat"
        actions={
          <AIModelSelector
            models={modelOptions}
            value={selectedModel}
            onChange={setSelectedModel}
          />
        }
      />

      <div className={styles.MessageListWrapper}>
        <ChatMessageList
          ref={listRef}
          count={totalCount}
          estimateSize={120}
          renderItem={renderItem}
        />
      </div>

      {/* Follow-up suggestions (shown after done) */}
      {showFollowUp && state.followUps.length > 0 && (
        <div className={styles.SuggestionsRow}>
          <AIFollowUp
            suggestions={state.followUps}
            onSelect={handleFollowUpSelect}
          />
        </div>
      )}

      {/* Stop button while streaming */}
      {isStreaming && (
        <div className={styles.StopRow}>
          <AIStopButton onStop={handleStop} />
        </div>
      )}

      {/* Chat suggestions when idle */}
      {state.phase === 'idle' && messages.length <= prebuiltMessages.length && (
        <div className={styles.SuggestionsRow}>
          <ChatSuggestions
            suggestions={chatSuggestions.map((s) => ({ label: s, value: s }))}
            onSelect={handleSuggestionSelect}
          />
        </div>
      )}

      <div className={styles.InputRow}>
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSend}
          placeholder="Ask a question..."
          disabled={isStreaming}
        />
      </div>
    </div>
  );

  const artifactPane = displayedArtifact ? (
    <div className={styles.ArtifactPane}>
      <ArtifactPanel
        artifact={displayedArtifact}
        onClose={handleCloseArtifact}
      />
    </div>
  ) : null;

  return (
    <div className={styles.Root}>
      {displayedArtifact ? (
        <div className={styles.SplitWrapper}>
          <ResizableSplitPane
            direction="horizontal"
            defaultSize={480}
            minSize={300}
            maxSize={700}
          >
            {chatPane}
            {artifactPane}
          </ResizableSplitPane>
        </div>
      ) : (
        <div className={styles.ChatPane} style={{ flex: 1 }}>
          <AIConversationHeader
            title="AI Chat"
            actions={
              <AIModelSelector
                models={modelOptions}
                value={selectedModel}
                onChange={setSelectedModel}
              />
            }
          />

          <div className={styles.MessageListWrapper}>
            <ChatMessageList
              ref={listRef}
              count={totalCount}
              estimateSize={120}
              renderItem={renderItem}
            />
          </div>

          {showFollowUp && state.followUps.length > 0 && (
            <div className={styles.SuggestionsRow}>
              <AIFollowUp
                suggestions={state.followUps}
                onSelect={handleFollowUpSelect}
              />
            </div>
          )}

          {isStreaming && (
            <div className={styles.StopRow}>
              <AIStopButton onStop={handleStop} />
            </div>
          )}

          {state.phase === 'idle' && messages.length <= prebuiltMessages.length && (
            <div className={styles.SuggestionsRow}>
              <ChatSuggestions
                suggestions={chatSuggestions.map((s) => ({ label: s, value: s }))}
                onSelect={handleSuggestionSelect}
              />
            </div>
          )}

          <div className={styles.InputRow}>
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSend}
              placeholder="Ask a question..."
              disabled={isStreaming}
            />
          </div>
        </div>
      )}
    </div>
  );
}
