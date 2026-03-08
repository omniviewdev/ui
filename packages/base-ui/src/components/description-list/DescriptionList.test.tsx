import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { DescriptionList } from './DescriptionList';

describe('DescriptionList', () => {
  it('renders dl/dt/dd semantic HTML', () => {
    const { container } = renderWithTheme(
      <DescriptionList>
        <DescriptionList.Item label="Name">Alice</DescriptionList.Item>
      </DescriptionList>,
    );

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelector('dt')).toHaveTextContent('Name');
    expect(container.querySelector('dd')).toHaveTextContent('Alice');
  });

  it('horizontal layout has correct data attribute', () => {
    const { container } = renderWithTheme(
      <DescriptionList layout="horizontal">
        <DescriptionList.Item label="Key">Value</DescriptionList.Item>
      </DescriptionList>,
    );

    expect(container.querySelector('dl')).toHaveAttribute('data-ov-layout', 'horizontal');
  });

  it('vertical layout has correct data attribute', () => {
    const { container } = renderWithTheme(
      <DescriptionList layout="vertical">
        <DescriptionList.Item label="Key">Value</DescriptionList.Item>
      </DescriptionList>,
    );

    expect(container.querySelector('dl')).toHaveAttribute('data-ov-layout', 'vertical');
  });

  it('grid with columns=2 has correct data attributes', () => {
    const { container } = renderWithTheme(
      <DescriptionList layout="grid" columns={2}>
        <DescriptionList.Item label="Key1">Value1</DescriptionList.Item>
        <DescriptionList.Item label="Key2">Value2</DescriptionList.Item>
      </DescriptionList>,
    );

    const dl = container.querySelector('dl');
    expect(dl).toHaveAttribute('data-ov-layout', 'grid');
    expect(dl).toHaveAttribute('data-ov-columns', '2');
  });

  it('copyable items render ClipboardText', () => {
    const { container } = renderWithTheme(
      <DescriptionList>
        <DescriptionList.Item label="ID" copyable>
          abc-123
        </DescriptionList.Item>
      </DescriptionList>,
    );

    // ClipboardText renders a button with aria-label="Copy to clipboard"
    const copyButton = screen.getByRole('button', { name: 'Copy to clipboard' });
    expect(copyButton).toBeInTheDocument();
    // The button should be inside the dd element
    const dd = container.querySelector('dd');
    expect(dd).toContainElement(copyButton);
  });

  it('size variants apply correct data attributes', () => {
    const { container: smContainer } = renderWithTheme(
      <DescriptionList size="sm">
        <DescriptionList.Item label="Key">Value</DescriptionList.Item>
      </DescriptionList>,
    );
    expect(smContainer.querySelector('dl')).toHaveAttribute('data-ov-size', 'sm');

    const { container: lgContainer } = renderWithTheme(
      <DescriptionList size="lg">
        <DescriptionList.Item label="Key">Value</DescriptionList.Item>
      </DescriptionList>,
    );
    expect(lgContainer.querySelector('dl')).toHaveAttribute('data-ov-size', 'lg');
  });

  it('custom content in value slot renders', () => {
    renderWithTheme(
      <DescriptionList>
        <DescriptionList.Item label="Status">
          <span data-testid="custom-badge">Active</span>
        </DescriptionList.Item>
      </DescriptionList>,
    );

    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    expect(screen.getByTestId('custom-badge')).toHaveTextContent('Active');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDListElement>();
    renderWithTheme(
      <DescriptionList ref={ref}>
        <DescriptionList.Item label="Key">Value</DescriptionList.Item>
      </DescriptionList>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDListElement);
  });

  it('className merge works', () => {
    const { container } = renderWithTheme(
      <DescriptionList className="custom-class">
        <DescriptionList.Item label="Key">Value</DescriptionList.Item>
      </DescriptionList>,
    );

    const dl = container.querySelector('dl');
    expect(dl?.className).toContain('custom-class');
  });
});
