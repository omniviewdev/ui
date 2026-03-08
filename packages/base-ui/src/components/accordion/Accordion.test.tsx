import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Accordion } from './Accordion';

describe('Accordion', () => {
  it('renders items with titles', () => {
    renderWithTheme(
      <Accordion>
        <Accordion.Item id="a" title="First" />
        <Accordion.Item id="b" title="Second" />
      </Accordion>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('toggles expanded state on click', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <Accordion>
        <Accordion.Item id="a" title="Toggle me">
          Content A
        </Accordion.Item>
      </Accordion>,
    );

    const item = screen.getByText('Toggle me').closest('[data-ov-component="accordion-item"]')!;
    expect(item).toHaveAttribute('data-ov-expanded', 'false');

    await user.click(screen.getByRole('button', { name: /toggle me/i }));
    expect(item).toHaveAttribute('data-ov-expanded', 'true');

    await user.click(screen.getByRole('button', { name: /toggle me/i }));
    expect(item).toHaveAttribute('data-ov-expanded', 'false');
  });

  it('exclusive mode closes other items when one is opened', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <Accordion exclusive defaultExpanded={['a']}>
        <Accordion.Item id="a" title="First">
          Content A
        </Accordion.Item>
        <Accordion.Item id="b" title="Second">
          Content B
        </Accordion.Item>
      </Accordion>,
    );

    const itemA = screen.getByText('First').closest('[data-ov-component="accordion-item"]')!;
    const itemB = screen.getByText('Second').closest('[data-ov-component="accordion-item"]')!;

    expect(itemA).toHaveAttribute('data-ov-expanded', 'true');
    expect(itemB).toHaveAttribute('data-ov-expanded', 'false');

    await user.click(screen.getByRole('button', { name: /second/i }));
    expect(itemA).toHaveAttribute('data-ov-expanded', 'false');
    expect(itemB).toHaveAttribute('data-ov-expanded', 'true');
  });

  it('default expanded items are open on mount', () => {
    renderWithTheme(
      <Accordion defaultExpanded={['b']}>
        <Accordion.Item id="a" title="First" />
        <Accordion.Item id="b" title="Second" />
      </Accordion>,
    );

    const itemA = screen.getByText('First').closest('[data-ov-component="accordion-item"]')!;
    const itemB = screen.getByText('Second').closest('[data-ov-component="accordion-item"]')!;

    expect(itemA).toHaveAttribute('data-ov-expanded', 'false');
    expect(itemB).toHaveAttribute('data-ov-expanded', 'true');
  });

  it('per-item defaultExpanded works', () => {
    renderWithTheme(
      <Accordion>
        <Accordion.Item id="a" title="First" />
        <Accordion.Item id="b" title="Second" defaultExpanded />
      </Accordion>,
    );

    const itemA = screen.getByText('First').closest('[data-ov-component="accordion-item"]')!;
    const itemB = screen.getByText('Second').closest('[data-ov-component="accordion-item"]')!;

    expect(itemA).toHaveAttribute('data-ov-expanded', 'false');
    expect(itemB).toHaveAttribute('data-ov-expanded', 'true');
  });

  it('disabled items cannot be toggled', () => {
    renderWithTheme(
      <Accordion>
        <Accordion.Item id="a" title="Disabled" disabled>
          Content
        </Accordion.Item>
      </Accordion>,
    );

    const item = screen.getByText('Disabled').closest('[data-ov-component="accordion-item"]')!;
    expect(item).toHaveAttribute('data-ov-expanded', 'false');
    expect(item).toHaveAttribute('data-ov-disabled', 'true');

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('renders count on header', () => {
    renderWithTheme(
      <Accordion>
        <Accordion.Item id="a" title="Items" count={42} />
      </Accordion>,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('42').closest('[data-ov-slot="count"]')).toBeInTheDocument();
  });

  it('renders end decorator', () => {
    renderWithTheme(
      <Accordion>
        <Accordion.Item
          id="a"
          title="With decorator"
          endDecorator={<span data-testid="deco">Actions</span>}
        />
      </Accordion>,
    );

    expect(screen.getByTestId('deco')).toBeInTheDocument();
  });

  it('sets aria-expanded on header button', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <Accordion>
        <Accordion.Item id="a" title="Aria test">
          Content
        </Accordion.Item>
      </Accordion>,
    );

    const button = screen.getByRole('button', { name: /aria test/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('forwards ref to root element', () => {
    const ref = createRef<HTMLDivElement>();

    renderWithTheme(
      <Accordion ref={ref}>
        <Accordion.Item id="a" title="Ref test" />
      </Accordion>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-ov-component', 'accordion');
  });

  it('merges className on root', () => {
    renderWithTheme(
      <Accordion className="custom-class">
        <Accordion.Item id="a" title="Class test" />
      </Accordion>,
    );

    const root = screen.getByText('Class test').closest('[data-ov-component="accordion"]')!;
    expect(root.className).toContain('custom-class');
  });
});
