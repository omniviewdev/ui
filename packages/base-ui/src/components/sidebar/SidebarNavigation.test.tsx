import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import type { SidebarController } from './controller';
import { Sidebar } from './Sidebar';
import type { SidebarMode, SidebarNavigationProps } from './types';

interface Item {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /** A group that is also a destination. */
  selectable?: boolean;
  children?: Item[];
}

const items: Item[] = [
  { id: 'dash', label: 'Dashboard', icon: <span>icon:dash</span> },
  { id: 'events', label: 'Events' },
  {
    id: 'workload',
    label: 'Workload',
    children: [
      { id: 'pods', label: 'Pods' },
      { id: 'deploy', label: 'Deployments' },
    ],
  },
  {
    id: 'helm',
    label: 'Helm',
    selectable: true,
    children: [{ id: 'releases', label: 'Releases' }],
  },
  {
    id: 'other',
    label: 'Other API Groups',
    children: [
      {
        id: 'cert',
        label: 'cert-manager.io',
        children: [
          { id: 'certs', label: 'Certificates' },
          { id: 'issuers', label: 'Issuers' },
        ],
      },
      { id: 'argo', label: 'argoproj.io', children: [{ id: 'apps', label: 'Applications' }] },
    ],
  },
];

const itemKey = (item: Item) => item.id;
const getChildren = (item: Item) => item.children;
const getTextValue = (item: Item) => item.label;
const getIcon = (item: Item) => item.icon;
const getBadge = (item: Item) => item.badge;
const isSelectable = (item: Item) => !item.children?.length || item.selectable === true;

type NavProps = Partial<SidebarNavigationProps<Item>> & {
  mode?: SidebarMode;
  defaultMode?: SidebarMode;
  controller?: SidebarController;
};

function Nav({ mode, defaultMode, controller, ...props }: NavProps) {
  return (
    <Sidebar.Root
      aria-label="Cluster"
      mode={mode ?? (defaultMode ? undefined : 'rail')}
      defaultMode={defaultMode}
      controller={controller}
    >
      <Sidebar.Content>
        <Sidebar.Navigation
          aria-label="Resources"
          items={items}
          itemKey={itemKey}
          getChildren={getChildren}
          getTextValue={getTextValue}
          getIcon={getIcon}
          getBadge={getBadge}
          isItemSelectable={isSelectable}
          {...props}
        >
          <div role="tree" aria-label="Expanded tree" tabIndex={0}>
            <button type="button">Tree item</button>
          </div>
        </Sidebar.Navigation>
      </Sidebar.Content>
    </Sidebar.Root>
  );
}

const railButton = (name: string) => screen.getByRole('button', { name });
const flatten = (list: Item[]): Item[] =>
  list.flatMap((item) => [item, ...flatten(item.children ?? [])]);
const itemNamed = (id: string): Item => {
  const found = flatten(items).find((item) => item.id === id);
  if (!found) throw new Error(`No fixture item ${id}`);
  return found;
};

describe('Sidebar.Navigation presentations', () => {
  it('retains the expanded children and swaps inert layers across modes', () => {
    const { rerender } = renderWithTheme(<Nav mode="expanded" />);
    const tree = screen.getByRole('tree', { name: 'Expanded tree' });
    const expandedLayer = tree.closest('[data-ov-layer]');
    const railLayer = screen
      .getByRole('list', { name: 'Resources', hidden: true })
      .closest('[data-ov-layer]');
    expect(expandedLayer).toHaveAttribute('data-ov-layer', 'expanded');
    expect(expandedLayer).not.toHaveAttribute('inert');
    expect(railLayer).toHaveAttribute('inert');
    expect(railLayer).toHaveAttribute('aria-hidden', 'true');

    rerender(<Nav mode="rail" />);
    expect(expandedLayer).toHaveAttribute('inert');
    expect(expandedLayer).toHaveAttribute('aria-hidden', 'true');
    expect(railLayer).not.toHaveAttribute('inert');
    // Retained: the same node, not a remount that would lose scroll, expansion or edit state.
    expect(screen.getByRole('tree', { name: 'Expanded tree', hidden: true })).toBe(tree);

    rerender(<Nav mode="expanded" />);
    expect(screen.getByRole('tree', { name: 'Expanded tree' })).toBe(tree);
  });

  it('builds no flyout nodes until a group opens', () => {
    renderWithTheme(<Nav />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByText('Certificates')).not.toBeInTheDocument();
    expect(screen.queryByText('Pods')).not.toBeInTheDocument();
  });
});

