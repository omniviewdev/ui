import { forwardRef, type HTMLAttributes } from 'react';
import { LuColumns3 } from 'react-icons/lu';
import { cn } from '../../system/classnames';
import { useDataTableContext } from './context/DataTableContext';
import { IconButton } from '../icon-button';
import { Popover } from '../popover';
import { Checkbox } from '../checkbox';
import styles from './DataTable.module.css';

export type DataTableColumnVisibilityProps = HTMLAttributes<HTMLDivElement>;

export const DataTableColumnVisibility = forwardRef<HTMLDivElement, DataTableColumnVisibilityProps>(
  function DataTableColumnVisibility({ className, ...props }, ref) {
    const { table } = useDataTableContext();

    const allColumns = table.getAllLeafColumns().filter((col) => col.getCanHide());

    return (
      <div ref={ref} className={cn(styles.ColumnVisibility, className)} {...props}>
        <Popover.Root>
          <Popover.Trigger
            render={
              <IconButton
                dense
                variant="ghost"
                color="neutral"
                size="sm"
                aria-label="Toggle column visibility"
              >
                <LuColumns3 />
              </IconButton>
            }
          />
          <Popover.Portal>
            <Popover.Positioner sideOffset={4} side="bottom" align="end">
              <Popover.Popup variant="outline" size="sm">
                <Popover.Title>Columns</Popover.Title>
                <div className={styles.ColumnVisibilityList}>
                  {allColumns.map((column) => (
                    <Checkbox.Item
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={() => column.toggleVisibility()}
                      size="sm"
                      variant="soft"
                    >
                      {typeof column.columnDef.header === 'string'
                        ? column.columnDef.header
                        : column.id}
                    </Checkbox.Item>
                  ))}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);

DataTableColumnVisibility.displayName = 'DataTable.ColumnVisibility';
