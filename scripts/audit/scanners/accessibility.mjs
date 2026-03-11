// scripts/audit/scanners/accessibility.mjs
import { findFiles, readLines, finding } from '../utils.mjs';

export async function scanAccessibility() {
  const results = [];

  const tsxFiles = await findFiles('packages/*/src/**/*.tsx');

  for (const file of tsxFiles) {
    const lines = readLines(file);

    // Buffer multi-line JSX tags: collect lines until the opening tag closes
    let tagBuffer = '';
    let tagStartNum = -1;
    let tagStartLine = '';
    let inTag = false;

    for (const { line, num } of lines) {
      // Skip comments, imports, types
      if (line.trim().startsWith('//') || line.trim().startsWith('*') ||
          line.trim().startsWith('import') || line.trim().startsWith('type') ||
          line.trim().startsWith('interface')) {
        // If we were buffering, reset (shouldn't normally happen mid-tag)
        inTag = false;
        tagBuffer = '';
        continue;
      }

      // Detect the start of a JSX opening tag for elements we care about
      if (!inTag) {
        if (/<(?:div|span|li|td|tr|img|a(?!\s))[\s>]/.test(line) || /<(?:div|span|li|td|tr|img|a(?!\s))\s*$/.test(line)) {
          inTag = true;
          tagBuffer = line;
          tagStartNum = num;
          tagStartLine = line;
        }
      } else {
        tagBuffer += ' ' + line;
      }

      if (inTag) {
        // Check if the tag has closed (> or />)
        // We look for > that's not inside a string — simplified: just check if > appears
        if (/\/?>/.test(tagBuffer)) {
          inTag = false;
          const ctx = tagBuffer;

          // Clickable non-button elements without keyboard handler (Medium)
          if (/onClick/.test(ctx) && /<(?:div|span|li|td|tr|img|a(?!\s))/.test(ctx)) {
            const hasKeyboardHandler = /onKeyDown|onKeyUp/.test(ctx);
            const hasRoleButton = /role\s*=\s*["']button["']/.test(ctx);
            const hasTabIndex = /tabIndex|tabindex/.test(ctx);
            // Sufficient if: explicit keyboard handler, or role=button + tabIndex
            const isSufficient = hasKeyboardHandler || (hasRoleButton && hasTabIndex);
            if (!isSufficient) {
              results.push(finding('Medium', 'Accessibility', 'Missing keyboard handler', file, tagStartNum, tagStartLine,
                'Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex'));
            }
          }

          // Interactive elements without ARIA (Medium)
          if (/onClick|onPress/.test(ctx) && /<(?:div|span)\s/.test(ctx)) {
            if (!/aria-|role=/.test(ctx)) {
              results.push(finding('Medium', 'Accessibility', 'Missing ARIA', file, tagStartNum, tagStartLine,
                'Interactive div/span without role or aria-* attribute'));
            }
          }

          tagBuffer = '';
          tagStartNum = -1;
          tagStartLine = '';
        }
      }
    }
  }

  return results;
}
