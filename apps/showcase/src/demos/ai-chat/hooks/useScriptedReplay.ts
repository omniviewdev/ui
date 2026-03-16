import { useCallback, useRef, useState } from 'react';
import type { ArtifactData, ReplayPhase } from '../types';

export interface ReplayState {
  phase: ReplayPhase;
  thinkingText: string;
  streamedText: string;
  toolCallStatus: 'pending' | 'running' | 'success';
  artifact: ArtifactData | null;
  followUps: string[];
}

const INITIAL_STATE: ReplayState = {
  phase: 'idle',
  thinkingText: '',
  streamedText: '',
  toolCallStatus: 'pending',
  artifact: null,
  followUps: [],
};

export interface UseScriptedReplayOptions {
  thinkingText: string;
  toolCallName: string;
  streamedText: string;
  artifact: ArtifactData;
  followUps: string[];
}

export function useScriptedReplay(options: UseScriptedReplayOptions) {
  const [state, setState] = useState<ReplayState>(INITIAL_STATE);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const startReplay = useCallback(() => {
    clearAllTimeouts();

    // Reset to idle first
    setState(INITIAL_STATE);

    const { thinkingText, streamedText, artifact, followUps } = options;

    let elapsed = 0;

    // Phase: typing (user message arrived — show typing indicator)
    schedule(() => {
      setState((s) => ({ ...s, phase: 'typing' }));
    }, (elapsed += 50));

    // Phase: thinking
    schedule(() => {
      setState((s) => ({ ...s, phase: 'thinking', thinkingText }));
    }, (elapsed += 500));

    // Phase: tool-call (running)
    schedule(() => {
      setState((s) => ({ ...s, phase: 'tool-call', toolCallStatus: 'running' }));
    }, (elapsed += 2000));

    // Tool-call success
    schedule(() => {
      setState((s) => ({ ...s, toolCallStatus: 'success' }));
    }, (elapsed += 1000));

    // Phase: streaming — start after tool call resolves
    const streamingStart = elapsed + 300;

    schedule(() => {
      setState((s) => ({ ...s, phase: 'streaming', streamedText: '' }));
    }, streamingStart);

    // Stream by token-like chunks (~3-5 chars) at realistic LLM speed
    const charsPerTick = 4;
    const msPerTick = 18;
    const totalTicks = Math.ceil(streamedText.length / charsPerTick);
    for (let t = 1; t <= totalTicks; t++) {
      const end = Math.min(t * charsPerTick, streamedText.length);
      const chunk = streamedText.slice(0, end);
      schedule(() => {
        setState((s) => ({ ...s, streamedText: chunk }));
      }, streamingStart + t * msPerTick);
    }

    const streamingEnd = streamingStart + totalTicks * msPerTick;

    // Phase: artifact — appears after streaming complete
    schedule(() => {
      setState((s) => ({ ...s, phase: 'artifact', artifact }));
    }, (elapsed = streamingEnd + 200));

    // Phase: follow-up
    schedule(() => {
      setState((s) => ({ ...s, phase: 'follow-up', followUps }));
    }, (elapsed += 500));

    // Phase: done
    schedule(() => {
      setState((s) => ({ ...s, phase: 'done' }));
    }, (elapsed += 300));
  }, [options, schedule, clearAllTimeouts]);

  const reset = useCallback(() => {
    clearAllTimeouts();
    setState(INITIAL_STATE);
  }, [clearAllTimeouts]);

  return { state, startReplay, reset };
}
