import type { Meta, StoryObj } from '@storybook/react';
import {
  LuSearch,
  LuFileText,
  LuCode,
  LuCircleCheck,
} from 'react-icons/lu';
import {
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
  ChainOfThoughtFiles,
  ChainOfThoughtFile,
} from './ChainOfThought';

const meta: Meta<typeof ChainOfThought> = {
  title: 'AI/Reasoning/ChainOfThought',
  component: ChainOfThought,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Declarative API (backwards-compatible)
export const Playground: Story = {
  args: {
    defaultOpen: true,
    header: 'Analyzing your request',
    steps: [
      { id: '1', label: 'Parse input', description: 'Tokenizing user query...', status: 'complete' },
      { id: '2', label: 'Analyze dependencies', description: 'Checking import graph...', status: 'complete' },
      { id: '3', label: 'Generate solution', description: 'Building response...', status: 'active' },
      { id: '4', label: 'Validate output', description: '', status: 'pending' },
    ],
  },
};

// Compound component API (MUI Treasury style)
export const CompoundAPI: Story = {
  render: () => (
    <ChainOfThought defaultOpen>
      <ChainOfThoughtStep
        icon={LuSearch}
        label="Searching for relevant information"
        description="Looking through documentation and examples"
        status="complete"
      >
        <ChainOfThoughtSearchResults>
          <ChainOfThoughtSearchResult label="React Hooks" />
          <ChainOfThoughtSearchResult label="useState" />
          <ChainOfThoughtSearchResult label="useEffect" />
        </ChainOfThoughtSearchResults>
      </ChainOfThoughtStep>

      <ChainOfThoughtStep
        icon={LuFileText}
        label="Reading documentation"
        description="Found 3 relevant articles"
        status="complete"
      />

      <ChainOfThoughtStep
        icon={LuCode}
        label="Generating solution"
        description="Creating optimized code based on best practices"
        status="active"
      />

      <ChainOfThoughtStep
        icon={LuCircleCheck}
        label="Verifying output"
        status="pending"
      />
    </ChainOfThought>
  ),
};

// With tags in declarative API
export const WithTags: Story = {
  args: {
    defaultOpen: true,
    header: 'Processing image analysis',
    steps: [
      {
        id: '1',
        label: 'Analyzing image content',
        description: 'Identifying objects and patterns',
        status: 'complete',
        tags: ['Dashboard UI', 'Charts', 'Data Table'],
      },
      {
        id: '2',
        label: 'Extracting text elements',
        description: 'Found title, labels, and data points',
        status: 'complete',
      },
      {
        id: '3',
        label: 'Complete',
        description: 'Analysis finished successfully',
        status: 'complete',
      },
    ],
  },
};

// With image
export const WithImage: Story = {
  render: () => (
    <ChainOfThought defaultOpen header="Generating visualization">
      <ChainOfThoughtStep
        icon={LuSearch}
        label="Gathering data"
        description="Collecting metrics from the last 30 days"
        status="complete"
      >
        <ChainOfThoughtSearchResults>
          <ChainOfThoughtSearchResult label="Sales Data" />
          <ChainOfThoughtSearchResult label="User Activity" />
          <ChainOfThoughtSearchResult label="Performance Metrics" />
        </ChainOfThoughtSearchResults>
      </ChainOfThoughtStep>

      <ChainOfThoughtStep
        icon={LuCode}
        label="Creating chart"
        description="Generating interactive visualization"
        status="complete"
      >
        <ChainOfThoughtImage caption="Monthly sales performance chart">
          <div
            style={{
              width: '100%',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--ov-color-border-default)',
              borderRadius: 6,
              color: 'var(--ov-color-fg-muted)',
              fontSize: 13,
            }}
          >
            [Chart Visualization]
          </div>
        </ChainOfThoughtImage>
      </ChainOfThoughtStep>

      <ChainOfThoughtStep
        icon={LuCircleCheck}
        label="Visualization ready"
        description="Chart has been generated successfully"
        status="complete"
      />
    </ChainOfThought>
  ),
};

// Collapsed by default
export const CollapsedByDefault: Story = {
  args: {
    header: 'Advanced Reasoning Process',
    steps: [
      { id: '1', label: 'Step 1: Initialize', status: 'complete' },
      { id: '2', label: 'Step 2: Process', description: 'Processing complex algorithms', status: 'active' },
      { id: '3', label: 'Step 3: Finalize', status: 'pending' },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    defaultOpen: true,
    steps: [
      { id: '1', label: 'Read file', description: 'Read src/index.ts', status: 'complete' },
      { id: '2', label: 'Identify issue', description: 'Found missing import', status: 'complete' },
      { id: '3', label: 'Apply fix', description: 'Added import statement', status: 'complete' },
      { id: '4', label: 'Run tests', description: 'All 42 tests passed', status: 'complete' },
    ],
  },
};

export const WithError: Story = {
  args: {
    defaultOpen: true,
    steps: [
      { id: '1', label: 'Fetch data', description: 'Retrieved 150 records', status: 'complete' },
      { id: '2', label: 'Process records', description: 'Schema validation failed', status: 'error' },
      { id: '3', label: 'Write output', description: '', status: 'pending' },
    ],
  },
};

// With file badges
export const WithFiles: Story = {
  render: () => (
    <ChainOfThought defaultOpen header="Analyzing cluster configuration">
      <ChainOfThoughtStep
        icon={LuSearch}
        label="Reading configuration files"
        description="Found 4 relevant files"
        status="complete"
      >
        <ChainOfThoughtFiles>
          <ChainOfThoughtFile
            name="deployment.yaml"
            type="config"
            path="/manifests/production/deployment.yaml"
          />
          <ChainOfThoughtFile
            name="service.yaml"
            type="config"
            path="/manifests/production/service.yaml"
          />
          <ChainOfThoughtFile
            name="app.log"
            type="log"
            path="/var/log/pods/my-app/app.log"
          />
          <ChainOfThoughtFile
            name="https://k8s.io/docs"
            type="url"
            onClick={() => console.log('Navigate to URL')}
          />
        </ChainOfThoughtFiles>
      </ChainOfThoughtStep>

      <ChainOfThoughtStep
        icon={LuFileText}
        label="Querying metrics"
        description="Checking resource utilization"
        status="complete"
      >
        <ChainOfThoughtFiles>
          <ChainOfThoughtFile name="cpu_usage" type="query" />
          <ChainOfThoughtFile name="memory_usage" type="query" />
          <ChainOfThoughtFile name="pod-metrics" type="resource" path="kube-system/metrics-server" />
        </ChainOfThoughtFiles>
      </ChainOfThoughtStep>

      <ChainOfThoughtStep
        icon={LuCode}
        label="Generating recommendations"
        status="active"
      />
    </ChainOfThought>
  ),
};
