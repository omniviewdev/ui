import { createSidebarController } from './controller';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarRoot } from './SidebarRoot';
import {
  SidebarContent,
  SidebarExpanded,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from './SidebarSlots';
import { SidebarHandle, SidebarToggle, SidebarTrigger } from './SidebarTriggers';

type SidebarCompound = typeof SidebarRoot & {
  Root: typeof SidebarRoot;
  Header: typeof SidebarHeader;
  Content: typeof SidebarContent;
  Footer: typeof SidebarFooter;
  Expanded: typeof SidebarExpanded;
  Rail: typeof SidebarRail;
  Navigation: typeof SidebarNavigation;
  Trigger: typeof SidebarTrigger;
  Handle: typeof SidebarHandle;
  Toggle: typeof SidebarToggle;
  createController: typeof createSidebarController;
};

/**
 * Collapsible sidebar. `Sidebar.Root` reserves the sidebar width in the consumer's layout;
 * `expanded` shows labels, `rail` shows icons with tooltips and flyouts, and an opt-in hover
 * peek overlays the expanded panel without reflowing the content.
 */
export const Sidebar = Object.assign(SidebarRoot, {
  Root: SidebarRoot,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Expanded: SidebarExpanded,
  Rail: SidebarRail,
  Navigation: SidebarNavigation,
  Trigger: SidebarTrigger,
  Handle: SidebarHandle,
  Toggle: SidebarToggle,
  createController: createSidebarController,
}) as SidebarCompound;