describe('Sidebar.Navigation rail', () => {
  it('keeps changing badge counts in the row description', () => {
    const { rerender } = renderWithTheme(
      <Nav getBadge={(item) => (item.id === 'events' ? 3 : null)} />,
    );
    expect(screen.getByRole('button', { name: 'Events', description: '3' })).toBeEnabled();
    rerender(<Nav getBadge={(item) => (item.id === 'events' ? 4 : null)} />);
    expect(screen.getByRole('button', { name: 'Events', description: '4' })).toBeEnabled();
  });

  it('puts the tab stop on the row that is or contains the selection', () => {
    renderWithTheme(<Nav selectedKey="certs" />);
    expect(railButton('Other API Groups').tabIndex).toBe(0);
    expect(railButton('Dashboard').tabIndex).toBe(-1);
  });

  it('marks the current destination and the groups that contain it', () => {
    const { rerender } = renderWithTheme(<Nav selectedKey="dash" />);
    expect(railButton('Dashboard')).toHaveAttribute('aria-current', 'page');
    expect(railButton('Dashboard')).toHaveAttribute('data-ov-selected', 'true');
    expect(railButton('Workload')).not.toHaveAttribute('data-ov-has-selected');

    rerender(<Nav selectedKey="certs" />);
    expect(railButton('Dashboard')).not.toHaveAttribute('aria-current');
    const group = railButton('Other API Groups');
    expect(group).toHaveAttribute('data-ov-has-selected', 'true');
    expect(group).not.toHaveAttribute('data-ov-selected');
    expect(group).not.toHaveAttribute('aria-current');

    rerender(<Nav selectedKey="helm" />);
    expect(railButton('Helm')).toHaveAttribute('data-ov-selected', 'true');
    expect(railButton('Helm')).toHaveAttribute('data-ov-has-selected', 'true');
  });

  it('opens a flyout for a group, never acts for the group, and acts for its leaves', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithTheme(<Nav onAction={onAction} />);

    await user.click(railButton('Workload'));
    const menu = await screen.findByRole('menu', { name: 'Workload' });
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((row) => row.textContent),
    ).toEqual(['Pods', 'Deployments']);
    expect(onAction).not.toHaveBeenCalled();
    expect(railButton('Workload')).toHaveAttribute('aria-haspopup', 'menu');
    expect(railButton('Workload')).toHaveAttribute('aria-expanded', 'true');

    await user.click(within(menu).getByRole('menuitem', { name: 'Pods' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('pods', itemNamed('pods'));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it.each(['pointer', 'keyboard'] as const)(
    'replaces a %s-opened flyout when another group is hovered',
    async (input) => {
      const user = userEvent.setup();
      renderWithTheme(<Nav />);
      if (input === 'pointer') await user.click(railButton('Workload'));
      else {
        act(() => railButton('Workload').focus());
        await user.keyboard('{ArrowRight}');
      }
      await screen.findByRole('menu', { name: 'Workload' });
      await user.hover(railButton('Helm'));
      await screen.findByRole('menu', { name: 'Helm' });
      expect(screen.getAllByRole('menu')).toHaveLength(1);
      expect(railButton('Workload')).toHaveAttribute('aria-expanded', 'false');
      expect(railButton('Helm')).toHaveAttribute('aria-expanded', 'true');
      await user.hover(railButton('Workload'));
      await screen.findByRole('menu', { name: 'Workload' });
      expect(screen.getAllByRole('menu')).toHaveLength(1);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
      expect(railButton('Workload')).toHaveFocus();
    },
  );

  it('lists a selectable group as its own first row and marks it current', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithTheme(<Nav selectedKey="helm" onAction={onAction} />);

    await user.click(railButton('Helm'));
    const menu = await screen.findByRole('menu', { name: 'Helm' });
    const [first, second] = within(menu).getAllByRole('menuitem');
    expect(first).toHaveTextContent('Open Helm');
    expect(first).toHaveAttribute('aria-current', 'page');
    expect(second).toHaveTextContent('Releases');
    expect(second).not.toHaveAttribute('aria-current');

    await user.click(first as HTMLElement);
    expect(onAction).toHaveBeenCalledWith('helm', itemNamed('helm'));
  });

  it('adds no Open row for a group that is not a destination, and honors a custom label', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithTheme(<Nav />);
    await user.click(railButton('Workload'));
    const menu = await screen.findByRole('menu', { name: 'Workload' });
    expect(within(menu).queryByRole('menuitem', { name: /^Open/ })).not.toBeInTheDocument();
    unmount();

    renderWithTheme(<Nav getOpenLabel={(item) => `Visit ${item.label}`} />);
    await user.click(railButton('Helm'));
    const helm = await screen.findByRole('menu', { name: 'Helm' });
    expect(within(helm).getByRole('menuitem', { name: 'Visit Helm' })).toBeInTheDocument();
  });

  it('expands nested groups in place across three levels and mounts children lazily', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderWithTheme(<Nav onAction={onAction} />);

    await user.click(railButton('Other API Groups'));
    const menu = await screen.findByRole('menu', { name: 'Other API Groups' });
    const cert = within(menu).getByRole('menuitem', { name: 'cert-manager.io' });
    expect(cert).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Certificates')).not.toBeInTheDocument();
    expect(screen.queryByText('Applications')).not.toBeInTheDocument();

    await user.click(cert);
    expect(cert).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('menuitem', { name: 'Certificates' })).toBeInTheDocument();
    expect(screen.queryByText('Applications')).not.toBeInTheDocument();
    expect(onAction).not.toHaveBeenCalled();
    // Expanding a group never closes the flyout.
    expect(screen.getByRole('menu', { name: 'Other API Groups' })).toBe(menu);

    await user.click(within(menu).getByRole('menuitem', { name: 'Certificates' }));
    expect(onAction).toHaveBeenCalledWith('certs', itemNamed('certs'));
  });

  it('starts with the path to the selection expanded inside the flyout', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Nav selectedKey="certs" />);

    await user.click(railButton('Other API Groups'));
    const menu = await screen.findByRole('menu', { name: 'Other API Groups' });
    expect(within(menu).getByRole('menuitem', { name: 'Certificates' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(menu).queryByRole('menuitem', { name: 'Applications' })).not.toBeInTheDocument();
  });

  it('disables rows from disabledKeys and skips them while roving', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Nav disabledKeys={['events', 'workload']} />);
    expect(railButton('Events')).toBeDisabled();
    expect(railButton('Workload')).toBeDisabled();

    act(() => railButton('Dashboard').focus());
    await user.keyboard('{ArrowDown}');
    expect(railButton('Helm')).toHaveFocus();

    await user.click(railButton('Workload'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not replace a clicked flyout when a disabled group is hovered', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Nav disabledKeys={['workload']} />);
    await user.click(railButton('Helm'));
    await screen.findByRole('menu', { name: 'Helm' });
    await user.hover(railButton('Workload'));
    await act(async () => {
      const { promise, resolve } = Promise.withResolvers<void>();
      setTimeout(resolve, 500);
      await promise;
    });
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(screen.getByRole('menu', { name: 'Helm' })).toBeInTheDocument();
    expect(railButton('Workload')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Sidebar.Navigation rail keyboard', () => {
  it('roves with the arrow keys, Home and End, keeping a single tab stop', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Nav />);

    act(() => railButton('Dashboard').focus());
    await user.keyboard('{ArrowDown}');
    expect(railButton('Events')).toHaveFocus();
    expect(railButton('Events').tabIndex).toBe(0);
    expect(railButton('Dashboard').tabIndex).toBe(-1);

    await user.keyboard('{End}');
    expect(railButton('Other API Groups')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(railButton('Other API Groups')).toHaveFocus();

    await user.keyboard('{Home}');
    expect(railButton('Dashboard')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(railButton('Dashboard')).toHaveFocus();
  });

  it('opens a flyout with ArrowRight, focuses its first row, and returns focus on Escape', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Nav />);
    const workload = railButton('Workload');

    act(() => workload.focus());
    await user.keyboard('{ArrowRight}');
    const menu = await screen.findByRole('menu', { name: 'Workload' });
    await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Pods' })).toHaveFocus());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(workload).toHaveFocus());
  });

  it('closes the flyout with ArrowLeft, collapsing an open group first', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Nav selectedKey="certs" />);
    const group = railButton('Other API Groups');

    act(() => group.focus());
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu', { name: 'Other API Groups' });
    const cert = within(menu).getByRole('menuitem', { name: 'cert-manager.io' });
    act(() => cert.focus());
    expect(cert).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(cert).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('menu', { name: 'Other API Groups' })).toBe(menu);

    await user.keyboard('{ArrowRight}');
    expect(cert).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(group).toHaveFocus());
  });
});

