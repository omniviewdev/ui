/** Format bytes to human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format ISO date to short date string */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

/** Derive file type label from a file node */
export function fileTypeLabel(node: { type: string; extension?: string }): string {
  if (node.type === 'folder') return 'Directory';
  if (!node.extension) return 'File';
  const map: Record<string, string> = {
    ts: 'ts-file', tsx: 'tsx-file', js: 'js-file', jsx: 'jsx-file',
    json: 'json-file', yaml: 'yaml-file', yml: 'yaml-file',
    css: 'css-file', html: 'html-file', md: 'markdown',
    png: 'image', jpg: 'image', webp: 'image', svg: 'svg-file',
    ico: 'icon', woff2: 'font', gz: 'archive', txt: 'text-file',
    cjs: 'js-file', gitignore: 'config',
  };
  return map[node.extension] ?? `${node.extension}-file`;
}
