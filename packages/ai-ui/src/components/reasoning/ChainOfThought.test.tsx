import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { renderAI } from '../../test/render';
import {
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtFiles,
  ChainOfThoughtFile,
} from './ChainOfThought';
import type { ChainOfThoughtStepData } from './ChainOfThought';

const steps: ChainOfThoughtStepData[] = [
  { id: '1', label: 'Analyzing request', description: 'Parsed the input', status: 'complete' },
  { id: '2', label: 'Searching codebase', description: 'Found 3 files', status: 'active' },
  { id: '3', label: 'Generating response', description: '', status: 'pending' },
];

describe('ChainOfThought', () => {
  it('renders all steps (declarative API)', () => {
    renderAI(<ChainOfThought steps={steps} defaultOpen />);
    expect(screen.getByText('Analyzing request')).toBeInTheDocument();
    expect(screen.getByText('Searching codebase')).toBeInTheDocument();
    expect(screen.getByText('Generating response')).toBeInTheDocument();
  });

  it('shows description for non-pending steps', () => {
    renderAI(<ChainOfThought steps={steps} defaultOpen />);
    expect(screen.getByText('Parsed the input')).toBeInTheDocument();
    expect(screen.getByText('Found 3 files')).toBeInTheDocument();
  });

  it('hides description for pending steps', () => {
    const pendingSteps: ChainOfThoughtStepData[] = [
      { id: '1', label: 'Step', description: 'hidden', status: 'pending' },
    ];
    renderAI(<ChainOfThought steps={pendingSteps} defaultOpen />);
    expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  });

  it('toggles open/close on header click', async () => {
    renderAI(<ChainOfThought steps={steps} data-testid="cot" />);
    // Collapsed by default
    expect(screen.getByTestId('cot')).toHaveAttribute('data-ov-open', 'false');
    // Click to open
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('cot')).toHaveAttribute('data-ov-open', 'true');
  });

  it('renders with compound component pattern', () => {
    renderAI(
      <ChainOfThought defaultOpen data-testid="cot">
        <ChainOfThoughtStep label="Step A" description="Desc A" status="complete" />
        <ChainOfThoughtStep label="Step B" status="active">
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult label="Tag1" />
            <ChainOfThoughtSearchResult label="Tag2" />
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    expect(screen.getByText('Step A')).toBeInTheDocument();
    expect(screen.getByText('Desc A')).toBeInTheDocument();
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });

  it('renders tags in declarative API', () => {
    const stepsWithTags: ChainOfThoughtStepData[] = [
      { id: '1', label: 'Search', status: 'complete', tags: ['React', 'Hooks'] },
    ];
    renderAI(<ChainOfThought steps={stepsWithTags} defaultOpen />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Hooks')).toBeInTheDocument();
  });

  it('has role list', () => {
    renderAI(<ChainOfThought steps={steps} data-testid="cot" />);
    expect(screen.getByTestId('cot')).toHaveAttribute('role', 'list');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderAI(<ChainOfThought ref={ref} steps={steps} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    renderAI(<ChainOfThought steps={steps} className="custom" data-testid="cot" />);
    expect(screen.getByTestId('cot').className).toContain('custom');
  });
});

describe('ChainOfThoughtFile', () => {
  it('renders name text', () => {
    renderAI(
      <ChainOfThought defaultOpen>
        <ChainOfThoughtStep label="Step" status="complete">
          <ChainOfThoughtFiles>
            <ChainOfThoughtFile name="values.yaml" />
          </ChainOfThoughtFiles>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    expect(screen.getByText('values.yaml')).toBeInTheDocument();
  });

  it('renders icon for each type', () => {
    const types = ['file', 'resource', 'log', 'config', 'query', 'url'] as const;
    renderAI(
      <ChainOfThought defaultOpen>
        <ChainOfThoughtStep label="Step" status="complete">
          <ChainOfThoughtFiles>
            {types.map((t) => (
              <ChainOfThoughtFile key={t} name={t} type={t} />
            ))}
          </ChainOfThoughtFiles>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    for (const t of types) {
      expect(screen.getByText(t)).toBeInTheDocument();
    }
  });

  it('shows tooltip when path is provided', async () => {
    renderAI(
      <ChainOfThought defaultOpen>
        <ChainOfThoughtStep label="Step" status="complete">
          <ChainOfThoughtFiles>
            <ChainOfThoughtFile name="pod.yaml" path="/var/log/pod.yaml" />
          </ChainOfThoughtFiles>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    // Hover to trigger tooltip
    await userEvent.hover(screen.getByText('pod.yaml'));
    expect(await screen.findByText('/var/log/pod.yaml')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    renderAI(
      <ChainOfThought defaultOpen>
        <ChainOfThoughtStep label="Step" status="complete">
          <ChainOfThoughtFiles>
            <ChainOfThoughtFile name="clickable.yaml" onClick={handleClick} />
          </ChainOfThoughtFiles>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    await userEvent.click(screen.getByText('clickable.yaml'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('ChainOfThoughtFiles', () => {
  it('renders children', () => {
    renderAI(
      <ChainOfThought defaultOpen>
        <ChainOfThoughtStep label="Step" status="complete">
          <ChainOfThoughtFiles>
            <ChainOfThoughtFile name="file-a.txt" />
            <ChainOfThoughtFile name="file-b.txt" />
          </ChainOfThoughtFiles>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    expect(screen.getByText('file-a.txt')).toBeInTheDocument();
    expect(screen.getByText('file-b.txt')).toBeInTheDocument();
  });
});