describe('Sidebar.Navigation focus handoff', () => {
  function Handoff({ controller }: { controller: SidebarController }) {
    return <Nav defaultMode="expanded" controller={controller} selectedKey="pods" />;
  }

  it('moves focus between the tree and the rail as the presentation changes', () => {
    const controller = Sidebar.createController();
    renderWithTheme(<Handoff controller={controller} />);
    const tree = screen.getByRole('tree', { name: 'Expanded tree' });

    act(() => tree.focus());
    expect(tree).toHaveFocus();

    // Collapsing under the focused tree hands focus to the row that contains the selection.
    act(() => controller.setMode('rail'));
    expect(railButton('Workload')).toHaveFocus();

    act(() => controller.setMode('expanded'));
    expect(screen.getByRole('tree', { name: 'Expanded tree' })).toHaveFocus();
  });

  it('closes an open flyout and focuses the tree when the sidebar expands', async () => {
    const user = userEvent.setup();
    const controller = Sidebar.createController();
    renderWithTheme(<Nav defaultMode="rail" controller={controller} />);

    await user.click(railButton('Workload'));
    await screen.findByRole('menu', { name: 'Workload' });

    act(() => controller.setMode('expanded'));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(screen.getByRole('tree', { name: 'Expanded tree' })).toHaveFocus();
  });
});
