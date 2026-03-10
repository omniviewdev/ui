import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderAI } from '../../test/render';
import {
  AIArtifact,
  AIArtifactHeader,
  AIArtifactTitle,
  AIArtifactDescription,
  AIArtifactClose,
  AIArtifactActions,
  AIArtifactAction,
  AIArtifactContent,
} from './AIArtifact';
import { LuCopy } from '../../system/icons';

describe('AIArtifact', () => {
  it('renders with children', () => {
    renderAI(<AIArtifact data-testid="art">content</AIArtifact>);
    expect(screen.getByTestId('art')).toHaveTextContent('content');
  });

  it('sets variant data attribute (default: embedded)', () => {
    renderAI(<AIArtifact data-testid="art">x</AIArtifact>);
    expect(screen.getByTestId('art')).toHaveAttribute('data-ov-variant', 'embedded');
  });

  it('sets variant data attribute to panel', () => {
    renderAI(<AIArtifact variant="panel" data-testid="art">x</AIArtifact>);
    expect(screen.getByTestId('art')).toHaveAttribute('data-ov-variant', 'panel');
  });

  it('sets open data attribute', () => {
    renderAI(<AIArtifact open data-testid="art">x</AIArtifact>);
    expect(screen.getByTestId('art')).toHaveAttribute('data-ov-open', 'true');
  });

  it('forwards ref on root', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<AIArtifact ref={ref}>x</AIArtifact>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<AIArtifact className="custom" data-testid="art">x</AIArtifact>);
    expect(screen.getByTestId('art').className).toContain('custom');
  });
});

describe('AIArtifactHeader', () => {
  it('renders children', () => {
    renderAI(<AIArtifactHeader data-testid="hdr">header content</AIArtifactHeader>);
    expect(screen.getByTestId('hdr')).toHaveTextContent('header content');
  });
});

describe('AIArtifactTitle', () => {
  it('renders as heading', () => {
    renderAI(<AIArtifactTitle>My Title</AIArtifactTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('My Title');
  });
});

describe('AIArtifactDescription', () => {
  it('renders as paragraph', () => {
    renderAI(<AIArtifactDescription data-testid="desc">Some description</AIArtifactDescription>);
    const el = screen.getByTestId('desc');
    expect(el.tagName).toBe('P');
    expect(el).toHaveTextContent('Some description');
  });
});

describe('AIArtifactClose', () => {
  it('is clickable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderAI(<AIArtifactClose onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /close artifact/i });
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('AIArtifactActions', () => {
  it('renders children', () => {
    renderAI(
      <AIArtifactActions data-testid="acts">
        <button>action1</button>
        <button>action2</button>
      </AIArtifactActions>,
    );
    expect(screen.getByTestId('acts').children).toHaveLength(2);
  });
});

describe('AIArtifactAction', () => {
  it('renders with icon and tooltip', () => {
    renderAI(<AIArtifactAction icon={LuCopy} label="Copy" tooltip="Copy content" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('renders without tooltip', () => {
    renderAI(<AIArtifactAction icon={LuCopy} label="Copy" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderAI(<AIArtifactAction label="Copy" onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('AIArtifactContent', () => {
  it('renders children', () => {
    renderAI(<AIArtifactContent data-testid="cnt">body content</AIArtifactContent>);
    expect(screen.getByTestId('cnt')).toHaveTextContent('body content');
  });
});
