import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders items with default separator', () => {
    renderWithTheme(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/products">Products</Breadcrumbs.Item>
        <Breadcrumbs.Item active>Widget</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();

    // Default separator is an icon; verify separator spans are rendered
    const nav = screen.getByRole('navigation');
    const separators = nav.querySelectorAll('[aria-hidden="true"]');
    // 2 separators between 3 items
    expect(separators.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a custom separator', () => {
    renderWithTheme(
      <Breadcrumbs separator={<span data-testid="custom-sep">/</span>}>
        <Breadcrumbs.Item href="/a">A</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/b">B</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    expect(screen.getByTestId('custom-sep')).toBeInTheDocument();
  });

  it('applies active styling to current page item', () => {
    renderWithTheme(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item active>Current</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const activeItem = screen.getByText('Current').closest('[data-ov-active]');
    expect(activeItem).toHaveAttribute('data-ov-active', 'true');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('collapses middle items when exceeding maxItems', () => {
    renderWithTheme(
      <Breadcrumbs maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
        <Breadcrumbs.Item href="/a">A</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/b">B</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/c">C</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/d">D</Breadcrumbs.Item>
        <Breadcrumbs.Item active>E</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.queryByText('B')).not.toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show more breadcrumbs' })).toBeInTheDocument();
  });

  it('expands collapsed items on ellipsis click', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <Breadcrumbs maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
        <Breadcrumbs.Item href="/a">A</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/b">B</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/c">C</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/d">D</Breadcrumbs.Item>
        <Breadcrumbs.Item active>E</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const ellipsis = screen.getByRole('button', { name: 'Show more breadcrumbs' });
    await user.click(ellipsis);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show more breadcrumbs' })).not.toBeInTheDocument();
  });

  it('renders nav with aria-label="breadcrumb"', () => {
    renderWithTheme(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
  });

  it('renders links for items with href', () => {
    renderWithTheme(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item active href="/current">Current</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/home');

    // Active item should not be a link even when href is provided
    expect(screen.queryByRole('link', { name: 'Current' })).not.toBeInTheDocument();
  });

  it('merges custom className', () => {
    renderWithTheme(
      <Breadcrumbs className="my-breadcrumbs">
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('my-breadcrumbs');
  });

  it('sets data-ov-size attribute', () => {
    renderWithTheme(
      <Breadcrumbs size="sm">
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
      </Breadcrumbs>,
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('data-ov-size', 'sm');
  });
});
