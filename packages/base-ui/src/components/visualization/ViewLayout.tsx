import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../button/Button';
import { Grid } from '../grid/Grid';
import { cn } from '../../system/classnames';
import styles from './ViewLayout.module.css';

/** Presentation geometry only, not a persisted saved-view document. */
export interface ViewLayoutItem {
  id: string;
  title: string;
  columnSpan: number;
  rowSpan: number;
}
export interface ViewLayoutProps<TItem extends ViewLayoutItem = ViewLayoutItem> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  items: readonly TItem[];
  onItemsChange: (items: TItem[]) => void;
  renderItem: (item: TItem) => ReactNode;
  onConfigure?: (id: string) => void;
  editing?: boolean;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  rowHeight?: number;
  maxRowSpan?: number;
  emptyContent?: ReactNode;
}

interface LayoutPanelProps<TItem extends ViewLayoutItem> {
  item: TItem;
  index: number;
  count: number;
  editing: boolean;
  columns: number;
  rowHeight: number;
  maxRowSpan: number;
  renderItem: (item: TItem) => ReactNode;
  onMove: (id: string, target: number) => void;
  onResize: (id: string, columns: number, rows: number) => void;
  onRemove: (id: string) => void;
  onConfigure?: (id: string) => void;
}
function LayoutPanel<TItem extends ViewLayoutItem>({
  item,
  index,
  count,
  editing,
  columns,
  rowHeight,
  maxRowSpan,
  renderItem,
  onMove,
  onResize,
  onRemove,
  onConfigure,
}: LayoutPanelProps<TItem>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !editing,
  });
  const titleId = useId();
  const resizeHelpId = useId();
  const resize = useRef<{
    x: number;
    y: number;
    columns: number;
    rows: number;
    columnWidth: number;
  } | null>(null);
  const columnSpan = Math.max(1, Math.min(columns, item.columnSpan));
  const rowSpan = Math.max(1, Math.min(maxRowSpan, item.rowSpan));
  const geometryVariables = {
    '--_ov-view-row-span': rowSpan,
    '--_ov-view-drag-transform': CSS.Transform.toString(transform) ?? 'none',
    '--_ov-view-drag-transition': transition ?? 'none',
  } as CSSProperties;
  return (
    <Grid.Item
      ref={setNodeRef}
      span={columnSpan}
      rowSpan={rowSpan}
      style={geometryVariables}
      className={styles.Item}
      data-ov-dragging={isDragging || undefined}
    >
      <article aria-labelledby={titleId} className={styles.Panel}>
        <header className={styles.Header}>
          <h3 id={titleId}>{item.title}</h3>
          {editing && (
            <div
              className={styles.Controls}
              role="group"
              aria-label={`${item.title} layout controls`}
            >
              <Button
                type="button"
                size="xs"
                variant="ghost"
                {...attributes}
                {...listeners}
                aria-label={`Drag ${item.title}`}
                className={styles.Drag}
              >
                Drag
              </Button>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-label={`Move ${item.title} earlier`}
                disabled={index === 0}
                onClick={() => onMove(item.id, index - 1)}
              >
                Earlier
              </Button>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-label={`Move ${item.title} later`}
                disabled={index === count - 1}
                onClick={() => onMove(item.id, index + 1)}
              >
                Later
              </Button>
              {onConfigure && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  aria-label={`Configure ${item.title}`}
                  onClick={() => onConfigure(item.id)}
                >
                  Configure
                </Button>
              )}
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-label={`Remove ${item.title}`}
                onClick={() => onRemove(item.id)}
              >
                Remove
              </Button>
            </div>
          )}
        </header>
        <div className={styles.Content}>{renderItem(item)}</div>
        {editing && (
          <footer className={styles.Footer}>
            <span>
              {columnSpan} / {columns} columns · {rowSpan} rows
            </span>
            <span id={resizeHelpId} className={styles.SrOnly}>
              Arrow keys change width and height. Drag to resize.
            </span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className={styles.Resize}
              aria-label={`Resize ${item.title}`}
              aria-describedby={resizeHelpId}
              onKeyDown={(event) => {
                const dx = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                const dy = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
                if (dx || dy) {
                  event.preventDefault();
                  onResize(
                    item.id,
                    Math.max(1, Math.min(columns, columnSpan + dx)),
                    Math.max(1, Math.min(maxRowSpan, rowSpan + dy)),
                  );
                }
              }}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                const panel = event.currentTarget.closest('article');
                if (!panel) return;
                resize.current = {
                  x: event.clientX,
                  y: event.clientY,
                  columns: columnSpan,
                  rows: rowSpan,
                  columnWidth: panel.getBoundingClientRect().width / columnSpan,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const start = resize.current;
                if (!start || start.columnWidth <= 0) return;
                const nextColumns = Math.max(
                  1,
                  Math.min(
                    columns,
                    start.columns + Math.round((event.clientX - start.x) / start.columnWidth),
                  ),
                );
                const nextRows = Math.max(
                  1,
                  Math.min(
                    maxRowSpan,
                    start.rows + Math.round((event.clientY - start.y) / rowHeight),
                  ),
                );
                if (nextColumns !== columnSpan || nextRows !== rowSpan)
                  onResize(item.id, nextColumns, nextRows);
              }}
              onPointerUp={() => {
                resize.current = null;
              }}
              onPointerCancel={() => {
                resize.current = null;
              }}
              onLostPointerCapture={() => {
                resize.current = null;
              }}
            >
              Resize
            </Button>
          </footer>
        )}
      </article>
    </Grid.Item>
  );
}

