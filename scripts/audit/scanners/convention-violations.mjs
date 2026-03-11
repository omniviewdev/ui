// scripts/audit/scanners/convention-violations.mjs
import { findFiles, readLines, finding } from '../utils.mjs';

const INLINE_STYLE = /style\s*=\s*\{\s*\{/;

/**
 * Returns true when a line's inline style object contains ONLY CSS custom properties
 * (keys starting with --). This allows the prescribed CSS-variable pass-through pattern:
 *   style={{ '--_dynamic-value': value }}
 */
function isCssVarOnlyStyle(line) {
  // Extract the content between style={{ and the closing }}
  const styleMatch = line.match(/style\s*=\s*\{\s*\{([\s\S]*?)\}\s*\}/);
  if (!styleMatch) return false;
  const body = styleMatch[1];

  // Split on commas to get individual key-value pairs (simplified parse)
  // Each pair should be: ['--key']: value or '--key': value or "--key": value
  const pairs = body.split(',');
  if (pairs.length === 0) return false;

  const CSS_VAR_KEY = /^\s*['"]?(--[A-Za-z0-9\-_]+)['"]?\s*:/;

  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue; // skip trailing empty splits
    if (!CSS_VAR_KEY.test(trimmed)) return false;
  }

  return true;
}

export async function scanConventionViolations() {
  const results = [];

  // --- Inline styles in JSX (High) ---
  const tsxFiles = await findFiles('packages/*/src/**/*.tsx');

  for (const file of tsxFiles) {
    const lines = readLines(file);
    for (const { line, num } of lines) {
      if (INLINE_STYLE.test(line) && !isCssVarOnlyStyle(line)) {
        results.push(finding('High', 'Convention', 'Inline style', file, num, line,
          'style={{}} found — use CSS Modules + data attributes'));
      }
    }
  }

  // --- CSS class naming convention (Low) ---
  const cssFiles = await findFiles('packages/*/src/**/*.module.css');

  for (const file of cssFiles) {
    const lines = readLines(file);
    for (const { line, num } of lines) {
      // Match CSS class selectors
      const classMatch = line.match(/\.([a-zA-Z_][\w-]*)/g);
      if (!classMatch) continue;
      for (const cls of classMatch) {
        const name = cls.slice(1); // remove leading dot
        // Root slots should be PascalCase
        // Modifiers should be camelCase
        // Flag kebab-case as a violation
        if (name.includes('-') && !name.startsWith('ov-')) {
          results.push(finding('Low', 'Convention', 'CSS class naming', file, num, line,
            `Class ".${name}" uses kebab-case — use PascalCase (slots) or camelCase (modifiers)`));
        }
      }
    }
  }

  // --- Missing data attributes (Medium) ---
  // Components using CSS classes for interactive state instead of data-ov-* / data-* attributes
  for (const file of cssFiles) {
    const lines = readLines(file);
    for (const { line, num } of lines) {
      // Flag CSS that uses class-based state selectors instead of data attributes
      // e.g. .Root.active, .Root.selected, .Root.disabled, .Root.focused
      if (/\.(active|selected|disabled|focused|hover|pressed|open|closed|expanded|collapsed)\b/.test(line) &&
          !line.includes('data-') && !line.includes(':hover') && !line.includes(':focus') &&
          !line.includes(':active') && !line.includes(':disabled')) {
        results.push(finding('Medium', 'Convention', 'Missing data attributes', file, num, line,
          'State styling via CSS class — use data-ov-* or Base UI data-* attributes'));
      }
    }
  }

  // --- Inconsistent exports (Medium) ---
  // Check that each component directory has a proper barrel export
  const { existsSync } = await import('fs');
  const allComponentDirs = await findFiles('packages/*/src/components/*/*.tsx');

  // Get unique component directories
  const dirSet = new Set(allComponentDirs.map(f => f.replace(/\/[^/]+$/, '')));
  for (const dir of dirSet) {
    const hasIndex = existsSync(`${dir}/index.ts`) || existsSync(`${dir}/index.tsx`);
    if (!hasIndex) {
      results.push(finding('Medium', 'Convention', 'Inconsistent exports', dir, 0, '',
        'Component directory missing barrel export (index.ts)'));
    }
  }

  // --- Large component files (Low) ---
  const tsxFilesAll = await findFiles('packages/*/src/**/*.tsx');
  for (const file of tsxFilesAll) {
    const lines = readLines(file);
    if (lines.length > 300) {
      results.push(finding('Low', 'Convention', 'Large component file', file, 1, '',
        `File has ${lines.length} lines (threshold: 300) — consider splitting`));
    }
  }

  return results;
}
