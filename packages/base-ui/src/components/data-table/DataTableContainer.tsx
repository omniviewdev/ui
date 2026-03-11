import { forwardRef, useCallback, useState, type CSSProperties, type HTMLAttributes } from 'react';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import { ScrollElementProvider } from './context/DataTableContext';
import { useColumnSizeVars } from './hooks/useColumnSizeVars';
import styles from './DataTable.module.css';

export interface DataTableContainerProps extends HTMLAttributes<HTMLDivElement> {
  height?: number | string;
  maxHeight?: number | string;
}

function toDimension(value?: number | string): string | undefined {
  if (typeof value === 'number') return `${value}px`;
  return value;
}

export const DataTableContainer = forwardRef<HTMLDivElement, DataTableContainerProps>(
  function DataTableContainer({ className, height, maxHeight, style, children, ...props }, ref) {
    const { table } = useDataTableContext();
    const columnSizeVars = useColumnSizeVars(table);
    const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

    // Callback ref: sets both the state (triggers re-render for virtualizer)
    // and forwards to the consumer's ref.
    const callbackRef = useCallback(
      (node: HTMLDivElement | null) => {
        setScrollElement(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const containerStyle: CSSProperties = {
      '--_dt-height': toDimension(height),
      '--_dt-max-height': toDimension(maxHeight),
      ...style,
    } as CSSProperties;

    return (
      <div
        ref={callbackRef}
        className={cn(styles.Container, className)}
        style={containerStyle}
        {...props}
      >
        <ScrollElementProvider element={scrollElement}>
          <table
            role="table"
            className={styles.Table}
            style={{ ...columnSizeVars } as CSSProperties} // eslint-disable-line react/forbid-component-props -- TanStack Table column size CSS variable injection
          >
            {children}
          </table>
        </ScrollElementProvider>
      </div>
    );
  },
);

DataTableContainer.displayName = 'DataTable.Container';
