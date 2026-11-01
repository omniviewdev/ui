import { useEffect, useRef, useState } from 'react';
import { ResizableSplitPane } from '../resizable-split-pane';
import { Tooltip } from '../tooltip';
import { Button } from '../button';
import { SearchInput } from '../search-input';
import { FileTree } from './FileTree';
import type { FileExplorerProps } from './types';
import styles from './FileExplorer.module.css';

export function FileExplorer<TMetadata = unknown>({
  sourceLabel,
  contextPanel,
  toolbarActions,
  actions,
  preview,
  previewVisible,
  defaultPreviewVisible = true,
  onPreviewVisibleChange,
  onFilterTextChange,
  onShowHiddenChange,
  defaultTreeSize = 320,
  sync,
  status,
  emptyPreview,
  selectedKeys,
  defaultSelectedKeys,
  onSelectedKeysChange,
  filterText,
  showHidden,
  className,
  style,
  ...treeProps
}: FileExplorerProps<TMetadata>) {
  const [localSelection, setLocalSelection] = useState<ReadonlySet<string>>(
    () => new Set(defaultSelectedKeys),
  );
  const [localFilter, setLocalFilter] = useState('');
  const [localHidden, setLocalHidden] = useState(false);
  const [localPreview, setLocalPreview] = useState(defaultPreviewVisible);
  const [narrow, setNarrow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width !== undefined && width > 0) setNarrow(width <= 600);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const selection = selectedKeys ?? localSelection;
  const query = filterText ?? localFilter;
  const hidden = showHidden ?? localHidden;
  const visible = previewVisible ?? localPreview;
  const selectedId = selection.values().next().value;
  const selected =
    selectedId === undefined
      ? null
      : (treeProps.nodes.find((node) => node.id === selectedId) ?? null);
  const hasPreview = preview !== undefined || emptyPreview !== undefined;
  const tree = (
    <FileTree
      {...treeProps}
      selectedKeys={selection}
      filterText={query}
      showHidden={hidden}
      onSelectedKeysChange={(keys) => {
        if (selectedKeys === undefined) setLocalSelection(keys);
        onSelectedKeysChange?.(keys);
      }}
    />
  );
  return (
    <div
      ref={rootRef}
      className={[styles.explorer, className].filter(Boolean).join(' ')}
      style={style}
      data-narrow={narrow || undefined}
    >
      <div className={styles.toolbar} role="toolbar" aria-label="File explorer">
        {sourceLabel && <span className={styles.source}>{sourceLabel}</span>}
        <SearchInput
          className={styles.search}
          size="sm"
          role="searchbox"
          aria-label="Search loaded files"
          placeholder="Search files"
          value={query}
          onValueChange={(value) => {
            if (filterText === undefined) setLocalFilter(value);
            onFilterTextChange?.(value);
          }}
        />
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={hidden}
          onClick={() => {
            if (showHidden === undefined) setLocalHidden(!hidden);
            onShowHiddenChange?.(!hidden);
          }}
        >
          Hidden
        </Button>
        {hasPreview && (
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={visible}
            onClick={() => {
              if (previewVisible === undefined) setLocalPreview(!visible);
              onPreviewVisibleChange?.(!visible);
            }}
          >
            Preview
          </Button>
        )}
        {actions?.map((action) => {
          const reason =
            action.capability.status === 'unavailable'
              ? action.capability.reason
              : action.capability.status === 'unknown'
                ? 'Availability unknown'
                : undefined;
          const button = (
            <Button
              size="sm"
              variant="ghost"
              disabled={!!reason}
              aria-label={reason ? `${action.label}: ${reason}` : action.label}
              onClick={() => void action.onSelect(selected)}
            >
              {action.icon}
              {action.label}
            </Button>
          );
          return reason ? (
            <Tooltip.Root key={action.id}>
              <Tooltip.Trigger
                render={
                  <span
                    className={styles.disabledAction}
                    tabIndex={0}
                    aria-label={`${action.label}: ${reason}`}
                  />
                }
              >
                {button}
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner>
                  <Tooltip.Popup>{reason}</Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : (
            <span key={action.id}>{button}</span>
          );
        })}
        {toolbarActions}
      </div>
      <div className={styles.workbench}>
        {contextPanel && <div className={styles.context}>{contextPanel}</div>}
        <div className={styles.body}>
          {hasPreview && visible ? (
            <ResizableSplitPane
              key={narrow ? 'vertical' : 'horizontal'}
              direction={narrow ? 'vertical' : 'horizontal'}
              defaultSize={narrow ? 200 : defaultTreeSize}
              minSize={narrow ? 100 : 160}
              handleLabel="Resize file tree"
            >
              {tree}
              <div className={styles.previewPane}>
                {selected && preview ? preview(selected) : emptyPreview}
              </div>
            </ResizableSplitPane>
          ) : (
            tree
          )}
        </div>
      </div>
      {(sync || status) && (
        <div className={styles.status}>
          <span role="status">{status}</span>
          {sync && (
            <>
              <label
                className={styles.sync}
                title={sync.available === false ? 'Live sync unavailable' : undefined}
              >
                <input
                  type="checkbox"
                  checked={sync.enabled}
                  disabled={sync.available === false}
                  aria-label={sync.available === false ? 'Live sync unavailable' : 'Live sync'}
                  onChange={(event) => sync.onEnabledChange(event.target.checked)}
                />
                Live sync
              </label>
              <span role="status">
                {sync.status === 'refreshing'
                  ? 'Refreshing…'
                  : sync.status === 'offline'
                    ? 'Live sync interrupted'
                    : sync.status === 'stale'
                      ? sync.enabled
                        ? 'Live sync interrupted'
                        : 'Refresh needed'
                      : !sync.enabled && sync.pendingChanges > 0
                        ? `${sync.pendingChanges} ${sync.pendingChanges === 1 ? 'update' : 'updates'} available`
                        : null}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={sync.status === 'refreshing'}
                onClick={() => void sync.onRefresh()}
              >
                Refresh
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
