import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Table } from '@omniviewdev/base-ui';
import type { ReactNode } from 'react';

const rowsA = (
  <Table.Body>
    <Table.Row>
      <Table.Cell>Alice</Table.Cell>
      <Table.Cell numeric>42</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>Bob</Table.Cell>
      <Table.Cell numeric>37</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>Charlie</Table.Cell>
      <Table.Cell numeric>29</Table.Cell>
    </Table.Row>
  </Table.Body>
);

const rowsB = (
  <Table.Body>
    <Table.Row>
      <Table.Cell>Diana</Table.Cell>
      <Table.Cell numeric>55</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>Eve</Table.Cell>
      <Table.Cell numeric>31</Table.Cell>
    </Table.Row>
    <Table.Row>
      <Table.Cell>Frank</Table.Cell>
      <Table.Cell numeric>48</Table.Cell>
    </Table.Row>
  </Table.Body>
);

const header = (
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell numeric>Age</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
);

describe('Table', () => {
  benchRender(
    'mount with rows',
    () => (
      <Table>
        {header}
        {rowsA}
      </Table>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'rows change',
    {
      initialProps: { children: <>{header}{rowsA}</> as ReactNode },
      updatedProps: { children: <>{header}{rowsB}</> as ReactNode },
    },
    (props) => <Table {...props} />,
    TIER_2_OPTIONS,
  );
});
