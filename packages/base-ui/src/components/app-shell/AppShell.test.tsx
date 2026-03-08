import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders all named slots in correct positions', () => {
    renderWithTheme(
      <AppShell data-testid="shell">
        <AppShell.Header data-testid="header">Header</AppShell.Header>
        <AppShell.Sidebar data-testid="sidebar">Sidebar</AppShell.Sidebar>
        <AppShell.Content data-testid="content">Content</AppShell.Content>
        <AppShell.Footer data-testid="footer">Footer</AppShell.Footer>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toHaveTextContent('Header');
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Sidebar');
    expect(screen.getByTestId('content')).toHaveTextContent('Content');
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer');
  });

  it('uses semantic HTML elements for slots', () => {
    renderWithTheme(
      <AppShell>
        <AppShell.Header data-testid="header">H</AppShell.Header>
        <AppShell.Sidebar data-testid="sidebar">S</AppShell.Sidebar>
        <AppShell.Content data-testid="content">C</AppShell.Content>
        <AppShell.Footer data-testid="footer">F</AppShell.Footer>
      </AppShell>,
    );

    expect(screen.getByTestId('header').tagName).toBe('HEADER');
    expect(screen.getByTestId('sidebar').tagName).toBe('ASIDE');
    expect(screen.getByTestId('content').tagName).toBe('MAIN');
    expect(screen.getByTestId('footer').tagName).toBe('FOOTER');
  });

  it('defaults to left sidebar position', () => {
    renderWithTheme(
      <AppShell data-testid="shell">
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toHaveAttribute('data-ov-sidebar-position', 'left');
  });

  it('applies right sidebar position', () => {
    renderWithTheme(
      <AppShell sidebarPosition="right" data-testid="shell">
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toHaveAttribute('data-ov-sidebar-position', 'right');
  });

  it('applies sidebar collapsed state', () => {
    renderWithTheme(
      <AppShell sidebarCollapsed data-testid="shell">
        <AppShell.Sidebar>Sidebar</AppShell.Sidebar>
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    const shell = screen.getByTestId('shell');
    expect(shell).toHaveAttribute('data-ov-sidebar-collapsed');
    expect(shell.style.getPropertyValue('--_ov-shell-sidebar-width')).toBe('0px');
  });

  it('does not set collapsed attribute when not collapsed', () => {
    renderWithTheme(
      <AppShell data-testid="shell">
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).not.toHaveAttribute('data-ov-sidebar-collapsed');
  });

  it('applies custom dimensions', () => {
    renderWithTheme(
      <AppShell
        sidebarWidth={300}
        headerHeight={50}
        footerHeight={30}
        data-testid="shell"
      >
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    const el = screen.getByTestId('shell');
    expect(el.style.getPropertyValue('--_ov-shell-sidebar-width')).toBe('300px');
    expect(el.style.getPropertyValue('--_ov-shell-header-height')).toBe('50px');
    expect(el.style.getPropertyValue('--_ov-shell-footer-height')).toBe('30px');
  });

  it('accepts string dimensions', () => {
    renderWithTheme(
      <AppShell sidebarWidth="20%" headerHeight="3rem" data-testid="shell">
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    const el = screen.getByTestId('shell');
    expect(el.style.getPropertyValue('--_ov-shell-sidebar-width')).toBe('20%');
    expect(el.style.getPropertyValue('--_ov-shell-header-height')).toBe('3rem');
  });

  it('renders without optional slots', () => {
    renderWithTheme(
      <AppShell data-testid="shell">
        <AppShell.Content>Only content</AppShell.Content>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toBeInTheDocument();
    expect(screen.getByText('Only content')).toBeInTheDocument();
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <AppShell ref={ref}>
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderWithTheme(
      <AppShell className="custom-shell" data-testid="shell">
        <AppShell.Content>Content</AppShell.Content>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toHaveClass('custom-shell');
  });

  it('forwards ref on sub-components', () => {
    const headerRef = createRef<HTMLElement>();
    const sidebarRef = createRef<HTMLElement>();
    const contentRef = createRef<HTMLElement>();
    const footerRef = createRef<HTMLElement>();

    renderWithTheme(
      <AppShell>
        <AppShell.Header ref={headerRef}>H</AppShell.Header>
        <AppShell.Sidebar ref={sidebarRef}>S</AppShell.Sidebar>
        <AppShell.Content ref={contentRef}>C</AppShell.Content>
        <AppShell.Footer ref={footerRef}>F</AppShell.Footer>
      </AppShell>,
    );

    expect(headerRef.current).toBeInstanceOf(HTMLElement);
    expect(sidebarRef.current).toBeInstanceOf(HTMLElement);
    expect(contentRef.current).toBeInstanceOf(HTMLElement);
    expect(footerRef.current).toBeInstanceOf(HTMLElement);
  });

  it('merges className on sub-components', () => {
    renderWithTheme(
      <AppShell>
        <AppShell.Header className="h-cls" data-testid="header">H</AppShell.Header>
        <AppShell.Sidebar className="s-cls" data-testid="sidebar">S</AppShell.Sidebar>
        <AppShell.Content className="c-cls" data-testid="content">C</AppShell.Content>
        <AppShell.Footer className="f-cls" data-testid="footer">F</AppShell.Footer>
      </AppShell>,
    );

    expect(screen.getByTestId('header')).toHaveClass('h-cls');
    expect(screen.getByTestId('sidebar')).toHaveClass('s-cls');
    expect(screen.getByTestId('content')).toHaveClass('c-cls');
    expect(screen.getByTestId('footer')).toHaveClass('f-cls');
  });
});
