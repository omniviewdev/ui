import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownPreview } from './MarkdownPreview';

// Mock remark/rehype plugins
vi.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}));

vi.mock('rehype-raw', () => ({
  __esModule: true,
  default: () => {},
}));

vi.mock('rehype-sanitize', () => ({
  __esModule: true,
  default: () => {},
  defaultSchema: { tagNames: [], attributes: {} },
}));

// Mock base-ui components as simple pass-throughs
vi.mock('@omniviewdev/base-ui', () => ({
  CodeBlock: ({ children, language }: { children: string; language?: string }) => (
    <pre data-testid="codeblock" data-language={language}>
      {children}
    </pre>
  ),
  Code: ({ children }: { children: React.ReactNode }) => (
    <code data-testid="inline-code">{children}</code>
  ),
  Table: {
    Root: ({ children }: { children: React.ReactNode }) => (
      <table data-testid="table">{children}</table>
    ),
    Head: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
    Body: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
    Row: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
    HeaderCell: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
    Cell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  },
  Link: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <a data-testid="link" {...props}>
      {children}
    </a>
  ),
  Blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote data-testid="blockquote">{children}</blockquote>
  ),
  Separator: () => <hr data-testid="separator" />,
  Checkbox: Object.assign(
    ({ checked }: { checked?: boolean }) => (
      <input type="checkbox" data-testid="checkbox" checked={checked} readOnly />
    ),
    {
      Root: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
      Control: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
      Indicator: () => <span />,
    },
  ),
  Accordion: Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="accordion">{children}</div>
    ),
    {
      Item: ({ children, title }: { children: React.ReactNode; title: string }) => (
        <div data-testid="accordion-item" data-title={title}>
          {children}
        </div>
      ),
    },
  ),
}));

// Mock react-markdown
vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({
    children,
    skipHtml,
    remarkPlugins,
    rehypePlugins,
    components,
  }: {
    children: string;
    skipHtml?: boolean;
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
    components?: Record<string, unknown>;
  }) => (
    <div
      data-testid="react-markdown-mock"
      data-skip-html={String(skipHtml ?? true)}
      data-has-remark-plugins={String(Array.isArray(remarkPlugins) && remarkPlugins.length > 0)}
      data-has-rehype-plugins={String(Array.isArray(rehypePlugins) && rehypePlugins.length > 0)}
      data-component-keys={components ? Object.keys(components).sort().join(',') : ''}
    >
      {children}
    </div>
  ),
}));

describe('MarkdownPreview', () => {
  it('renders the preview container', () => {
    render(<MarkdownPreview content="Hello" />);
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('passes content to the markdown renderer', async () => {
    render(<MarkdownPreview content="# Title" />);
    expect(await screen.findByTestId('react-markdown-mock')).toHaveTextContent('# Title');
  });

  it('merges className', () => {
    render(<MarkdownPreview content="" className="custom-md" />);
    expect(screen.getByTestId('markdown-preview')).toHaveClass('custom-md');
  });

  it('forwards ref', () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLDivElement>;
    render(<MarkdownPreview content="" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes additional HTML attributes', () => {
    render(<MarkdownPreview content="" aria-label="Preview" />);
    expect(screen.getByTestId('markdown-preview')).toHaveAttribute('aria-label', 'Preview');
  });

  it('sets skipHtml=true by default (allowHtml=false)', async () => {
    render(<MarkdownPreview content="<div>html</div>" />);
    expect(await screen.findByTestId('react-markdown-mock')).toHaveAttribute('data-skip-html', 'true');
  });

  it('sets skipHtml=false when allowHtml=true', async () => {
    render(<MarkdownPreview content="<div>html</div>" allowHtml />);
    expect(await screen.findByTestId('react-markdown-mock')).toHaveAttribute('data-skip-html', 'false');
  });

  it('adds rehype plugins when allowHtml=true', async () => {
    render(<MarkdownPreview content="<div>html</div>" allowHtml />);
    expect(await screen.findByTestId('react-markdown-mock')).toHaveAttribute(
      'data-has-rehype-plugins',
      'true',
    );
  });

  it('does not add rehype plugins when allowHtml=false', async () => {
    render(<MarkdownPreview content="test" />);
    expect(await screen.findByTestId('react-markdown-mock')).toHaveAttribute(
      'data-has-rehype-plugins',
      'false',
    );
  });

  it('passes remarkPlugins to the renderer', async () => {
    render(<MarkdownPreview content="test" />);
    expect(await screen.findByTestId('react-markdown-mock')).toHaveAttribute(
      'data-has-remark-plugins',
      'true',
    );
  });

  it('provides component overrides for all mapped elements', async () => {
    render(<MarkdownPreview content="test" />);
    const md = await screen.findByTestId('react-markdown-mock');
    const keys = md.getAttribute('data-component-keys');
    expect(keys).toContain('code');
    expect(keys).toContain('pre');
    expect(keys).toContain('table');
    expect(keys).toContain('thead');
    expect(keys).toContain('tbody');
    expect(keys).toContain('tr');
    expect(keys).toContain('th');
    expect(keys).toContain('td');
    expect(keys).toContain('a');
    expect(keys).toContain('blockquote');
    expect(keys).toContain('hr');
    expect(keys).toContain('details');
    expect(keys).toContain('summary');
    expect(keys).toContain('input');
  });

  it('renders with empty content', async () => {
    render(<MarkdownPreview content="" />);
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    expect(await screen.findByTestId('react-markdown-mock')).toHaveTextContent('');
  });

  it('passes style prop through', () => {
    render(<MarkdownPreview content="" style={{ maxWidth: 500 }} />);
    expect(screen.getByTestId('markdown-preview')).toHaveStyle({ maxWidth: '500px' });
  });

  it('passes data attributes through', () => {
    render(<MarkdownPreview content="" data-section="readme" />);
    expect(screen.getByTestId('markdown-preview')).toHaveAttribute('data-section', 'readme');
  });
});
