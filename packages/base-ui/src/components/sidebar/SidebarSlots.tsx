import { forwardRef } from 'react';
import { cn } from '../../system/classnames';
import { useSidebarContext } from './context';
import type { SidebarSectionProps, SidebarSlotProps } from './types';
import styles from './Sidebar.module.css';

/** Identity card pinned above the navigation. Its chrome fades away in the rail. */
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarSectionProps>(function SidebarHeader(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Header, className)}
      data-ov-sidebar-part="header"
      {...props}
    />
  );
});

/** The flexible region between header and footer. Only navigation inside it scrolls. */
export const SidebarContent = forwardRef<HTMLDivElement, SidebarSectionProps>(
  function SidebarContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(styles.Content, className)}
        data-ov-sidebar-part="content"
        {...props}
      />
    );
  },
);

/** Shell controls that stay visible however short the window is. */
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarSectionProps>(function SidebarFooter(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(styles.Footer, className)}
      data-ov-sidebar-part="footer"
      {...props}
    />
  );
});

/** Shown while the labels are visible (expanded or peeking). Inert and collapsed in the rail. */
export const SidebarExpanded = forwardRef<HTMLDivElement, SidebarSlotProps>(
  function SidebarExpanded({ className, children, ...props }, ref) {
    const { collapsed } = useSidebarContext('Sidebar.Expanded');
    return (
      <div
        ref={ref}
        className={cn(styles.Slot, className)}
        data-ov-sidebar-slot="expanded"
        data-ov-hidden={collapsed ? 'true' : 'false'}
        inert={collapsed || undefined}
        aria-hidden={collapsed || undefined}
        {...props}
      >
        <div className={styles.SlotInner}>{children}</div>
      </div>
    );
  },
);

/** Shown only in the icon rail. Inert and collapsed whenever the labels are visible. */
export const SidebarRail = forwardRef<HTMLDivElement, SidebarSlotProps>(function SidebarRail(
  { className, children, ...props },
  ref,
) {
  const { collapsed } = useSidebarContext('Sidebar.Rail');
  return (
    <div
      ref={ref}
      className={cn(styles.Slot, styles.RailSlot, className)}
      data-ov-sidebar-slot="rail"
      data-ov-hidden={collapsed ? 'false' : 'true'}
      inert={!collapsed || undefined}
      aria-hidden={!collapsed || undefined}
      {...props}
    >
      <div className={styles.SlotInner}>{children}</div>
    </div>
  );
});

SidebarHeader.displayName = 'Sidebar.Header';
SidebarContent.displayName = 'Sidebar.Content';
SidebarFooter.displayName = 'Sidebar.Footer';
SidebarExpanded.displayName = 'Sidebar.Expanded';
SidebarRail.displayName = 'Sidebar.Rail';
