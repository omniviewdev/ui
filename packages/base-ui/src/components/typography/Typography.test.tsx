import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { Blockquote, Caption, Heading, Hotkey, Link, Overline, Text, Typography } from './index';

describe('Typography', () => {
  it('renders text with size, tone, and weight data attributes', () => {
    renderWithTheme(
      <Text as="p" size="lg" tone="muted" weight="semibold">
        Body content
      </Text>,
    );

    const text = screen.getByText('Body content');
    expect(text.tagName).toBe('P');
    expect(text).toHaveAttribute('data-ov-size', 'lg');
    expect(text).toHaveAttribute('data-ov-tone', 'muted');
    expect(text).toHaveAttribute('data-ov-weight', 'semibold');
  });

  it('renders heading with semantic level', () => {
    renderWithTheme(<Heading level={3}>Runtime Configuration</Heading>);

    const heading = screen.getByRole('heading', { level: 3, name: 'Runtime Configuration' });
    expect(heading).toHaveAttribute('data-ov-level', '3');
  });

  it('renders hotkey as kbd by default', () => {
    renderWithTheme(<Hotkey>CMD+K</Hotkey>);

    const hotkey = screen.getByText('CMD+K');
    expect(hotkey.tagName).toBe('KBD');
  });

  it('exposes typography compound subcomponents', () => {
    renderWithTheme(
      <>
        <Typography.Heading level={4}>Section</Typography.Heading>
        <Typography.Caption>meta</Typography.Caption>
      </>,
    );

    expect(screen.getByRole('heading', { level: 4, name: 'Section' })).toBeInTheDocument();
    expect(screen.getByText('meta')).toBeInTheDocument();
  });

  it('supports plain blockquote variant', () => {
    renderWithTheme(<Blockquote variant="plain">Readable guidance</Blockquote>);

    const blockquote = screen.getByText('Readable guidance');
    expect(blockquote).toHaveAttribute('data-ov-variant', 'plain');
  });

  it('applies multi-line truncation configuration consistently', () => {
    renderWithTheme(
      <>
        <Text truncate={3}>Long output line</Text>
        <Heading level={2} truncate>
          Truncated title
        </Heading>
      </>,
    );

    const text = screen.getByText('Long output line');
    const heading = screen.getByRole('heading', { level: 2, name: 'Truncated title' });
    expect(text).toHaveAttribute('data-ov-truncate', 'multi');
    expect(text).toHaveStyle('--ov-truncate-lines: 3');
    expect(heading).toHaveAttribute('data-ov-truncate', 'single');
  });

  it('renders new primitives', () => {
    renderWithTheme(
      <>
        <Link href="#docs">Open docs</Link>
        <Caption>metadata</Caption>
        <Overline>section</Overline>
      </>,
    );

    expect(screen.getByRole('link', { name: 'Open docs' })).toBeInTheDocument();
    expect(screen.getByText('metadata')).toBeInTheDocument();
    expect(screen.getByText('section')).toBeInTheDocument();
  });
});
