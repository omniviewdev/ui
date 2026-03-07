'use no memo';

import { memo, type ReactNode } from 'react';

interface MemoizedBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper that prevents body re-renders during column resizing.
 * Column widths update via CSS variables so no React re-render is needed.
 */
function MemoizedBodyInner({ children, className }: MemoizedBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export const MemoizedBody = memo(MemoizedBodyInner, (prev, next) => {
  // Only re-render if children identity changes (data updates)
  return prev.children === next.children && prev.className === next.className;
});

MemoizedBody.displayName = 'DataTable.MemoizedBody';
