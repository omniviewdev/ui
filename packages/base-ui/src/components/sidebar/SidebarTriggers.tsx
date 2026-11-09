import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { forwardRef, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../system/classnames';
import { Tooltip } from '../tooltip';
import { useSidebarContext, useSidebarTrigger } from './context';
import { ChevronRightIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from './icons';
import { useIsApplePlatform } from './shortcut';
import type { SidebarHandleProps, SidebarToggleProps, SidebarTriggerProps } from './types';
import styles from './Sidebar.module.css';

const TOOLTIP_DELAY = 280;

/**
 * Unstyled sidebar button. Renders a `<button>` by default; pass `render={<IconButton />}` (or
 * any button component) to compose it. Works outside the root when given a `controller`.
 */
export function SidebarTrigger({ controller, render, children, ...rest }: SidebarTriggerProps) {
  const trigger = useSidebarTrigger(controller);
  const defaults = {
    ...trigger.props,
    'data-ov-sidebar-trigger': '',
    children: trigger.expanded ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />,
  };
  const overrides = children === undefined ? rest : { ...rest, children };
  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(defaults, overrides),
  });
}

/** Edge handle that straddles the panel border. Revealed by hover and keyboard focus. */
export const SidebarHandle = forwardRef<HTMLButtonElement, SidebarHandleProps>(
  function SidebarHandle({ className, onClick, children, ...rest }, ref) {
    const trigger = useSidebarTrigger();
    const { panelElement } = useSidebarContext('Sidebar.Handle');
    if (!panelElement) return null;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) trigger.toggle();
    };

    return createPortal(
      <button
        {...trigger.props}
        {...rest}
        ref={ref}
        className={cn(styles.Handle, className)}
        data-ov-sidebar-handle=""
        data-ov-sidebar-trigger=""
        onClick={handleClick}
      >
        {children ?? <ChevronRightIcon className={styles.HandleIcon} />}
      </button>,
      panelElement,
    );
  },
);

/** Footer row that toggles the sidebar. Icon only in the rail, with a label tooltip. */
export const SidebarToggle = forwardRef<HTMLButtonElement, SidebarToggleProps>(
  function SidebarToggle({ showShortcut, className, onClick, children, ...rest }, ref) {
    const trigger = useSidebarTrigger();
    const apple = useIsApplePlatform();
    const hint = apple ? '⌘B' : 'Ctrl+B';
    const showHint = showShortcut ?? trigger.shortcut;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) trigger.toggle();
    };

    return (
      <Tooltip.Root disabled={!trigger.collapsed}>
        <Tooltip.Trigger
          delay={TOOLTIP_DELAY}
          render={
            <button
              {...trigger.props}
              {...rest}
              ref={ref}
              className={cn(styles.Toggle, className)}
              data-ov-sidebar-toggle=""
              data-ov-sidebar-trigger=""
              onClick={handleClick}
            >
              <span className={styles.ToggleIcon}>
                {trigger.expanded ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
              </span>
              <span className={styles.ToggleLabel}>{children ?? trigger.text}</span>
              {showHint ? (
                <kbd className={styles.ShortcutHint} aria-hidden="true">
                  {hint}
                </kbd>
              ) : null}
            </button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner side="right" sideOffset={8}>
            <Tooltip.Popup className={styles.TooltipContent}>
              {trigger.label}
              {showHint ? (
                <kbd className={styles.ShortcutHint} aria-hidden="true">
                  {hint}
                </kbd>
              ) : null}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  },
);

SidebarTrigger.displayName = 'Sidebar.Trigger';
SidebarHandle.displayName = 'Sidebar.Handle';
SidebarToggle.displayName = 'Sidebar.Toggle';
