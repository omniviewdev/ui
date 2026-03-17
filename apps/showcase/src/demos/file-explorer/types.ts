// apps/showcase/src/demos/file-explorer/types.ts

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;         // bytes
  modified?: string;     // ISO date string
  permissions?: string;  // e.g. "rw-r--r--"
  extension?: string;    // e.g. "tsx", "json"
  children?: FileNode[];
  content?: string;      // preview content for text files
  owner?: string;        // e.g. "sftpclient"
  group?: string;        // e.g. "sftp"
}

export interface FileSelection {
  pane: 'local' | 'remote';
  node: FileNode;
  path: string[];  // breadcrumb segments
}

export interface Transfer {
  id: string;
  source: string;
  direction: 'upload' | 'download';
  destination: string;
  size: number;
  priority: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  remaining?: string;
  speed?: string;
  progress: number; // 0-100
}

export interface LogEntry {
  id: string;
  type: 'command' | 'response';
  message: string;
  timestamp: string;
}
