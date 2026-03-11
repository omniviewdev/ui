// scripts/audit/scanners/convention-violations.mjs
import { dirname, join } from 'path';
import { findFiles, readLines, finding } from '../utils.mjs';

const INLINE_STYLE = /style\s*=\s*\{\s*\{/;

/**
 * Returns true when an inline style object contains ONLY CSS custom properties
 * (keys starting with --). This allows the prescribed CSS-variable pass-through pattern:
 *   style={{ '--_dynamic-value': value }}
 *
 * Accepts the full file text starting from the style={{ match so multiline
 * objects are handled correctly.
 */
function isCssVarOnlyStyle(fullText, startIdx) {
  // Extract from `style={{` to the matching `}}` (or `} as CSSProperties}`)
  const fromStyle = fullText.slice(startIdx);
  const stripped = fromStyle.replace(/\}\s*as\s+(?:React\.)?CSSProperties/g, '}');

  const styleMatch = stripped.match(/style\s*=\s*\{\s*\{([\s\S]*?)\}\s*\}/m);
  if (!styleMatch) return false;

  const body = styleMatch[1];

  // If the body contains a spread operator, we can't guarantee CSS-var-only.
  if (/\.\.\./.test(body)) return false;

  // Check for any non-CSS-custom-property keys (keys that don't start with --)
  const NON_VAR_KEY = /['"]?(?!--)([A-Za-z_][\w-]*)['"]?\s*:/g;
  const hasNonVarKey = NON_VAR_KEY.test(body);

  // Check that at least one CSS var key exists
  const CSS_VAR_KEY = /['"]?(--[A-Za-z0-9\-_]+)['"]?\s*:/g;
  const hasVarKey = CSS_VAR_KEY.test(body);

  return hasVarKey && !hasNonVarKey;
}

export async function scanConventionViolations() {
  const results = [];

  // --- Inline styles in JSX (High) ---
  const tsxFiles = await findFiles('packages/*/src/**/*.tsx');

  for (const file of tsxFiles) {
    const lines = readLines(file);
    const fullText = lines.map(l => l.line).join('\n');
    for (const { line, num } of lines) {
      if (INLINE_STYLE.test(line)) {
        // Find this line's position in the full text to support multiline style objects
        const lineIdx = fullText.indexOf(line, fullText.split('\n').slice(0, num - 1).join('\n').length);
        if (!isCssVarOnlyStyle(fullText, lineIdx)) {
          results.push(finding('High', 'Convention', 'Inline style', file, num, line,
            'style={{}} found — use CSS Modules + data attributes'));
        }
      }
    }
  }

  // --- CSS class naming convention (Low) + Missing data attributes (Medium) ---
  const cssFiles = await findFiles('packages/*/src/**/*.module.css');

  for (const file of cssFiles) {
    const lines = readLines(file);
    for (const { line, num } of lines) {
      // CSS class naming: flag kebab-case as a violation
      const classMatch = line.match(/\.([a-zA-Z_][\w-]*)/g);
      if (classMatch) {
        for (const cls of classMatch) {
          const name = cls.slice(1);
          if (name.includes('-') && !name.startsWith('ov-')) {
            results.push(finding('Low', 'Convention', 'CSS class naming', file, num, line,
              `Class ".${name}" uses kebab-case — use PascalCase (slots) or camelCase (modifiers)`));
          }
        }
      }

      // Missing data attributes: flag class-based state selectors
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
  const dirSet = new Set(allComponentDirs.map(f => dirname(f)));
  for (const dir of dirSet) {
    const hasIndex = existsSync(join(dir, 'index.ts')) || existsSync(join(dir, 'index.tsx'));
    if (!hasIndex) {
      results.push(finding('Medium', 'Convention', 'Inconsistent exports', dir, 0, '',
        'Component directory missing barrel export (index.ts)'));
    }
  }

  // --- Large component files (Low) ---
  for (const file of tsxFiles) {
    const lines = readLines(file);
    if (lines.length > 300) {
      results.push(finding('Low', 'Convention', 'Large component file', file, 1, '',
        `File has ${lines.length} lines (threshold: 300) — consider splitting`));
    }
  }

  return results;
}
