import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { forwardRef } from 'react';
import { withBaseClassName } from '../../system/classnames';
import { styleDataAttributes } from '../../system/styleProps';
import type { StyledComponentProps } from '../../system/types';
import styles from './Tabs.module.css';

export interface TabsRootProps extends BaseTabs.Root.Props, StyledComponentProps {}
export type TabsListProps = BaseTabs.List.Props;
export type TabsTabProps = BaseTabs.Tab.Props;
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
      {...styleDataAttributes({ variant, color, size })}
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
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Tab
      ref={ref}
      className={withBaseClassName<BaseTabs.Tab.State>(styles.Tab, className)}
      {...props}
    />
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
