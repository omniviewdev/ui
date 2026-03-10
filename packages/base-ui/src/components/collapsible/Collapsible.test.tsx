import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible';

function TestCollapsible(props: Omit<React.ComponentProps<typeof Collapsible>, 'children'>) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Hidden content</CollapsibleContent>
    </Collapsible>
  );
}

describe('Collapsible', () => {
  it('renders collapsed by default', () => {
    render(<TestCollapsible data-testid="root" />);
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'false');
    expect(screen.getByText('Hidden content').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders open when defaultOpen', () => {
    render(<TestCollapsible defaultOpen data-testid="root" />);
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'true');
    expect(screen.getByText('Hidden content').parentElement).toHaveAttribute('aria-hidden', 'false');
  });

  it('toggles on trigger click', async () => {
    render(<TestCollapsible data-testid="root" />);
    const trigger = screen.getByRole('button', { name: 'Toggle' });

    await userEvent.click(trigger);
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'false');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onOpenChange', async () => {
    const onOpenChange = vi.fn();
    render(<TestCollapsible onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await userEvent.click(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('works in controlled mode', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen((v) => !v)}>External</button>
          <Collapsible open={open} onOpenChange={setOpen} data-testid="root">
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsibleContent>Content</CollapsibleContent>
          </Collapsible>
        </>
      );
    }

    render(<Controlled />);
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'false');

    // Toggle via external button
    await userEvent.click(screen.getByText('External'));
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'true');

    // Toggle via internal trigger
    await userEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'false');
  });

  it('prevents toggle when disabled', async () => {
    render(<TestCollapsible disabled data-testid="root" />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-open', 'false');
  });

  it('sets data-ov-disabled when disabled', () => {
    render(<TestCollapsible disabled data-testid="root" />);
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-disabled', 'true');
  });

  it('sets animation data attribute', () => {
    render(<TestCollapsible animation="fast" data-testid="root" />);
    expect(screen.getByTestId('root')).toHaveAttribute('data-ov-animation', 'fast');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Collapsible ref={ref}>
        <CollapsibleContent>content</CollapsibleContent>
      </Collapsible>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    render(<TestCollapsible className="custom" data-testid="root" />);
    expect(screen.getByTestId('root').className).toContain('custom');
  });

  it('trigger forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Collapsible>
        <CollapsibleTrigger ref={ref}>Toggle</CollapsibleTrigger>
        <CollapsibleContent>content</CollapsibleContent>
      </Collapsible>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('content forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Collapsible defaultOpen>
        <CollapsibleContent ref={ref}>content</CollapsibleContent>
      </Collapsible>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
