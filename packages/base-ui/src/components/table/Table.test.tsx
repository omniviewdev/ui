import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Table } from './Table';

describe('Table', () => {
  it('renders themed root attributes', () => {
    renderWithTheme(
      <Table.Root variant="outline" color="success" size="sm" data-testid="table-root">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Header</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );

    const table = screen.getByTestId('table-root');
    expect(table).toHaveAttribute('data-ov-variant', 'outline');
    expect(table).toHaveAttribute('data-ov-color', 'success');
    expect(table).toHaveAttribute('data-ov-size', 'sm');
  });

  it('supports sticky headers, striping, and hover flags', () => {
    renderWithTheme(
      <Table.Root stickyHeader striped hoverable data-testid="table-root">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Header</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );

    const table = screen.getByTestId('table-root');
    expect(table).toHaveAttribute('data-ov-sticky-header', 'true');
    expect(table).toHaveAttribute('data-ov-striped', 'true');
    expect(table).toHaveAttribute('data-ov-hoverable', 'true');
  });

  it('applies row and cell data attributes and compound semantics', () => {
    renderWithTheme(
      <Table.Container maxHeight={240} data-testid="container">
        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell truncate>Endpoint</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row selected interactive>
              <Table.Cell mono numeric tone="muted">
                42
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Table.Container>,
    );

    const row = screen.getByText('42').closest('tr');
    const cell = screen.getByText('42').closest('td');
    const headerCell = screen.getByText('Endpoint').closest('th');
    const container = screen.getByTestId('container');

    expect(row).toHaveAttribute('data-ov-selected', 'true');
    expect(row).toHaveAttribute('data-ov-interactive', 'true');
    expect(cell).toHaveAttribute('data-ov-align', 'right');
    expect(cell).toHaveAttribute('data-ov-mono', 'true');
    expect(cell).toHaveAttribute('data-ov-tone', 'muted');
    expect(headerCell).toHaveAttribute('scope', 'col');
    expect(headerCell).toHaveAttribute('data-ov-truncate', 'true');
    expect(container).toHaveStyle('max-height: 240px');
  });
});
