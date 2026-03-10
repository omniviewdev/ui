import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAI } from '../../test/render';
import { AIMarkdown } from './AIMarkdown';

describe('AIMarkdown', () => {
  it('renders paragraphs', () => {
    renderAI(<AIMarkdown content="Hello world" data-testid="md" />);
    expect(screen.getByTestId('md').querySelector('p')).toHaveTextContent('Hello world');
  });

  it('renders headings', () => {
    renderAI(<AIMarkdown content="## Title" data-testid="md" />);
    expect(screen.getByTestId('md').querySelector('h2')).toHaveTextContent('Title');
  });

  it('renders code blocks via CodeBlock', () => {
    renderAI(<AIMarkdown content={'```js\nconst x = 1;\n```'} data-testid="md" />);
    const wrapper = screen.getByTestId('md').querySelector('[class*="CodeBlockWrapper"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('handles unclosed code blocks (streaming)', () => {
    renderAI(<AIMarkdown content={'```python\nprint("hi")'} streaming data-testid="md" />);
    // react-markdown renders unclosed fences as code blocks
    const el = screen.getByTestId('md');
    expect(el.textContent).toContain('print("hi")');
  });

  it('renders inline code', () => {
    renderAI(<AIMarkdown content="Use `foo()` here" data-testid="md" />);
    const el = screen.getByTestId('md');
    expect(el.textContent).toContain('foo()');
  });

  it('renders bold and italic', () => {
    renderAI(<AIMarkdown content="**bold** and *italic*" data-testid="md" />);
    const el = screen.getByTestId('md');
    expect(el.querySelector('strong')).toHaveTextContent('bold');
    expect(el.querySelector('em')).toHaveTextContent('italic');
  });

  it('renders unordered lists', () => {
    const content = '- item 1\n- item 2';
    renderAI(<AIMarkdown content={content} data-testid="md" />);
    const items = screen.getByTestId('md').querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  it('renders links', () => {
    renderAI(<AIMarkdown content="[Click](https://example.com)" data-testid="md" />);
    const link = screen.getByTestId('md').querySelector('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveTextContent('Click');
  });

  it('renders blockquotes', () => {
    renderAI(<AIMarkdown content="> Quote text" data-testid="md" />);
    const el = screen.getByTestId('md');
    expect(el.textContent).toContain('Quote text');
  });

  it('renders tables (GFM)', () => {
    const content = '| A | B |\n|---|---|\n| 1 | 2 |';
    renderAI(<AIMarkdown content={content} data-testid="md" />);
    const el = screen.getByTestId('md');
    expect(el.querySelector('th')).toHaveTextContent('A');
    expect(el.querySelector('td')).toHaveTextContent('1');
  });

  it('renders task list checkboxes (GFM)', () => {
    const content = '- [x] Done\n- [ ] Todo';
    renderAI(<AIMarkdown content={content} data-testid="md" />);
    const items = screen.getByTestId('md').querySelectorAll('li');
    expect(items).toHaveLength(2);
  });

  it('does not render script tags in content', () => {
    renderAI(<AIMarkdown content="<script>alert('xss')</script>" data-testid="md" />);
    expect(screen.getByTestId('md').querySelector('script')).toBeNull();
  });

  it('applies streaming data attribute', () => {
    renderAI(<AIMarkdown content="test" streaming data-testid="md" />);
    expect(screen.getByTestId('md')).toHaveAttribute('data-ov-streaming', 'true');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AIMarkdown ref={ref} content="test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<AIMarkdown content="test" className="custom" data-testid="md" />);
    expect(screen.getByTestId('md').className).toContain('custom');
  });
});
