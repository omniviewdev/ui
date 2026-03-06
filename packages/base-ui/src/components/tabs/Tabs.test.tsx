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