/**
 * Controlled, keyed layout with pointer and keyboard arrangement. Renderers own
 * acquisition/lifetimes; preview does not silently unmount panels or pause data.
 */
export function ViewLayout<TItem extends ViewLayoutItem>({
  items,
  onItemsChange,
  renderItem,
  onConfigure,
  editing = false,
  columns = 12,
  rowHeight = 120,
  maxRowSpan = 12,
  emptyContent,
  className,
  ...props
}: ViewLayoutProps<TItem>) {
  const [announcement, setAnnouncement] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const move = (id: string, target: number) => {
    const source = items.findIndex((item) => item.id === id);
    if (source < 0 || target < 0 || target >= items.length || target === source) return;
    const next = [...items];
    const [item] = next.splice(source, 1);
    if (!item) return;
    next.splice(target, 0, item);
    onItemsChange(next);
    setAnnouncement(`${item.title} moved to position ${target + 1}`);
  };
  return (
    <div {...props} className={cn(styles.Root, className)} data-ov-editing={editing}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (editing && over)
            move(
              String(active.id),
              items.findIndex((item) => item.id === over.id),
            );
        }}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <Grid
            columns={columns}
            spacing={3}
            className={styles.Grid}
            style={{ '--_ov-view-row-height': `${rowHeight}px` } as CSSProperties}
          >
            {items.map((item, index) => (
              <LayoutPanel
                key={item.id}
                item={item}
                index={index}
                count={items.length}
                editing={editing}
                columns={columns}
                rowHeight={rowHeight}
                maxRowSpan={maxRowSpan}
                renderItem={renderItem}
                onConfigure={onConfigure}
                onMove={move}
                onResize={(id, columnSpan, rowSpan) => {
                  onItemsChange(
                    items.map((current) =>
                      current.id === id ? { ...current, columnSpan, rowSpan } : current,
                    ),
                  );
                  setAnnouncement(
                    `${item.title} resized to ${columnSpan} columns and ${rowSpan} rows`,
                  );
                }}
                onRemove={(id) => {
                  onItemsChange(items.filter((current) => current.id !== id));
                  setAnnouncement(`${item.title} removed`);
                }}
              />
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
      {items.length === 0 && (emptyContent ?? <p>No components. Add a component to begin.</p>)}
      <p role="status" aria-live="polite" className={styles.SrOnly}>
        {announcement}
      </p>
    </div>
  );
}
