import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LuCopy, LuDownload, LuExternalLink, LuTrash } from 'react-icons/lu';
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

const meta: Meta<typeof AIArtifact> = {
  title: 'AI/Artifact/AIArtifact',
  component: AIArtifact,
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

export const Embedded: Story = {
  render: () => (
    <AIArtifact variant="embedded">
      <AIArtifactHeader>
        <div style={{ flex: 1 }}>
          <AIArtifactTitle>deployment.yaml</AIArtifactTitle>
          <AIArtifactDescription>Generated Kubernetes deployment manifest</AIArtifactDescription>
        </div>
        <AIArtifactActions>
          <AIArtifactAction icon={LuCopy} label="Copy" tooltip="Copy to clipboard" />
          <AIArtifactAction icon={LuDownload} label="Download" tooltip="Download file" />
        </AIArtifactActions>
      </AIArtifactHeader>
      <AIArtifactContent>
        <pre style={{ margin: 0, padding: 12, fontSize: 13, lineHeight: 1.5, overflow: 'auto' }}>
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 8080`}
        </pre>
      </AIArtifactContent>
    </AIArtifact>
  ),
};

export const Panel: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    if (!open) {
      return <button type="button" onClick={() => setOpen(true)}>Open artifact panel</button>;
    }
    return (
      <AIArtifact variant="panel" open={open} style={{ height: 400 }}>
        <AIArtifactHeader>
          <div style={{ flex: 1 }}>
            <AIArtifactTitle>Network Policy</AIArtifactTitle>
            <AIArtifactDescription>Restricts traffic between namespaces</AIArtifactDescription>
          </div>
          <AIArtifactActions>
            <AIArtifactAction icon={LuExternalLink} label="Open in editor" tooltip="Open in editor" />
            <AIArtifactAction icon={LuCopy} label="Copy" tooltip="Copy" />
          </AIArtifactActions>
          <AIArtifactClose onClick={() => setOpen(false)} />
        </AIArtifactHeader>
        <AIArtifactContent>
          <pre style={{ margin: 0, padding: 16, fontSize: 13, lineHeight: 1.5, overflow: 'auto' }}>
{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
spec:
  podSelector: {}
  policyTypes:
  - Ingress`}
          </pre>
        </AIArtifactContent>
      </AIArtifact>
    );
  },
};

export const WithDestructiveAction: Story = {
  render: () => (
    <AIArtifact variant="embedded">
      <AIArtifactHeader>
        <div style={{ flex: 1 }}>
          <AIArtifactTitle>Generated Script</AIArtifactTitle>
        </div>
        <AIArtifactActions>
          <AIArtifactAction icon={LuCopy} label="Copy" tooltip="Copy" />
          <AIArtifactAction icon={LuTrash} label="Delete" tooltip="Delete artifact" destructive />
        </AIArtifactActions>
      </AIArtifactHeader>
      <AIArtifactContent>
        <pre style={{ margin: 0, padding: 12, fontSize: 13 }}>
          kubectl rollout restart deployment/my-app -n production
        </pre>
      </AIArtifactContent>
    </AIArtifact>
  ),
};

export const MinimalHeader: Story = {
  render: () => (
    <AIArtifact variant="embedded">
      <AIArtifactHeader>
        <AIArtifactTitle>Quick snippet</AIArtifactTitle>
      </AIArtifactHeader>
      <AIArtifactContent>
        <p style={{ margin: 0, padding: 12 }}>A simple artifact with just a title and content.</p>
      </AIArtifactContent>
    </AIArtifact>
  ),
};
