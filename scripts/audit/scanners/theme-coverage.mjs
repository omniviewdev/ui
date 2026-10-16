// scripts/audit/scanners/theme-coverage.mjs
import { readFileSync } from 'fs';
import { findFiles, readLines, finding, ROOT } from '../utils.mjs';
import { baseUIRequire, postcss } from '../css.mjs';

export async function loadBuiltInThemeIds() {
  const { tsImport } = baseUIRequire('tsx/esm/api');
  const { BUILT_IN_THEMES } = await tsImport(
    `${ROOT}/packages/base-ui/src/theme/registry/catalog.ts`, import.meta.url,
  );
  return BUILT_IN_THEMES.map(({ id }) => id);
}

/** Collect explicit palette declarations; shared :root aliases remain inherited. */
export function parseThemeBlocks(cssContent) {
  const blocks = new Map();
  postcss.parse(cssContent).walkRules((rule) => {
    for (const selector of postcss.list.comma(rule.selector)) {
      // Only a theme root, not descendant controls or conditional state overrides.
      const match = /^(?::root)?\[data-ov-theme\s*=\s*(?:"([^"]+)"|'([^']+)'|([\w-]+))\s*\]$/.exec(selector);
      if (!match) continue;
      const mode = match[1] ?? match[2] ?? match[3];
      if (!blocks.has(mode)) blocks.set(mode, new Set());
      for (const node of rule.nodes ?? []) {
        if (node.type === 'decl' && node.prop.startsWith('--ov-')) blocks.get(mode).add(node.prop);
      }
    }
  });
  return blocks;
}

export function findThemeCoverageGaps(cssContent, themeIds) {
  const blocks = parseThemeBlocks(cssContent);
  const tokens = new Set([...blocks.values()].flatMap((block) => [...block]));
  return [...tokens].sort().filter((token) => !token.startsWith('--ov-primitive-'))
    .map((token) => ({ token, missingThemes: themeIds.filter((id) => !blocks.get(id)?.has(token)) }))
    .filter(({ missingThemes }) => missingThemes.length > 0);
}

export async function scanThemeCoverage() {
  const results = [];

  // Read styles.css
  const stylesPath = `${ROOT}/packages/base-ui/src/theme/styles.css`;
  const stylesContent = readFileSync(stylesPath, 'utf-8');
  const themeIds = await loadBuiltInThemeIds();
  const themeBlocks = parseThemeBlocks(stylesContent);
  for (const id of themeIds) {
    if (!themeBlocks.has(id)) {
      results.push(finding('High', 'Token/Styling', 'Missing built-in theme',
        stylesPath, 0, '', `Catalog theme ${id} has no explicit palette selector`));
    }
  }
  for (const { token, missingThemes } of findThemeCoverageGaps(stylesContent, themeIds)) {
    results.push(finding('Medium', 'Token/Styling', 'Missing theme coverage',
      stylesPath, 0, '',
      `Token ${token} missing from mode(s): ${missingThemes.join(', ')}`));
  }

  // --- IDE alias indirection check (Medium) ---
  // Build a map of IDE alias prefixes from IDE_TOKEN_CATALOG.md
  const cssFiles = await findFiles('packages/*/src/**/*.module.css');
  for (const file of cssFiles) {
    const lines = readLines(file);
    for (const { line, num } of lines) {
      // Check if line uses a raw semantic token where an IDE alias exists
      const varMatch = line.match(/var\((--ov-color-(?:bg|fg|border)-[\w-]+)\)/);
      if (!varMatch) continue;
      const token = varMatch[1];

      // Determine if the component's directory name suggests it belongs to an IDE surface
      const dirMatch = file.match(/components\/([^/]+)\//);
      if (!dirMatch) continue;
      const componentDir = dirMatch[1].toLowerCase();

      // Split the component directory name into segments on hyphens and underscores
      // to avoid substring false positives (e.g. "data-table" matching "tab")
      const componentSegments = componentDir.split(/[-_]/);

      // Map component directories to expected IDE alias prefix
      const IDE_DIR_MAP = {
        'sidebar': '--ov-color-sidebar-',
        'editor': '--ov-color-editor-',
        'terminal': '--ov-color-terminal-',
        'tab': '--ov-color-tab-',
        'statusbar': '--ov-color-statusbar-',
        'panel': '--ov-color-panel-',
        'chat': '--ov-color-chat-',
      };

      for (const [dir, prefix] of Object.entries(IDE_DIR_MAP)) {
        if (componentSegments.includes(dir) && !line.includes(prefix)) {
          results.push(finding('Medium', 'Token/Styling', 'Missing IDE alias',
            file, num, line,
            `Component in "${componentDir}" uses ${token} — consider IDE alias (${prefix}*)`));
        }
      }
    }
  }

  return results;
}
