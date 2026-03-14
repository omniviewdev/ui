export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  loading: boolean;
  error?: 'blocked' | 'not-found';
  history: string[];
  historyIndex: number;
}

export interface Bookmark {
  id: string;
  label: string;
  url: string;
  favicon?: string;
}
