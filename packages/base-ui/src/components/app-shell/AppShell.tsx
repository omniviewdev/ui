import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
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
  /** Width of the nav rail. Default: 48px. Only used when NavRail is present. */
  navRailWidth?: number | string;
  /** Width of the secondary sidebar. Default: 300px. */
  secondarySidebarWidth?: number | string;
  /** Whether the secondary sidebar is collapsed. */
  secondarySidebarCollapsed?: boolean;
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

export interface AppShellNavRailProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export interface AppShellSecondarySidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const AppShellContext = createContext({
  sidebarCollapsed: false,
  secondarySidebarCollapsed: false,
});

const Header = forwardRef<HTMLElement, AppShellHeaderProps>(
  function Header({ className, ...props }, ref) {
    return <header ref={ref} className={cn(styles.Header, className)} {...props} />;
  },
);
Header.displayName = 'AppShell.Header';

const Sidebar = forwardRef<HTMLElement, AppShellSidebarProps>(
  function Sidebar({ className, ...props }, ref) {
    const { sidebarCollapsed } = useContext(AppShellContext);
    return (
      <aside
        ref={ref}
        className={cn(styles.Sidebar, className)}
        aria-hidden={sidebarCollapsed || undefined}
        inert={sidebarCollapsed || undefined}
        {...props}
      />
    );
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

const NavRail = forwardRef<HTMLElement, AppShellNavRailProps>(
  function NavRail({ className, ...props }, ref) {
    return <nav ref={ref} className={cn(styles.NavRail, className)} {...props} />;
  },
);
NavRail.displayName = 'AppShell.NavRail';

const SecondarySidebar = forwardRef<HTMLElement, AppShellSecondarySidebarProps>(
  function SecondarySidebar({ className, ...props }, ref) {
    const { secondarySidebarCollapsed } = useContext(AppShellContext);
    return (
      <aside
        ref={ref}
        className={cn(styles.SecondarySidebar, className)}
        aria-hidden={secondarySidebarCollapsed || undefined}
        inert={secondarySidebarCollapsed || undefined}
        {...props}
      />
    );
  },
);
SecondarySidebar.displayName = 'AppShell.SecondarySidebar';

const CSS_SIZE_RE = /^(\d+\.?\d*)(px|rem|em|%|vh|vw|dvh|dvw|ch|ex|svh|svw|lvh|lvw)$|^(auto|max-content|min-content|fit-content)$/;

/**
 * Convert a size prop to a CSS value string.
 *
 * - Numbers are treated as px (e.g. `240` → `"240px"`).
 * - Strings that match a recognised CSS unit (`px`, `rem`, `em`, `%`,
 *   `vh`, `vw`, `dvh`, `dvw`, `ch`, `ex`, `svh`, `svw`, `lvh`, `lvw`)
 *   or keyword (`auto`, `max-content`, `min-content`, `fit-content`)
 *   are passed through unchanged.
 * - Invalid strings fall back to the provided `fallback` value.
 */
function formatSize(value: number | string | undefined, fallback: string): string {
  if (value == null) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? `${value}px` : fallback;
  return CSS_SIZE_RE.test(value) ? value : fallback;
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
      navRailWidth = 48,
      secondarySidebarWidth = 300,
      secondarySidebarCollapsed = false,
      children,
      ...props
    },
    ref,
  ) {
    const mergedStyle: CSSProperties = {
      '--_ov-shell-sidebar-width': sidebarCollapsed ? '0px' : formatSize(sidebarWidth, '240px'),
      '--_ov-shell-header-height': formatSize(headerHeight, '40px'),
      '--_ov-shell-footer-height': formatSize(footerHeight, '24px'),
      '--_ov-shell-nav-rail-width': formatSize(navRailWidth, '48px'),
      '--_ov-shell-secondary-sidebar-width': secondarySidebarCollapsed ? '0px' : formatSize(secondarySidebarWidth, '300px'),
      ...style,
    } as CSSProperties;

    const contextValue = useMemo(
      () => ({ sidebarCollapsed, secondarySidebarCollapsed }),
      [sidebarCollapsed, secondarySidebarCollapsed],
    );

    return (
      <AppShellContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(styles.Root, className)}
          style={mergedStyle}
          data-ov-sidebar-position={sidebarPosition}
          data-ov-sidebar-collapsed={sidebarCollapsed || undefined}
          data-ov-secondary-sidebar-collapsed={secondarySidebarCollapsed || undefined}
          {...props}
        >
          {children}
        </div>
      </AppShellContext.Provider>
    );
  },
);

AppShellRoot.displayName = 'AppShell';

type AppShellCompound = typeof AppShellRoot & {
  Header: typeof Header;
  Sidebar: typeof Sidebar;
  Content: typeof Content;
  Footer: typeof Footer;
  NavRail: typeof NavRail;
  SecondarySidebar: typeof SecondarySidebar;
};

export const AppShell = Object.assign(AppShellRoot, {
  Header,
  Sidebar,
  Content,
  Footer,
  NavRail,
  SecondarySidebar,
}) as AppShellCompound;
