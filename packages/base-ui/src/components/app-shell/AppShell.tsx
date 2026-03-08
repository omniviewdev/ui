import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../system/classnames';
import styles from './AppShell.module.css';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Width of the sidebar. Default: 240px. */
  sidebarWidth?: number | string;
  /** Whether the sidebar is collapsed. */
  sidebarCollapsed?: boolean;
  /** Position of the sidebar. Default: 'left'. */
  sidebarPosition?: 'left' | 'right';
  /** Height of the header. Default: 40px. */
  headerHeight?: number | string;
  /** Height of the footer. Default: 24px. */
  footerHeight?: number | string;
  children?: ReactNode;
}

export interface AppShellHeaderProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export interface AppShellSidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export interface AppShellContentProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export interface AppShellFooterProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const Header = forwardRef<HTMLElement, AppShellHeaderProps>(
  function Header({ className, ...props }, ref) {
    return <header ref={ref} className={cn(styles.Header, className)} {...props} />;
  },
);
Header.displayName = 'AppShell.Header';

const Sidebar = forwardRef<HTMLElement, AppShellSidebarProps>(
  function Sidebar({ className, ...props }, ref) {
    return <aside ref={ref} className={cn(styles.Sidebar, className)} {...props} />;
  },
);
Sidebar.displayName = 'AppShell.Sidebar';

const Content = forwardRef<HTMLElement, AppShellContentProps>(
  function Content({ className, ...props }, ref) {
    return <main ref={ref} className={cn(styles.Content, className)} {...props} />;
  },
);
Content.displayName = 'AppShell.Content';

const Footer = forwardRef<HTMLElement, AppShellFooterProps>(
  function Footer({ className, ...props }, ref) {
    return <footer ref={ref} className={cn(styles.Footer, className)} {...props} />;
  },
);
Footer.displayName = 'AppShell.Footer';

function formatSize(value: number | string | undefined, fallback: string): string {
  if (value == null) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

const AppShellRoot = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShellRoot(
    {
      className,
      style,
      sidebarWidth = 240,
      sidebarCollapsed = false,
      sidebarPosition = 'left',
      headerHeight = 40,
      footerHeight = 24,
      children,
      ...props
    },
    ref,
  ) {
    const mergedStyle: CSSProperties = {
      '--_ov-shell-sidebar-width': sidebarCollapsed ? '0px' : formatSize(sidebarWidth, '240px'),
      '--_ov-shell-header-height': formatSize(headerHeight, '40px'),
      '--_ov-shell-footer-height': formatSize(footerHeight, '24px'),
      ...style,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(styles.Root, className)}
        style={mergedStyle}
        data-ov-sidebar-position={sidebarPosition}
        data-ov-sidebar-collapsed={sidebarCollapsed || undefined}
        {...props}
      >
        {children}
      </div>
    );
  },
);

AppShellRoot.displayName = 'AppShell';

type AppShellCompound = typeof AppShellRoot & {
  Header: typeof Header;
  Sidebar: typeof Sidebar;
  Content: typeof Content;
  Footer: typeof Footer;
};

export const AppShell = Object.assign(AppShellRoot, {
  Header,
  Sidebar,
  Content,
  Footer,
}) as AppShellCompound;
