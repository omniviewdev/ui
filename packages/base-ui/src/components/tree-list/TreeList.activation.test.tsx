import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { TreeList } from './TreeList';

interface Entry {
  id: string;
  children?: Entry[];
}
const items: Entry[] = [{ id: 'group', children: [{ id: 'destination' }] }, { id: 'other' }];
const itemKey = (item: Entry) => item.id;
const getChildren = (item: Entry) => item.children;

function Navigation({
  disabled = false,
  selection = false,
}: {
  disabled?: boolean;
  selection?: boolean;
}) {
  const [visits, setVisits] = useState<string[]>([]);
  return (
    <>
      <output aria-label="Activated destinations">{visits.join(',') || 'none'}</output>
      <TreeList
        items={items}
        itemKey={itemKey}
        getChildren={getChildren}
        selectionMode={selection ? 'single' : 'none'}
        selectedKeys={new Set(['group'])}
        defaultActiveKey="group"
        activeKey={disabled ? 'group' : undefined}
        onAction={(key) => setVisits((previous) => [...previous, String(key)])}
        renderItem={(item, node) => (
          <TreeList.Item
            itemKey={node.key}
            selectable={!node.isBranch}
            disabled={disabled && item.id === 'group'}
          >
            <TreeList.ItemLabel>{item.id}</TreeList.ItemLabel>
          </TreeList.Item>
        )}
      >
        <TreeList.Viewport />
      </TreeList>
    </>
  );
}

describe('TreeList row activation', () => {
  it.each(['click', 'Enter', ' '])(
    'activates non-selectable groups repeatedly through %j',
    (input) => {
      renderWithTheme(<Navigation />);
      for (let index = 0; index < 2; index += 1) {
        if (input === 'click') fireEvent.click(screen.getByRole('treeitem', { name: 'group' }));
        else fireEvent.keyDown(screen.getByRole('tree'), { key: input });
      }
      expect(screen.getByLabelText('Activated destinations')).toHaveTextContent('group,group');
    },
  );

  it('keeps activation independent of controlled selection and focus movement', () => {
    renderWithTheme(<Navigation selection />);
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown' });
    expect(screen.getByLabelText('Activated destinations')).toHaveTextContent('none');
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'Enter' });
    expect(screen.getByLabelText('Activated destinations')).toHaveTextContent('other');
    expect(screen.getByText('group').closest('[role="treeitem"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('does not activate item-local disabled rows on click or keyboard', () => {
    renderWithTheme(<Navigation disabled />);
    fireEvent.click(screen.getByText('group'));
    expect(screen.getByLabelText('Activated destinations')).toHaveTextContent('none');
    fireEvent.keyDown(screen.getByRole('tree'), { key: 'Enter' });
    expect(screen.getByLabelText('Activated destinations')).toHaveTextContent('none');
  });
});
