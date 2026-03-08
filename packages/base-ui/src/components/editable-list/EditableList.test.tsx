import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { EditableList } from './EditableList';
import type { Key } from '../list';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Item {
  id: string;
  name: string;
  value: string;
}

const defaultItems: Item[] = [
  { id: '1', name: 'HOST', value: 'localhost' },
  { id: '2', name: 'PORT', value: '3000' },
  { id: '3', name: 'DEBUG', value: 'true' },
];

function TestList(props: Record<string, unknown> = {}) {
  return (
    <EditableList {...props}>
      <EditableList.Viewport>
        {defaultItems.map((item) => (
          <EditableList.Item key={item.id} itemKey={item.id} textValue={item.name}>
            <EditableList.ItemView>
              <EditableList.ItemLabel>{item.name}</EditableList.ItemLabel>
              <EditableList.ItemMeta>{item.value}</EditableList.ItemMeta>
            </EditableList.ItemView>
            <EditableList.ItemEditor>
              <EditableList.ItemField name="name" defaultValue={item.name} autoFocus />
              <EditableList.ItemField name="value" defaultValue={item.value} />
              <EditableList.ItemSave />
              <EditableList.ItemCancel />
            </EditableList.ItemEditor>
          </EditableList.Item>
        ))}
      </EditableList.Viewport>
    </EditableList>
  );
}

function ControlledTestList() {
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  return (
    <div>
      <button type="button" onClick={() => setEditingKey('2')} data-testid="edit-port">
        Edit PORT
      </button>
      <TestList
        editingKey={editingKey}
        onEditingKeyChange={setEditingKey}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EditableList', () => {
  it('renders items in view mode by default (no inputs visible)', () => {
    renderWithTheme(<TestList />);
    const items = screen.getAllByRole('option');
    expect(items).toHaveLength(3);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('HOST')).toBeInTheDocument();
  });

  it('double-click on item enters edit mode', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestList />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    expect(item).toHaveAttribute('data-ov-editing', 'true');
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('F2 on active item enters edit mode', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestList />);

    const root = screen.getByRole('listbox');
    root.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{F2}');

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('Enter in edit mode calls onCommit with field values', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    renderWithTheme(<TestList onCommit={onCommit} />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    // Modify the name field
    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]!);
    await user.type(inputs[0]!, 'API_KEY');

    await user.keyboard('{Enter}');

    expect(onCommit).toHaveBeenCalledWith('1', {
      name: 'API_KEY',
      value: 'localhost',
    });
  });

  it('Escape in edit mode calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithTheme(<TestList onCancel={onCancel} />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledWith('1');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('Save button calls onCommit', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    renderWithTheme(<TestList onCommit={onCommit} />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    const saveBtn = screen.getByLabelText('Save');
    await user.click(saveBtn);

    expect(onCommit).toHaveBeenCalledWith('1', {
      name: 'HOST',
      value: 'localhost',
    });
  });

  it('Cancel button calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithTheme(<TestList onCancel={onCancel} />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    const cancelBtn = screen.getByLabelText('Cancel');
    await user.click(cancelBtn);

    expect(onCancel).toHaveBeenCalledWith('1');
  });

  it('multiple field values collected correctly in onCommit', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    renderWithTheme(<TestList onCommit={onCommit} />);

    const item = screen.getByText('PORT').closest('[role="option"]')!;
    await user.dblClick(item);

    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]!);
    await user.type(inputs[0]!, 'API_PORT');
    await user.clear(inputs[1]!);
    await user.type(inputs[1]!, '8080');

    await user.keyboard('{Enter}');

    expect(onCommit).toHaveBeenCalledWith('2', {
      name: 'API_PORT',
      value: '8080',
    });
  });

  it('Tab cycles focus between fields within editor', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestList />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    const inputs = screen.getAllByRole('textbox');

    // First field should have focus (autoFocus)
    await waitFor(() => {
      expect(document.activeElement).toBe(inputs[0]!);
    });

    await user.tab();
    expect(document.activeElement).toBe(inputs[1]!);

    // Tab again should wrap back to first
    await user.tab();
    expect(document.activeElement).toBe(inputs[0]!);
  });

  it('arrow keys suppressed during editing (don\'t navigate list)', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestList />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    // Item 1 should remain editing after arrow keys
    await user.keyboard('{ArrowDown}');
    expect(item).toHaveAttribute('data-ov-editing', 'true');
  });

  it('validation errors prevent commit and show data-ov-invalid', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    const validateItem = vi.fn().mockReturnValue({ name: 'Required' });

    renderWithTheme(
      <TestList onCommit={onCommit} validateItem={validateItem} />,
    );

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    await user.keyboard('{Enter}');

    // onCommit should NOT have been called
    expect(onCommit).not.toHaveBeenCalled();

    // The name field should have invalid attribute
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]!).toHaveAttribute('data-ov-invalid', '');
  });

  it('controlled editingKey drives editing state', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ControlledTestList />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('edit-port'));

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    // When editing, the ItemView is hidden, so we find the item by its id
    const portItem = screen.getAllByRole('option')[1]!;
    expect(portItem).toHaveAttribute('data-ov-editing', 'true');
  });

  it('disabled items cannot enter edit mode', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderWithTheme(<TestList disabledKeys={['1']} />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    // Should not enter edit mode (no inputs)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('editable={false} prevents all editing', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestList editable={false} />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('only one item editable at a time', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithTheme(<TestList onCancel={onCancel} />);

    // Enter edit on first item
    const item1 = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item1);
    expect(item1).toHaveAttribute('data-ov-editing', 'true');

    // Enter edit on second item
    const item2 = screen.getByText('PORT').closest('[role="option"]')!;
    await user.dblClick(item2);

    // First item should no longer be editing
    expect(item1).not.toHaveAttribute('data-ov-editing', 'true');
    expect(item2).toHaveAttribute('data-ov-editing', 'true');
  });

  it('ItemField with autoFocus gets focus when edit starts', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestList />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);

    const inputs = screen.getAllByRole('textbox');
    await waitFor(() => {
      expect(document.activeElement).toBe(inputs[0]!);
    });
  });

  it('exiting edit mode returns focus to list', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestList />);

    const item = screen.getByText('HOST').closest('[role="option"]')!;
    await user.dblClick(item);
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('listbox'));
    });
  });
});
