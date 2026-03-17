export interface IDEFile {
  id: string;
  name: string;
  path: string;         // e.g. "src/components/App.tsx"
  language: string;     // Monaco language id: "typescript", "css", "json", "markdown"
  content: string;
}

export interface IDETab {
  id: string;
  file: IDEFile;
  type: 'code' | 'diff' | 'markdown';
  originalContent?: string;  // For diff tabs only
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;  // surrounding text
}

export interface GitStatusEntry {
  file: string;
  status: 'modified' | 'staged' | 'untracked';
}

export type SidebarPanel = 'files' | 'search' | 'git';
