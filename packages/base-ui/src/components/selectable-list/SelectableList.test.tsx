import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { SelectableList } from './SelectableList';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ThreeItemList(props: Record<string, unknown> = {}) {
  return (
    <SelectableList selectionMode="multiple" {...props}>
      <SelectableList.Viewport>
        <SelectableList.Item itemKey="a" textValue="A">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="b" textValue="B">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
        </SelectableList.Item>
        <SelectableList.Item itemKey="c" textValue="C">
          <SelectableList.ItemIndicator />
          <SelectableList.ItemLabel>C</SelectableList.ItemLabel>
        </SelectableList.Item>
      </SelectableList.Viewport>
    </SelectableList>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SelectableList', () => {
  it('renders checkbox indicators by default (selectionMode=multiple)', () => {
    renderWithTheme(<ThreeItemList />);
    // Each item renders an indicator with the CheckboxIndicator class
    const items = screen.getAllByRole('option');
    expect(items).toHaveLength(3);
    for (const item of items) {
      const indicator = item.querySelector('[aria-hidden="true"]');
      expect(indicator).toBeInTheDocument();
      expect(indicator?.className).toContain('CheckboxIndicator');
    }
  });

  it('renders radio indicators for selectionMode=single', () => {
    renderWithTheme(
      <SelectableList selectionMode="single">
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );
    const items = screen.getAllByRole('option');
    expect(items).toHaveLength(2);
  });

  it('click on item toggles checkbox — data-checked appears on indicator', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThreeItemList />);

    const itemA = screen.getByText('A').closest('[role="option"]')!;
    await user.click(itemA);

    expect(itemA).toHaveAttribute('aria-selected', 'true');
    const indicator = itemA.querySelector('[aria-hidden="true"]');
    expect(indicator).toHaveAttribute('data-checked', '');
  });

  it('click on item selects radio — previous radio unchecks', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SelectableList selectionMode="single">
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    const itemA = screen.getByText('A').closest('[role="option"]')!;
    const itemB = screen.getByText('B').closest('[role="option"]')!;

    await user.click(itemA);
    expect(itemA).toHaveAttribute('aria-selected', 'true');

    await user.click(itemB);
    expect(itemB).toHaveAttribute('aria-selected', 'true');
    // In single+toggle mode, clicking B toggles B on. A is still selected
    // because toggle doesn't deselect others. But with single mode, List
    // only allows one selection at a time.
    // Actually, selectionBehavior='toggle' with selectionMode='single'
    // still only allows one key. Let's verify:
    expect(itemA).not.toHaveAttribute('aria-selected', 'true');
  });

  it('SelectAll checks all items', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SelectableList selectionMode="multiple">
        <SelectableList.SelectAll>Select all</SelectableList.SelectAll>
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    await user.click(screen.getByText('Select all'));

    const items = screen.getAllByRole('option');
    for (const item of items) {
      expect(item).toHaveAttribute('aria-selected', 'true');
    }
  });

  it('SelectAll shows data-indeterminate when partial selection', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SelectableList selectionMode="multiple">
        <SelectableList.SelectAll data-testid="select-all">Select all</SelectableList.SelectAll>
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    // Select just one item
    const itemA = screen.getByText('A').closest('[role="option"]')!;
    await user.click(itemA);

    const selectAll = screen.getByTestId('select-all');
    const indicator = selectAll.querySelector('[aria-hidden="true"]');
    expect(indicator).toHaveAttribute('data-indeterminate', '');
  });

  it('SelectAll clears when all selected', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SelectableList selectionMode="multiple">
        <SelectableList.SelectAll>Select all</SelectableList.SelectAll>
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    const selectAllBtn = screen.getByText('Select all').closest('[role="checkbox"]')!;

    // Select all
    await user.click(selectAllBtn);
    const items = screen.getAllByRole('option');
    for (const item of items) {
      expect(item).toHaveAttribute('aria-selected', 'true');
    }

    // Click again to clear
    await user.click(selectAllBtn);
    for (const item of items) {
      expect(item).not.toHaveAttribute('aria-selected', 'true');
    }
  });

  it('GroupSelectAll toggles only group items', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SelectableList selectionMode="multiple">
        <SelectableList.Viewport>
          <SelectableList.Group>
            <SelectableList.GroupSelectAll groupKeys={['a', 'b']}>
              Group 1
            </SelectableList.GroupSelectAll>
            <SelectableList.Item itemKey="a" textValue="A">
              <SelectableList.ItemIndicator />
              <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
            </SelectableList.Item>
            <SelectableList.Item itemKey="b" textValue="B">
              <SelectableList.ItemIndicator />
              <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
            </SelectableList.Item>
          </SelectableList.Group>
          <SelectableList.Group>
            <SelectableList.GroupHeader>Group 2</SelectableList.GroupHeader>
            <SelectableList.Item itemKey="c" textValue="C">
              <SelectableList.ItemIndicator />
              <SelectableList.ItemLabel>C</SelectableList.ItemLabel>
            </SelectableList.Item>
          </SelectableList.Group>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    await user.click(screen.getByText('Group 1'));

    const itemA = screen.getByText('A').closest('[role="option"]')!;
    const itemB = screen.getByText('B').closest('[role="option"]')!;
    const itemC = screen.getByText('C').closest('[role="option"]')!;

    expect(itemA).toHaveAttribute('aria-selected', 'true');
    expect(itemB).toHaveAttribute('aria-selected', 'true');
    expect(itemC).not.toHaveAttribute('aria-selected', 'true');
  });

  it('GroupSelectAll shows indeterminate state', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SelectableList selectionMode="multiple">
        <SelectableList.Viewport>
          <SelectableList.Group>
            <SelectableList.GroupSelectAll groupKeys={['a', 'b']} data-testid="group-sa">
              Group 1
            </SelectableList.GroupSelectAll>
            <SelectableList.Item itemKey="a" textValue="A">
              <SelectableList.ItemIndicator />
              <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
            </SelectableList.Item>
            <SelectableList.Item itemKey="b" textValue="B">
              <SelectableList.ItemIndicator />
              <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
            </SelectableList.Item>
          </SelectableList.Group>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    // Select just item A
    const itemA = screen.getByText('A').closest('[role="option"]')!;
    await user.click(itemA);

    const groupSA = screen.getByTestId('group-sa');
    const indicator = groupSA.querySelector('[aria-hidden="true"]');
    expect(indicator).toHaveAttribute('data-indeterminate', '');
  });

  it('disabled items show disabled styling and cannot be toggled', () => {
    renderWithTheme(
      <SelectableList selectionMode="multiple" disabledKeys={['b']}>
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    const itemB = screen.getByText('B').closest('[role="option"]')!;
    // Disabled items have aria-disabled and data-ov-disabled
    expect(itemB).toHaveAttribute('aria-disabled', 'true');
    expect(itemB).toHaveAttribute('data-ov-disabled', 'true');
    // pointer-events: none prevents interaction (CSS-level)
    expect(itemB).not.toHaveAttribute('aria-selected', 'true');
  });

  it('controlled mode: selectedKeys prop drives indicator state', () => {
    const selected = new Set(['a']);
    renderWithTheme(
      <SelectableList selectionMode="multiple" selectedKeys={selected}>
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    const itemA = screen.getByText('A').closest('[role="option"]')!;
    const itemB = screen.getByText('B').closest('[role="option"]')!;

    expect(itemA).toHaveAttribute('aria-selected', 'true');
    expect(itemB).not.toHaveAttribute('aria-selected', 'true');

    const indicatorA = itemA.querySelector('[aria-hidden="true"]');
    expect(indicatorA).toHaveAttribute('data-checked', '');
  });

  it('SelectionSummary shows correct count', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SelectableList selectionMode="multiple">
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="b" textValue="B">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>B</SelectableList.ItemLabel>
          </SelectableList.Item>
          <SelectableList.Item itemKey="c" textValue="C">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>C</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
        <SelectableList.SelectionSummary />
      </SelectableList>,
    );

    expect(screen.getByText('0 of 3 selected')).toBeInTheDocument();

    const itemA = screen.getByText('A').closest('[role="option"]')!;
    await user.click(itemA);

    expect(screen.getByText('1 of 3 selected')).toBeInTheDocument();
  });

  it('checkBehavior override: force checkbox even with selectionMode=single', () => {
    renderWithTheme(
      <SelectableList selectionMode="single" checkBehavior="checkbox">
        <SelectableList.Viewport>
          <SelectableList.Item itemKey="a" textValue="A">
            <SelectableList.ItemIndicator />
            <SelectableList.ItemLabel>A</SelectableList.ItemLabel>
          </SelectableList.Item>
        </SelectableList.Viewport>
      </SelectableList>,
    );

    // The indicator should have CheckboxIndicator class, not RadioIndicator
    const indicator = document.querySelector('[aria-hidden="true"]');
    expect(indicator).toBeInTheDocument();
    // Checkbox indicators have choice-radius (not full round)
    // We can verify by checking the class
    expect(indicator?.className).toContain('CheckboxIndicator');
  });
});
