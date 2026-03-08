export type ChatRole = 'user' | 'assistant' | 'system';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

export type StepStatus = 'pending' | 'active' | 'complete' | 'error';
