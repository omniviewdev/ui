import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { forwardRef, type ReactNode } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Tabs.module.css';

export type TabsVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'flat';

export interface TabsRootProps extends BaseTabs.Root.Props, Omit<StyledComponentProps, 'variant'> {
  variant?: TabsVariant;
}
export type TabsListProps = BaseTabs.List.Props;
export type TabsTabProps = BaseTabs.Tab.Props & {
  /** Slot rendered after the tab label (e.g. Badge, icon, count) */
  endDecorator?: ReactNode;
};
export type TabsPanelProps = BaseTabs.Panel.Props;
export type TabsIndicatorProps = BaseTabs.Indicator.Props;

const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  { className, variant, color, size, ...props },
  ref,
) {
  return (
    <BaseTabs.Root
      ref={ref}
      className={withBaseClassName<BaseTabs.Root.State>(styles.Root, className)}
      {...styleDataAttributes({ variant: variant as StyledComponentProps['variant'], color, size })}
      {...props}
    />
  );
});

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.List
      ref={ref}
      className={withBaseClassName<BaseTabs.List.State>(styles.List, className)}
      {...props}
    />
  );
});

const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(function TabsTab(
  { className, endDecorator, children, ...props },
  ref,
) {
  return (
    <BaseTabs.Tab
      ref={ref}
      className={withBaseClassName<BaseTabs.Tab.State>(styles.Tab, className)}
      {...props}
    >
      {children}
      {endDecorator != null && <span className={styles.TabDecorator}>{endDecorator}</span>}
    </BaseTabs.Tab>
  );
});

const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Panel
      ref={ref}
      className={withBaseClassName<BaseTabs.Panel.State>(styles.Panel, className)}
      {...props}
    />
  );
});

const TabsIndicator = forwardRef<HTMLDivElement, TabsIndicatorProps>(function TabsIndicator(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Indicator
      ref={ref}
      className={withBaseClassName<BaseTabs.Indicator.State>(styles.Indicator, className)}
      {...props}
    />
  );
});

type TabsCompound = typeof TabsRoot & {
  Root: typeof TabsRoot;
  List: typeof TabsList;
  Tab: typeof TabsTab;
  Panel: typeof TabsPanel;
  Indicator: typeof TabsIndicator;
};

export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
  Indicator: TabsIndicator,
}) as TabsCompound;
