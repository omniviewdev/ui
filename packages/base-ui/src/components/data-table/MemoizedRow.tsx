'use no memo';

import { memo, type ReactNode } from 'react';

interface MemoizedRowProps {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  isExpanded?: boolean;
  translateY?: number;
  'data-index'?: number;
}

function MemoizedRowInner(props: MemoizedRowProps) {
  const {
    children,
    className,
    isSelected,
    isExpanded,
    translateY,
    'data-index': dataIndex,
  } = props;

  return (
    <tr
      className={className}
      data-ov-selected={isSelected ? 'true' : 'false'}
      data-ov-expanded={isExpanded ? 'true' : 'false'}
      data-index={dataIndex}
      style={translateY !== undefined ? { transform: `translateY(${translateY}px)` } : undefined}
    >
      {children}
    </tr>
  );
}

export const MemoizedRow = memo(MemoizedRowInner, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.isExpanded === next.isExpanded &&
    prev.translateY === next.translateY &&
    prev.className === next.className &&
    prev['data-index'] === next['data-index'] &&
    prev.children === next.children
  );
});

MemoizedRow.displayName = 'DataTable.MemoizedRow';
