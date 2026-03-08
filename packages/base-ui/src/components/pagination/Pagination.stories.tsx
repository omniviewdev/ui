import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination, type PaginationProps } from './Pagination';

function ControlledPagination(props: PaginationProps) {
  const [page, setPage] = useState(props.page);
  return (
    <Pagination
      {...props}
      page={page}
      onChange={(p) => {
        setPage(p);
        props.onChange(p);
      }}
    />
  );
}

function SimplePagination(props: Omit<PaginationProps, 'onChange'>) {
  const [page, setPage] = useState(props.page);
  return <Pagination {...props} page={page} onChange={setPage} />;
}

function AllSizesPagination() {
  const [pages, setPages] = useState({ sm: 3, md: 3, lg: 3 });
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Pagination
        count={10}
        page={pages.sm}
        onChange={(p) => setPages((s) => ({ ...s, sm: p }))}
        size="sm"
      />
      <Pagination
        count={10}
        page={pages.md}
        onChange={(p) => setPages((s) => ({ ...s, md: p }))}
        size="md"
      />
      <Pagination
        count={10}
        page={pages.lg}
        onChange={(p) => setPages((s) => ({ ...s, lg: p }))}
        size="lg"
      />
    </div>
  );
}

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    count: 10,
    page: 1,
    siblingCount: 1,
    boundaryCount: 1,
    showFirstLast: true,
    size: 'md',
  },
  argTypes: {
    count: { control: { type: 'number', min: 1, max: 100 } },
    page: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0, max: 5 } },
    boundaryCount: { control: { type: 'number', min: 0, max: 5 } },
    showFirstLast: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <ControlledPagination {...args} />,
};

export const FewPages: Story = {
  render: () => <SimplePagination count={5} page={1} />,
};

export const ManyPages: Story = {
  render: () => <SimplePagination count={50} page={10} />,
};

export const AllSizes: Story = {
  render: () => <AllSizesPagination />,
};

export const WithoutFirstLast: Story = {
  render: () => <SimplePagination count={20} page={5} showFirstLast={false} />,
};
