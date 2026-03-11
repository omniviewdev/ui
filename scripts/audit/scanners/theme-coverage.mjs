// scripts/audit/scanners/theme-coverage.mjs
import { readFileSync } from 'fs';
import { findFiles, readLines, finding, ROOT } from '../utils.mjs';

const THEME_MODES = ['dark', 'light', 'high-contrast-dark', 'high-contrast-light'];

/**
 * Parse styles.css to find tokens defined under each theme/density/motion block.
 */
function parseThemeBlocks(cssContent) {
  const blocks = {};
  // Match [data-ov-theme="<mode>"] { ... } blocks
  const blockRegex = /\[data-ov-theme="([^"]+)"\]\s*\{([^}]+)\}/g;
  let match;
  while ((match = blockRegex.exec(cssContent))) {
    const mode = match[1];
    const body = match[2];
    blocks[mode] = new Set();
    const varRegex = /(--ov-[\w-]+)\s*:/g;
    let varMatch;
    while ((varMatch = varRegex.exec(body))) {
      blocks[mode].add(varMatch[1]);
    }
  }

  // Also parse :root for default (dark) tokens
  const rootRegex = /:root\s*\{([^}]+)\}/g;
  let rootMatch;
  blocks['dark'] = blocks['dark'] || new Set();
  while ((rootMatch = rootRegex.exec(cssContent))) {
    const body = rootMatch[1];
    const varRegex = /(--ov-[\w-]+)\s*:/g;
    let varMatch;
    while ((varMatch = varRegex.exec(body))) {
      blocks['dark'].add(varMatch[1]);
    }
  }

  return blocks;
}

export async function scanThemeCoverage() {
  const results = [];

  // Read styles.css
  const stylesPath = `${ROOT}/packages/base-ui/src/theme/styles.css`;
  const stylesContent = readFileSync(stylesPath, 'utf-8');
  const themeBlocks = parseThemeBlocks(stylesContent);

  // Collect all tokens across all modes
  const allTokens = new Set();
  for (const tokens of Object.values(themeBlocks)) {
    for (const t of tokens) allTokens.add(t);
  }

  // Check each token exists in all theme modes
  for (const token of allTokens) {
    // Skip primitive tokens — they're only in :root
    if (token.startsWith('--ov-primitive-')) continue;

    const missingModes = THEME_MODES.filter(mode => !themeBlocks[mode]?.has(token));
    if (missingModes.length > 0 && missingModes.length < THEME_MODES.length) {
      results.push(finding('Medium', 'Token/Styling', 'Missing theme coverage',
        stylesPath, 0, '',
        `Token ${token} missing from mode(s): ${missingModes.join(', ')}`));
    }
  }

  // --- IDE alias indirection check (Medium) ---
  // Build a map of IDE alias prefixes from IDE_TOKEN_CATALOG.md
  const cssFiles = await findFiles('packages/*/src/**/*.module.css');
  for (const file of cssFiles) {
    const lines = readLines(file);
    for (const { line, num } of lines) {
      // Check if line uses a raw semantic token where an IDE alias exists
      const varMatch = line.match(/var\((--ov-color-(?:bg|fg|border)-\w+)\)/);
      if (!varMatch) continue;
      const token = varMatch[1];

      // Determine if the component's directory name suggests it belongs to an IDE surface
      const dirMatch = file.match(/components\/([^/]+)\//);
      if (!dirMatch) continue;
      const componentDir = dirMatch[1].toLowerCase();

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
        if (componentDir.includes(dir) && !line.includes(prefix)) {
          results.push(finding('Medium', 'Token/Styling', 'Missing IDE alias',
            file, num, line,
            `Component in "${componentDir}" uses ${token} — consider IDE alias (${prefix}*)`));
        }
      }
    }
  }

  return results;
}
