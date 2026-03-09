import type { Meta, StoryObj } from '@storybook/react';
import { ObjectInspector } from './ObjectInspector';

const sampleData = {
  apiVersion: 'v1',
  kind: 'Pod',
  metadata: {
    name: 'my-pod',
    namespace: 'default',
    labels: {
      app: 'web',
      version: 'v1.2.3',
    },
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration': '...',
    },
    creationTimestamp: '2024-01-15T10:30:00Z',
    uid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  },
  spec: {
    containers: [
      {
        name: 'web',
        image: 'nginx:latest',
        ports: [{ containerPort: 80, protocol: 'TCP' }],
        env: [
          { name: 'NODE_ENV', value: 'production' },
          { name: 'PORT', value: '8080' },
        ],
        resources: {
          limits: { cpu: '500m', memory: '128Mi' },
          requests: { cpu: '100m', memory: '64Mi' },
        },
      },
      {
        name: 'sidecar',
        image: 'envoy:v1.28',
        ports: [{ containerPort: 9901 }],
      },
    ],
    restartPolicy: 'Always',
    serviceAccountName: 'default',
    nodeName: 'worker-node-1',
  },
  status: {
    phase: 'Running',
    conditions: [
      { type: 'Ready', status: true, lastTransitionTime: '2024-01-15T10:31:00Z' },
      { type: 'PodScheduled', status: true, lastTransitionTime: '2024-01-15T10:30:00Z' },
      { type: 'ContainersReady', status: true, lastTransitionTime: '2024-01-15T10:31:00Z' },
      { type: 'Initialized', status: true, lastTransitionTime: '2024-01-15T10:30:05Z' },
    ],
    containerStatuses: [
      {
        name: 'web',
        ready: true,
        restartCount: 0,
        state: { running: { startedAt: '2024-01-15T10:30:30Z' } },
      },
      {
        name: 'sidecar',
        ready: true,
        restartCount: 2,
        state: { running: { startedAt: '2024-01-15T10:30:45Z' } },
      },
    ],
    startTime: '2024-01-15T10:30:00Z',
    podIP: '10.244.0.5',
    hostIP: '192.168.1.100',
  },
};

const meta: Meta<typeof ObjectInspector> = {
  title: 'Editors/ObjectInspector',
  component: ObjectInspector,
  tags: ['autodocs'],
  args: {
    data: sampleData,
    defaultExpanded: 2,
  },
  argTypes: {
    format: { control: 'radio', options: ['json', 'yaml'] },
    defaultExpanded: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    searchable: { control: 'boolean' },
    copyable: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, height: 500, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const FullyExpanded: Story = {
  args: {
    defaultExpanded: true,
  },
};

export const Collapsed: Story = {
  args: {
    defaultExpanded: 0,
  },
};

export const WithSearch: Story = {
  args: {
    searchable: true,
    defaultExpanded: true,
  },
};

export const WithCopy: Story = {
  args: {
    copyable: true,
  },
};

export const WithSearchAndCopy: Story = {
  args: {
    searchable: true,
    copyable: true,
    defaultExpanded: true,
  },
};

export const YamlFormat: Story = {
  args: {
    format: 'yaml',
    copyable: true,
  },
};

export const SimpleArray: Story = {
  args: {
    data: ['hello', 42, true, null, { nested: 'value' }],
    defaultExpanded: true,
  },
};

/** Demonstrates handling of all primitive types. */
export const PrimitiveTypes: Story = {
  args: {
    data: {
      string: 'hello world',
      number: 42,
      float: 3.14159,
      booleanTrue: true,
      booleanFalse: false,
      nullValue: null,
      emptyString: '',
      zero: 0,
      negativeNumber: -100,
      largeNumber: 9007199254740991,
    },
    defaultExpanded: true,
  },
};

/** Deeply nested data structure. */
export const DeepNesting: Story = {
  args: {
    data: {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: {
                  value: 'deeply nested',
                },
              },
            },
          },
        },
      },
    },
    defaultExpanded: 3,
  },
};

/** Circular reference handling — should display [Circular] instead of crashing. */
export const CircularReference: Story = {
  args: (() => {
    const obj: Record<string, unknown> = {
      name: 'root',
      children: [
        { name: 'child-1', type: 'leaf' },
        { name: 'child-2', type: 'leaf' },
      ],
    };
    obj.self = obj;
    (obj.children as Record<string, unknown>[])[0]!.parent = obj;
    return { data: obj, defaultExpanded: true };
  })(),
};

/** Empty object and array edge cases. */
export const EmptyContainers: Story = {
  args: {
    data: {
      emptyObject: {},
      emptyArray: [],
      nonEmpty: { key: 'value' },
      nonEmptyArray: [1, 2],
    },
    defaultExpanded: true,
  },
};

/** Large flat object with many properties. */
export const ManyProperties: Story = {
  args: {
    data: Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`property_${i + 1}`, `value_${i + 1}`]),
    ),
    defaultExpanded: true,
  },
};

/** Complex Kubernetes service list response. */
export const KubernetesServiceList: Story = {
  args: {
    data: {
      apiVersion: 'v1',
      kind: 'ServiceList',
      items: [
        {
          metadata: { name: 'kubernetes', namespace: 'default' },
          spec: {
            type: 'ClusterIP',
            clusterIP: '10.96.0.1',
            ports: [{ port: 443, targetPort: 6443, protocol: 'TCP' }],
          },
        },
        {
          metadata: { name: 'web-frontend', namespace: 'production' },
          spec: {
            type: 'LoadBalancer',
            clusterIP: '10.96.1.50',
            ports: [
              { name: 'http', port: 80, targetPort: 8080, protocol: 'TCP' },
              { name: 'https', port: 443, targetPort: 8443, protocol: 'TCP' },
            ],
            selector: { app: 'web', tier: 'frontend' },
          },
          status: {
            loadBalancer: {
              ingress: [{ ip: '203.0.113.50' }],
            },
          },
        },
      ],
    },
    defaultExpanded: 2,
    searchable: true,
    copyable: true,
  },
};
