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
      <FormField label="Email" required htmlFor="email">
        <input id="email" />
      </FormField>,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithTheme(
      <FormField label="Name" description="Enter your full name" htmlFor="name">
        <input id="name" />
      </FormField>,
    );

    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('renders error message with role=alert', () => {
    renderWithTheme(
      <FormField label="Password" error="Password is required" htmlFor="password">
        <input id="password" />
      </FormField>,
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Password is required');
  });

  it('sets data-ov-error when error is present', () => {
    renderWithTheme(
      <FormField label="Port" error="Invalid port" data-testid="field" htmlFor="port">
        <input id="port" />
      </FormField>,
    );

    expect(screen.getByTestId('field')).toHaveAttribute('data-ov-error', 'true');
  });

  it('does not set data-ov-error when no error', () => {
    renderWithTheme(
      <FormField label="Port" data-testid="field" htmlFor="port">
        <input id="port" />
      </FormField>,
    );

    expect(screen.getByTestId('field')).not.toHaveAttribute('data-ov-error');
  });

  it('renders children between description and error', () => {
    renderWithTheme(
      <FormField label="Host" description="Server hostname" error="Required" htmlFor="host">
        <input id="host" data-testid="child-input" />
      </FormField>,
    );

    const description = screen.getByText('Server hostname');
    const childInput = screen.getByTestId('child-input');
    const error = screen.getByRole('alert');

    // Verify DOM order: description before input, input before error
    const DOCUMENT_POSITION_FOLLOWING = 4;
    expect(description.compareDocumentPosition(childInput) & DOCUMENT_POSITION_FOLLOWING).toBe(
      DOCUMENT_POSITION_FOLLOWING,
    );
    expect(childInput.compareDocumentPosition(error) & DOCUMENT_POSITION_FOLLOWING).toBe(
      DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('sets data-ov-size attribute', () => {
    renderWithTheme(
      <FormField label="Size Test" size="sm" data-testid="field" htmlFor="size-test">
        <input id="size-test" />
      </FormField>,
    );

    expect(screen.getByTestId('field')).toHaveAttribute('data-ov-size', 'sm');
  });

  it('defaults data-ov-size to md', () => {
    renderWithTheme(
      <FormField label="Default" data-testid="field" htmlFor="default">
        <input id="default" />
      </FormField>,
    );

    expect(screen.getByTestId('field')).toHaveAttribute('data-ov-size', 'md');
  });

  it('merges className', () => {
    renderWithTheme(
      <FormField label="Merge" className="custom-class" data-testid="field" htmlFor="merge">
        <input id="merge" />
      </FormField>,
    );

    expect(screen.getByTestId('field').className).toContain('custom-class');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(
      <FormField label="Ref" ref={ref} htmlFor="ref-test">
        <input id="ref-test" />
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
