import { useRef, useCallback } from 'react';
import { Terminal, type TerminalHandle } from '@omniview/editors';
import type { ContainerDetail } from '../../types';

export interface LogsTabProps {
  container: ContainerDetail;
}

export function LogsTab({ container }: LogsTabProps) {
  const termRef = useRef<TerminalHandle>(null);

  const handleReady = useCallback(() => {
    const handle = termRef.current;
    if (!handle) return;
    handle.write(container.logs);
    handle.write('\r\n\x1b[90m─── end of logs ───\x1b[0m\r\n');
    handle.scrollToBottom();
  }, [container.logs]);

  return (
    <Terminal
      ref={termRef}
      onReady={handleReady}
      disableStdin
      convertEol={false}
      scrollback={10000}
      className={undefined}
      style={{ height: '100%' } as React.CSSProperties}
    />
  );
}
