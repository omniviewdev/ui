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
}

export interface FileSelection {
  pane: 'local' | 'remote';
  node: FileNode;
  path: string[];  // breadcrumb segments
}
