export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;          // markdown content
  thinking?: {
    text: string;
    durationMs: number;
  };
  toolCalls?: ToolCallData[];
  citations?: CitationData[];
  sources?: SourceData[];
  branches?: BranchData[];
  contextFiles?: string[];   // for AIContextIndicator
  artifact?: ArtifactData;
}

export interface ToolCallData {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  durationMs: number;
  input?: string;
  output?: string;
}

export interface CitationData {
  id: string;
  number: number;
  text: string;
  source: string;
}

export interface SourceData {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

export interface BranchData {
  id: string;
  content: string;
}

export interface ArtifactData {
  title: string;
  language: string;
  code: string;
}

/** Phases of the scripted replay state machine */
export type ReplayPhase =
  | 'idle'
  | 'typing'
  | 'thinking'
  | 'tool-call'
  | 'streaming'
  | 'artifact'
  | 'follow-up'
  | 'done';
