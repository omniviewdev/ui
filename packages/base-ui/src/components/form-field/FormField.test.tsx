import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/render';
import { FormField, FormSection } from './FormField';

// ---------------------------------------------------------------------------
// FormField
// ---------------------------------------------------------------------------

describe('FormField', () => {
  it('renders label with htmlFor', () => {
    renderWithTheme(
      <FormField label="Username" htmlFor="username-input">
        <input id="username-input" />
      </FormField>,
    );

    const label = screen.getByText('Username');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'username-input');
  });

  it('shows required asterisk when required is true', () => {
    renderWithTheme(
      <FormField label="Email" required>
        <input />
      </FormField>,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithTheme(
      <FormField label="Name" description="Enter your full name">
        <input />
      </FormField>,
    );

    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('renders error message with role=alert', () => {
    renderWithTheme(
      <FormField label="Password" error="Password is required">
        <input />
      </FormField>,
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Password is required');
  });

  it('sets data-ov-error when error is present', () => {
    renderWithTheme(
      <FormField label="Port" error="Invalid port" data-testid="field">
        <input />
      </FormField>,
    );

    expect(screen.getByTestId('field')).toHaveAttribute('data-ov-error', 'true');
  });

  it('does not set data-ov-error when no error', () => {
    renderWithTheme(
      <FormField label="Port" data-testid="field">
        <input />
      </FormField>,
    );

    expect(screen.getByTestId('field')).not.toHaveAttribute('data-ov-error');
  });

  it('renders children between description and error', () => {
    renderWithTheme(
      <FormField label="Host" description="Server hostname" error="Required">
        <input data-testid="child-input" />
      </FormField>,
    );

    const description = screen.getByText('Server hostname');
    const childInput = screen.getByTestId('child-input');
    const error = screen.getByRole('alert');

    // Verify DOM order: description before input, input before error
    const root = description.parentElement!;
    const children = Array.from(root.children);
    const descIdx = children.indexOf(description);
    const controlIdx = children.indexOf(childInput.parentElement!);
    const errorIdx = children.indexOf(error);

    expect(descIdx).toBeLessThan(controlIdx);
    expect(controlIdx).toBeLessThan(errorIdx);
  });

  it('sets data-ov-size attribute', () => {
    renderWithTheme(
      <FormField label="Size Test" size="sm" data-testid="field">
        <input />
      </FormField>,
    );

    expect(screen.getByTestId('field')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('defaults data-ov-size to md', () => {
    renderWithTheme(
      <FormField label="Default" data-testid="field">
        <input />
      </FormField>,
    );

    expect(screen.getByTestId('field')).toHaveAttribute('data-ov-size', 'md');
  });

  it('merges className', () => {
    renderWithTheme(
      <FormField label="Merge" className="custom-class" data-testid="field">
        <input />
      </FormField>,
    );

    expect(screen.getByTestId('field').className).toContain('custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <FormField label="Ref" ref={ref}>
        <input />
      </FormField>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

// ---------------------------------------------------------------------------
// FormSection
// ---------------------------------------------------------------------------

describe('FormSection', () => {
  it('renders as fieldset with legend', () => {
    renderWithTheme(
      <FormSection title="Account Settings" data-testid="section">
        <div>Content</div>
      </FormSection>,
    );

    const section = screen.getByTestId('section');
    expect(section.tagName).toBe('FIELDSET');
    expect(screen.getByText('Account Settings').tagName).toBe('LEGEND');
  });

  it('renders description', () => {
    renderWithTheme(
      <FormSection title="Networking" description="Configure network settings">
        <div>Content</div>
      </FormSection>,
    );

    expect(screen.getByText('Configure network settings')).toBeInTheDocument();
  });

  it('merges className', () => {
    renderWithTheme(
      <FormSection title="Custom" className="my-section" data-testid="section">
        <div>Content</div>
      </FormSection>,
    );

    expect(screen.getByTestId('section').className).toContain('my-section');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLFieldSetElement>();
    renderWithTheme(
      <FormSection title="Ref Test" ref={ref}>
        <div>Content</div>
      </FormSection>,
    );

    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
  });

  it('renders children inside section', () => {
    renderWithTheme(
      <FormSection title="Group">
        <div data-testid="child-a">A</div>
        <div data-testid="child-b">B</div>
      </FormSection>,
    );

    expect(screen.getByTestId('child-a')).toBeInTheDocument();
    expect(screen.getByTestId('child-b')).toBeInTheDocument();
  });
});
