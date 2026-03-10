import type { Meta, StoryObj } from '@storybook/react';
import { PermissionRequest } from './PermissionRequest';

const meta: Meta<typeof PermissionRequest> = {
  title: 'AI/Permissions/PermissionRequest',
  component: PermissionRequest,
  tags: ['autodocs'],
  args: {
    tool: 'write_file',
    description: 'Write changes to the configuration file',
    scope: 'file:/etc/app/config.yaml',
    onAllow: () => alert('Allowed'),
    onDeny: () => alert('Denied'),
    onAllowAlways: () => alert('Always allowed'),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ShellCommand: Story = {
  name: 'Shell Command',
  args: {
    tool: 'execute_command',
    description: 'Install project dependencies',
    scope: 'workspace',
    content: 'npm install --save-dev @types/react @types/react-dom typescript',
    onAllowAlways: undefined,
  },
};

export const LongShellScript: Story = {
  name: 'Long Shell Script',
  args: {
    tool: 'execute_command',
    description: 'Build and deploy the application to staging',
    scope: 'workspace',
    content: `#!/bin/bash
set -euo pipefail

echo "Building application..."
npm run build

echo "Running tests..."
npm run test -- --coverage

echo "Building Docker image..."
docker build -t myapp:latest \\
  --build-arg NODE_ENV=production \\
  --build-arg API_URL=https://api.staging.example.com \\
  -f Dockerfile.production .

echo "Pushing to registry..."
docker tag myapp:latest registry.example.com/myapp:staging
docker push registry.example.com/myapp:staging

echo "Deploying to staging..."
kubectl apply -f k8s/staging/
kubectl rollout status deployment/myapp -n staging --timeout=120s

echo "Done!"`,
  },
};

export const PipedCommand: Story = {
  name: 'Piped Command',
  args: {
    tool: 'execute_command',
    description: 'Find and kill processes on port 3000',
    scope: 'system',
    content: "lsof -ti :3000 | xargs kill -9 && echo 'Port 3000 cleared'",
    onAllowAlways: undefined,
  },
};

export const WithoutAlwaysAllow: Story = {
  name: 'Without Always Allow',
  args: {
    tool: 'execute_command',
    description: 'Run npm install to install project dependencies',
    scope: 'workspace',
    onAllowAlways: undefined,
  },
};

export const DeleteAction: Story = {
  name: 'Destructive Scope',
  args: {
    tool: 'delete_file',
    description: 'Delete the temporary build artifacts directory',
    scope: 'file:/dist/**/*',
    content: 'rm -rf dist/ .cache/ node_modules/.cache/',
  },
};

export const LongScope: Story = {
  name: 'Long Scope Path',
  args: {
    tool: 'read_file',
    description: 'Read the Kubernetes deployment manifest for analysis',
    scope: 'file:/home/user/projects/my-app/k8s/deployments/production/api-server.yaml',
  },
};

export const MultipleRequests: Story = {
  name: 'Multiple Requests',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PermissionRequest
        tool="write_file"
        description="Update the nginx configuration"
        scope="file:/etc/nginx/nginx.conf"
        onAllow={() => {}}
        onDeny={() => {}}
        onAllowAlways={() => {}}
      />
      <PermissionRequest
        tool="execute_command"
        description="Restart the nginx service"
        scope="system"
        content="sudo systemctl restart nginx && systemctl status nginx"
        onAllow={() => {}}
        onDeny={() => {}}
      />
    </div>
  ),
};
