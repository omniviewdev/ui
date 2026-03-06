import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
  });
});
