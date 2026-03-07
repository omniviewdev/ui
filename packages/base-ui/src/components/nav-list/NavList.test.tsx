import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { NavList } from './NavList';

describe('NavList', () => {
  it('renders with compact density by default', () => {
    renderWithTheme(
      <NavList data-testid="nav-root">
        <NavList.Viewport>
          <NavList.Item itemKey="a" textValue="A">
            <NavList.ItemLabel>A</NavList.ItemLabel>
          </NavList.Item>
        </NavList.Viewport>
      </NavList>,
    );
    const root = screen.getByTestId('nav-root');
    expect(root).toHaveAttribute('data-ov-density', 'compact');
    expect(root).toHaveAttribute('data-ov-variant', 'ghost');
  });

  it('renders unread indicator', () => {
    renderWithTheme(
      <NavList>
        <NavList.Viewport>
          <NavList.Item itemKey="a" textValue="A" unread>
            <NavList.ItemLabel>A</NavList.ItemLabel>
          </NavList.Item>
        </NavList.Viewport>
      </NavList>,
    );
    const item = screen.getByText('A').closest('[role="option"]');
    expect(item).toHaveAttribute('data-ov-unread', 'true');
  });

  it('renders dirty indicator', () => {
    renderWithTheme(
      <NavList>
        <NavList.Viewport>
          <NavList.Item itemKey="a" textValue="A" dirty>
            <NavList.ItemLabel>A</NavList.ItemLabel>
          </NavList.Item>
        </NavList.Viewport>
      </NavList>,
    );
    const item = screen.getByText('A').closest('[role="option"]');
    expect(item).toHaveAttribute('data-ov-dirty', 'true');
  });

  it('renders collapsible group as expanded by default', () => {
    renderWithTheme(
      <NavList>
        <NavList.Viewport>
          <NavList.Group collapsible data-testid="group">
            <NavList.GroupHeader>Group</NavList.GroupHeader>
            <NavList.GroupItems>
              <NavList.Item itemKey="a" textValue="A">
                <NavList.ItemLabel>A</NavList.ItemLabel>
              </NavList.Item>
            </NavList.GroupItems>
          </NavList.Group>
        </NavList.Viewport>
      </NavList>,
    );
    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-ov-expanded', 'true');
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders collapsible group as collapsed when defaultExpanded=false', () => {
    renderWithTheme(
      <NavList>
        <NavList.Viewport>
          <NavList.Group collapsible defaultExpanded={false} data-testid="group">
            <NavList.GroupHeader>Group</NavList.GroupHeader>
            <NavList.GroupItems data-testid="group-items">
              <NavList.Item itemKey="a" textValue="A">
                <NavList.ItemLabel>A</NavList.ItemLabel>
              </NavList.Item>
            </NavList.GroupItems>
          </NavList.Group>
        </NavList.Viewport>
      </NavList>,
    );
    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-ov-expanded', 'false');
    // GroupItems should be hidden via CSS (display: none) when collapsed
    const groupItems = screen.getByTestId('group-items');
    expect(groupItems).toBeInTheDocument();
  });

  it('toggles collapsible group on header click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(
      <NavList>
        <NavList.Viewport>
          <NavList.Group collapsible onExpandedChange={onChange} data-testid="group">
            <NavList.GroupHeader>Group</NavList.GroupHeader>
            <NavList.GroupItems>
              <NavList.Item itemKey="a" textValue="A">
                <NavList.ItemLabel>A</NavList.ItemLabel>
              </NavList.Item>
            </NavList.GroupItems>
          </NavList.Group>
        </NavList.Viewport>
      </NavList>,
    );

    // Header renders a button in collapsible mode
    await user.click(screen.getByRole('button', { name: 'Group' }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders aria-expanded on collapsible group header button', () => {
    renderWithTheme(
      <NavList>
        <NavList.Viewport>
          <NavList.Group collapsible>
            <NavList.GroupHeader>Group</NavList.GroupHeader>
            <NavList.GroupItems>
              <NavList.Item itemKey="a" textValue="A">
                <NavList.ItemLabel>A</NavList.ItemLabel>
              </NavList.Item>
            </NavList.GroupItems>
          </NavList.Group>
        </NavList.Viewport>
      </NavList>,
    );

    const button = screen.getByRole('button', { name: 'Group' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders non-collapsible group normally', () => {
    renderWithTheme(
      <NavList>
        <NavList.Viewport>
          <NavList.Group>
            <NavList.GroupHeader>Group</NavList.GroupHeader>
            <NavList.Item itemKey="a" textValue="A">
              <NavList.ItemLabel>A</NavList.ItemLabel>
            </NavList.Item>
          </NavList.Group>
        </NavList.Viewport>
      </NavList>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
