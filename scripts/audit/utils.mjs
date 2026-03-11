// scripts/audit/utils.mjs
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { relative } from 'path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');

/**
 * Find files matching a glob pattern relative to project root.
 * Excludes stories, tests, node_modules, dist, styles.css by default.
 */
export async function findFiles(pattern, opts = {}) {
  const {
    excludeStories = true,
    excludeTests = true,
    excludeStylesCSS = true,
    cwd = ROOT,
  } = opts;

  const ignore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/storybook-static/**',
  ];
  if (excludeStories) ignore.push('**/*.stories.tsx', '**/*.stories.ts');
  if (excludeTests) ignore.push('**/*.test.tsx', '**/*.test.ts');
  if (excludeStylesCSS) ignore.push('**/theme/styles.css');

  const files = await glob(pattern, { cwd, ignore, absolute: true });
  return files.sort();
}

/**
 * Read a file and return its lines with line numbers.
 */
export function readLines(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return content.split('\n').map((line, i) => ({ line, num: i + 1 }));
}

/**
 * Create a finding object.
 */
export function finding(severity, category, check, filePath, lineNum, line, message) {
  return {
    severity,
    category,
    check,
    file: relative(ROOT, filePath),
    line: lineNum,
    snippet: line.trim().slice(0, 120),
    message,
  };
}

export { ROOT };
