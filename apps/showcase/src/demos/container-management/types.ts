export type ContainerStatus = 'running' | 'stopped' | 'paused' | 'restarting' | 'exited';

export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  cpu: number;       // 0-100 percentage
  memory: number;    // MB
  memoryLimit: number; // MB
  ports: PortMapping[];
  created: string;   // ISO date
  uptime: string;
  network: string;
  disk: string;
}

export interface PortMapping {
  host: number;
  container: number;
  protocol: 'tcp' | 'udp';
}

export interface ContainerDetail extends Container {
  logs: string;
  config: Record<string, unknown>;
  filesystem: FileSystemNode[];
  stats: ContainerStats;
}

export interface ContainerStats {
  cpuHistory: number[];
  memoryHistory: number[];
  networkRx: string;
  networkTx: string;
  diskRead: string;
  diskWrite: string;
  pids: number;
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileSystemNode[];
}
