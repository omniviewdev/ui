import type { Bookmark } from './types';

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'bm-wiki', label: 'Wikipedia', url: 'https://en.wikipedia.org', favicon: '📖' },
  { id: 'bm-mdn', label: 'MDN Docs', url: 'https://developer.mozilla.org', favicon: '🔧' },
  { id: 'bm-example', label: 'Example', url: 'https://example.com', favicon: '🌐' },
  { id: 'bm-httpbin', label: 'HTTPBin', url: 'https://httpbin.org', favicon: '🔗' },
];

export const SPEED_DIAL_SITES = DEFAULT_BOOKMARKS;

export function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function ensureProtocol(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  return `https://${input}`;
}

export const NEW_TAB_URL = 'about:newtab';
