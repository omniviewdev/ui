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
        // Only reset buffer if we were actively buffering a tag
        if (inTag) {
          inTag = false;
          tagBuffer = '';
        }
        continue;
      }

      // Detect the start of a JSX opening tag for elements we care about
      if (!inTag) {
        if (/<(?:div|span|li|td|tr|img|a)\b[\s>]/.test(line) || /<(?:div|span|li|td|tr|img|a)\b\s*$/.test(line)) {
          inTag = true;
          tagBuffer = line;
          tagStartNum = num;
          tagStartLine = line;
        }
      } else {
        tagBuffer += ' ' + line;
      }

      if (inTag) {
        // Check if the tag has closed (> or />) on the current line.
        // We inspect only the current line (trimmed) to avoid matching `=>` inside
        // arrow function handlers (e.g. onClick={() => ...}) which would prematurely
        // close the buffer before role/tabIndex are accumulated.
        const closesTag = /\/>\s*$/.test(line.trim()) || /(?<!=>)>\s*$/.test(line.trim());
        if (closesTag) {
          inTag = false;
          const ctx = tagBuffer;

          // Clickable non-button elements without keyboard handler (Medium)
          if (/onClick/.test(ctx) && /<(?:div|span|li|td|tr|img|a)\b/.test(ctx)) {
            // Anchor tags with href are natively keyboard-accessible — skip them
            const isAnchorWithHref = /<a\b/.test(ctx) && /href\s*=/.test(ctx);
            if (isAnchorWithHref) { tagBuffer = ''; continue; }

            const hasKeyboardHandler = /onKeyDown|onKeyUp/.test(ctx);
            const hasRoleButton = /role\s*=\s*["']button["']/.test(ctx);
            const hasTabIndex = /tabIndex|tabindex/.test(ctx);
            // A keyboard handler is always required for clickable non-button elements
            if (!hasKeyboardHandler) {
              if (hasRoleButton && hasTabIndex) {
                results.push(finding('Medium', 'Accessibility', 'Missing keyboard handler', file, tagStartNum, tagStartLine,
                  'Element has role="button" + tabIndex but no onKeyDown/onKeyUp — add Enter/Space handler'));
              } else {
                results.push(finding('Medium', 'Accessibility', 'Missing keyboard handler', file, tagStartNum, tagStartLine,
                  'Clickable non-button element without onKeyDown/onKeyUp'));
              }
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
