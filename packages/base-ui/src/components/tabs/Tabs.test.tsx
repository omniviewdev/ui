import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Tabs } from './Tabs';

describe('Tabs', () => {
  it('changes selected panel when a tab is clicked', () => {
    renderWithTheme(
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="connections">Connections</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="overview">Overview content</Tabs.Panel>
        <Tabs.Panel value="connections">Connections content</Tabs.Panel>
      </Tabs.Root>,
    );

    expect(screen.getByText('Overview content')).toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'Connections' }));

    expect(screen.getByText('Connections content')).toBeVisible();
  });

  it('renders endDecorator in a tab', () => {
    renderWithTheme(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a" endDecorator={<span data-testid="badge">3</span>}>
            Queued
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a">Content</Tabs.Panel>
      </Tabs.Root>,
    );

    expect(screen.getByTestId('badge')).toBeVisible();
    expect(screen.getByTestId('badge')).toHaveTextContent('3');
    expect(screen.getByRole('tab', { name: /Queued/ })).toContainElement(screen.getByTestId('badge'));
  });

  it('applies xs and xl size data attributes', () => {
    const { rerender } = renderWithTheme(
      <Tabs.Root defaultValue="a" size="xs">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">Tab</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a">Content</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tablist').closest('[data-ov-size]')).toHaveAttribute('data-ov-size', 'xs');

    rerender(
      <Tabs.Root defaultValue="a" size="xl">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">Tab</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a">Content</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tablist').closest('[data-ov-size]')).toHaveAttribute('data-ov-size', 'xl');
  });

  it('applies discovery and secondary color data attributes', () => {
    const { rerender } = renderWithTheme(
      <Tabs.Root defaultValue="a" color="discovery">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">Tab</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a">Content</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tablist').closest('[data-ov-color]')).toHaveAttribute('data-ov-color', 'discovery');

    rerender(
      <Tabs.Root defaultValue="a" color="secondary">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="a">Tab</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a">Content</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tablist').closest('[data-ov-color]')).toHaveAttribute('data-ov-color', 'secondary');
  });

  it('applies style data attributes', () => {
    renderWithTheme(
      <Tabs.Root defaultValue="overview" variant="outline" color="success" size="lg">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      </Tabs.Root>,
    );

    const root = screen.getByRole('tablist').closest('[data-ov-variant]');
    expect(root).toHaveAttribute('data-ov-variant', 'outline');
    expect(root).toHaveAttribute('data-ov-color', 'success');
    expect(root).toHaveAttribute('data-ov-size', 'lg');
  });
});
