import { useState, useCallback } from 'react';
import {
  ChatBubble,
  ChatAvatar,
  AIContextIndicator,
  AIMessageActions,
  AIFollowUp,
} from '@omniview/ai-ui';
import type { ContextItem } from '@omniview/ai-ui';
import {
  AIBranch,
  AIBranchContent,
  AIBranchSelector,
} from '@omniview/ai-ui';
import {
  AISources,
} from '@omniview/ai-ui';
import {
  AIMarkdown,
} from '@omniview/ai-ui';
import {
  ThinkingBlock,
} from '@omniview/ai-ui';
import {
  ToolCall,
  ToolResult,
} from '@omniview/ai-ui';
import type { ChatMessage } from '../types';
import styles from './MessageRenderer.module.css';

interface MessageRendererProps {
  message: ChatMessage;
  onCopy?: (content: string) => void;
}

export function MessageRenderer({ message, onCopy }: MessageRendererProps) {
  const [activeBranch, setActiveBranch] = useState(0);

  const handleCopy = useCallback(() => {
    onCopy?.(message.content);
  }, [message.content, onCopy]);

  const contextItems: ContextItem[] = (message.contextFiles ?? []).map((f) => ({
    type: 'file' as const,
    label: f,
  }));

  const hasBranches = message.branches && message.branches.length > 0;

  return (
    <div className={styles.Root} data-role={message.role}>
      <ChatBubble
        role={message.role}
        avatar={<ChatAvatar role={message.role} />}
        actions={
          message.role === 'assistant' ? (
            <AIMessageActions
              onCopy={handleCopy}
              onRegenerate={() => {}}
            />
          ) : undefined
        }
      >
        {/* Context files for user messages */}
        {message.role === 'user' && contextItems.length > 0 && (
          <AIContextIndicator items={contextItems} />
        )}

        {/* Thinking block */}
        {message.thinking && (
          <ThinkingBlock
            content={message.thinking.text}
            duration={message.thinking.durationMs}
          />
        )}

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.map((tc) => (
          <div key={tc.id} className={styles.ToolCallWrapper}>
            <ToolCall
              name={tc.name}
              status={tc.status}
              duration={tc.durationMs}
              arguments={tc.input ? { query: tc.input } : undefined}
            >
              {tc.output && tc.status === 'success' && (
                <ToolResult content={tc.output} status="success" />
              )}
            </ToolCall>
          </div>
        ))}

        {/* Main content — with branches or plain */}
        {hasBranches ? (
          <AIBranch
            count={message.branches!.length}
            active={activeBranch}
            onChange={setActiveBranch}
          >
            <AIBranchSelector />
            {message.branches!.map((branch, index) => (
              <AIBranchContent key={branch.id} index={index}>
                <AIMarkdown content={branch.content} />
              </AIBranchContent>
            ))}
          </AIBranch>
        ) : (
          <AIMarkdown content={message.content} />
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <AISources
            sources={message.sources.map((s) => ({
              id: s.id,
              label: s.title,
              url: s.url,
              detail: s.snippet,
            }))}
          />
        )}
      </ChatBubble>
    </div>
  );
}
