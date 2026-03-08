import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ObjectInspector } from './ObjectInspector';

const testData = {
  name: 'test',
  count: 42,
  active: true,
  items: ['a', 'b'],
  nested: {
    key: 'value',
  },
  nothing: null,
};

describe('ObjectInspector', () => {
  it('renders the inspector container', () => {
    render(<ObjectInspector data={testData} />);
    expect(screen.getByTestId('object-inspector')).toBeInTheDocument();
  });

  it('renders the tree', () => {
    render(<ObjectInspector data={testData} />);
    expect(screen.getByTestId('inspector-tree')).toBeInTheDocument();
  });

  it('renders root node', () => {
    render(<ObjectInspector data={testData} />);
    expect(screen.getByTestId('inspector-node-root')).toBeInTheDocument();
  });

  it('expands to default depth', () => {
    render(<ObjectInspector data={testData} defaultExpanded={1} />);
    // Root (depth 0) is expanded, children are visible
    expect(screen.getByTestId('inspector-node-name')).toBeInTheDocument();
    expect(screen.getByTestId('inspector-node-count')).toBeInTheDocument();
  });

  it('expands/collapses on click', () => {
    render(<ObjectInspector data={testData} defaultExpanded={0} />);
    const root = screen.getByTestId('inspector-node-root');
    // Initially collapsed — children not visible
    expect(screen.queryByTestId('inspector-node-name')).not.toBeInTheDocument();
    fireEvent.click(root);
    expect(screen.getByTestId('inspector-node-name')).toBeInTheDocument();
  });

  it('shows search input when searchable', () => {
    render(<ObjectInspector data={testData} searchable />);
    expect(screen.getByTestId('inspector-search')).toBeInTheDocument();
  });

  it('filters by search query', async () => {
    const user = userEvent.setup();
    render(<ObjectInspector data={testData} searchable defaultExpanded />);
    const search = screen.getByTestId('inspector-search');
    await user.type(search, 'name');
    // The "name" node row should have the highlight class
    const nameNode = screen.getByTestId('inspector-node-name');
    expect(nameNode.className).toContain('Highlight');
  });

  it('shows copy button when copyable', () => {
    render(<ObjectInspector data={testData} copyable />);
    expect(screen.getByTestId('inspector-copy')).toBeInTheDocument();
  });

  it('copies JSON on copy click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    render(<ObjectInspector data={testData} copyable />);
    fireEvent.click(screen.getByTestId('inspector-copy'));
    expect(writeText).toHaveBeenCalledWith(JSON.stringify(testData, null, 2));
  });

  it('sets data-format attribute', () => {
    render(<ObjectInspector data={testData} format="yaml" />);
    expect(screen.getByTestId('object-inspector')).toHaveAttribute('data-format', 'yaml');
  });

  it('merges className', () => {
    render(<ObjectInspector data={testData} className="custom" />);
    expect(screen.getByTestId('object-inspector')).toHaveClass('custom');
  });

  it('forwards ref', () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLDivElement>;
    render(<ObjectInspector data={testData} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
