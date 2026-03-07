import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Card } from './Card';

describe('Card', () => {
  it('renders compound slots', () => {
    renderWithTheme(
      <Card variant="outline" color="brand" size="sm">
        <Card.Header>
          <Card.Title>Title</Card.Title>
          <Card.Description>Description</Card.Description>
        </Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );

    expect(screen.getByText('Title')).toBeVisible();
    expect(screen.getByText('Description')).toBeVisible();
    expect(screen.getByText('Body')).toBeVisible();
    expect(screen.getByText('Footer')).toBeVisible();

    const card = screen.getByText('Body').closest('section');
    expect(card).toHaveAttribute('data-ov-variant', 'outline');
    expect(card).toHaveAttribute('data-ov-color', 'brand');
    expect(card).toHaveAttribute('data-ov-size', 'sm');
    expect(card).toHaveAttribute('data-ov-elevation', '0');
    expect(card).toHaveAttribute('data-ov-surface', 'default');
  });

  it('renders with elevation and surface', () => {
    renderWithTheme(
      <Card elevation={2} surface="raised">
        <Card.Body>Content</Card.Body>
      </Card>,
    );

    const card = screen.getByText('Content').closest('section');
    expect(card).toHaveAttribute('data-ov-elevation', '2');
    expect(card).toHaveAttribute('data-ov-surface', 'raised');
  });

  it('renders Action slot in header', () => {
    renderWithTheme(
      <Card>
        <Card.Header>
          <Card.Title>Title</Card.Title>
          <Card.Action data-testid="action">actions</Card.Action>
        </Card.Header>
      </Card>,
    );

    expect(screen.getByTestId('action')).toBeVisible();
  });

  it('renders Eyebrow with mono attribute', () => {
    renderWithTheme(
      <Card>
        <Card.Header>
          <Card.Eyebrow mono data-testid="eyebrow">v2.1.0</Card.Eyebrow>
        </Card.Header>
      </Card>,
    );

    const eyebrow = screen.getByTestId('eyebrow');
    expect(eyebrow).toHaveTextContent('v2.1.0');
    expect(eyebrow).toHaveAttribute('data-ov-mono', 'true');
  });

  it('renders Media with aspect ratio', () => {
    renderWithTheme(
      <Card>
        <Card.Media ratio={16 / 9} data-testid="media">
          <img src="test.png" alt="test" />
        </Card.Media>
      </Card>,
    );

    const media = screen.getByTestId('media');
    expect(media.style.aspectRatio).toBe(String(16 / 9));
  });

  it('renders Cover slot', () => {
    renderWithTheme(
      <Card>
        <Card.Cover data-testid="cover">
          <img src="bg.png" alt="" />
        </Card.Cover>
        <Card.Body>Content</Card.Body>
      </Card>,
    );

    expect(screen.getByTestId('cover')).toBeVisible();
  });

  it('renders Row with align and gap', () => {
    renderWithTheme(
      <Card>
        <Card.Row align="center" gap="sm" data-testid="row">
          <span>Left</span>
          <span>Right</span>
        </Card.Row>
      </Card>,
    );

    const row = screen.getByTestId('row');
    expect(row).toHaveAttribute('data-ov-align', 'center');
    expect(row).toHaveAttribute('data-ov-gap', 'sm');
  });

  it('renders Separator with separator role', () => {
    renderWithTheme(
      <Card>
        <Card.Body>Above</Card.Body>
        <Card.Separator />
        <Card.Body>Below</Card.Body>
      </Card>,
    );

    expect(screen.getByRole('separator')).toBeVisible();
  });

  it('renders KeyValue with label and value', () => {
    renderWithTheme(
      <Card>
        <Card.Body>
          <Card.KeyValue label="Namespace" mono>production</Card.KeyValue>
        </Card.Body>
      </Card>,
    );

    expect(screen.getByText('Namespace')).toBeVisible();
    expect(screen.getByText('production')).toBeVisible();
  });

  it('renders Stat with mono attribute', () => {
    renderWithTheme(
      <Card>
        <Card.Header>
          <Card.Stat mono data-testid="stat">142ms</Card.Stat>
        </Card.Header>
      </Card>,
    );

    const stat = screen.getByTestId('stat');
    expect(stat).toHaveTextContent('142ms');
    expect(stat).toHaveAttribute('data-ov-mono', 'true');
  });

  it('renders Indicator with status', () => {
    renderWithTheme(
      <Card>
        <Card.Header>
          <Card.Indicator status="success" data-testid="indicator">Healthy</Card.Indicator>
        </Card.Header>
      </Card>,
    );

    const indicator = screen.getByTestId('indicator');
    expect(indicator).toHaveTextContent('Healthy');
    expect(indicator).toHaveAttribute('data-ov-status', 'success');
  });

  it('renders Indicator with pulse', () => {
    renderWithTheme(
      <Card>
        <Card.Header>
          <Card.Indicator status="warning" pulse data-testid="indicator">Building</Card.Indicator>
        </Card.Header>
      </Card>,
    );

    expect(screen.getByTestId('indicator')).toHaveAttribute('data-ov-pulse', 'true');
  });

  it('renders ActionArea with role and handles click', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Card>
        <Card.ActionArea onClick={handleClick} data-testid="action-area">
          <Card.Body>Click me</Card.Body>
        </Card.ActionArea>
      </Card>,
    );

    const area = screen.getByTestId('action-area');
    expect(area).toHaveAttribute('role', 'button');
    expect(area).toHaveAttribute('tabindex', '0');

    fireEvent.click(area);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('ActionArea handles keyboard Enter and Space', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Card>
        <Card.ActionArea onClick={handleClick} data-testid="action-area">
          <Card.Body>Press me</Card.Body>
        </Card.ActionArea>
      </Card>,
    );

    const area = screen.getByTestId('action-area');

    fireEvent.keyDown(area, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(area, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('ActionArea disabled prevents interaction', () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <Card>
        <Card.ActionArea disabled onClick={handleClick} data-testid="action-area">
          <Card.Body>Disabled</Card.Body>
        </Card.ActionArea>
      </Card>,
    );

    const area = screen.getByTestId('action-area');
    expect(area).toHaveAttribute('aria-disabled', 'true');
    expect(area).toHaveAttribute('tabindex', '-1');

    fireEvent.click(area);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders Toolbar with toolbar role', () => {
    renderWithTheme(
      <Card>
        <Card.Toolbar data-testid="toolbar">
          <button type="button">Copy</button>
        </Card.Toolbar>
      </Card>,
    );

    expect(screen.getByTestId('toolbar')).toHaveAttribute('role', 'toolbar');
  });

  it('renders Group with columns and gap', () => {
    renderWithTheme(
      <Card.Group columns={3} gap="lg" data-testid="group">
        <Card><Card.Body>A</Card.Body></Card>
        <Card><Card.Body>B</Card.Body></Card>
      </Card.Group>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('data-ov-columns', '3');
    expect(group).toHaveAttribute('data-ov-gap', 'lg');
  });

  it('renders Group with auto columns', () => {
    renderWithTheme(
      <Card.Group columns="auto" data-testid="group">
        <Card><Card.Body>A</Card.Body></Card>
      </Card.Group>,
    );

    expect(screen.getByTestId('group')).toHaveAttribute('data-ov-columns', 'auto');
  });
});
