import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { BasicList } from './BasicList';

describe('BasicList', () => {
  it('renders with default variant ghost', () => {
    renderWithTheme(
      <BasicList data-testid="bl-root">
        <BasicList.Viewport>
          <BasicList.Item itemKey="a" textValue="A">
            <BasicList.ItemLabel>A</BasicList.ItemLabel>
          </BasicList.Item>
        </BasicList.Viewport>
      </BasicList>,
    );
    const root = screen.getByTestId('bl-root');
    expect(root).toHaveAttribute('data-ov-variant', 'ghost');
  });

  it('renders item badge', () => {
    renderWithTheme(
      <BasicList>
        <BasicList.Viewport>
          <BasicList.Item itemKey="a" textValue="A">
            <BasicList.ItemLabel>A</BasicList.ItemLabel>
            <BasicList.ItemBadge>42</BasicList.ItemBadge>
          </BasicList.Item>
        </BasicList.Viewport>
      </BasicList>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders item chevron', () => {
    renderWithTheme(
      <BasicList>
        <BasicList.Viewport>
          <BasicList.Item itemKey="a" textValue="A">
            <BasicList.ItemLabel>A</BasicList.ItemLabel>
            <BasicList.ItemChevron />
          </BasicList.Item>
        </BasicList.Viewport>
      </BasicList>,
    );
    // Default chevron character
    expect(screen.getByText('\u203A')).toBeInTheDocument();
  });

  it('renders groups and separators', () => {
    renderWithTheme(
      <BasicList>
        <BasicList.Viewport>
          <BasicList.Group>
            <BasicList.GroupHeader>Group 1</BasicList.GroupHeader>
            <BasicList.Item itemKey="a" textValue="A">
              <BasicList.ItemLabel>A</BasicList.ItemLabel>
            </BasicList.Item>
          </BasicList.Group>
          <BasicList.Separator />
          <BasicList.Group>
            <BasicList.GroupHeader>Group 2</BasicList.GroupHeader>
            <BasicList.Item itemKey="b" textValue="B">
              <BasicList.ItemLabel>B</BasicList.ItemLabel>
            </BasicList.Item>
          </BasicList.Group>
        </BasicList.Viewport>
      </BasicList>,
    );
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
