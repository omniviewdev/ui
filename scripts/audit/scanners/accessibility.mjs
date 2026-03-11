// scripts/audit/scanners/accessibility.mjs
import { findFiles, readLines, finding } from '../utils.mjs';

export async function scanAccessibility() {
  const results = [];

  const tsxFiles = await findFiles('packages/*/src/**/*.tsx');

  for (const file of tsxFiles) {
    const lines = readLines(file);

    for (const { line, num } of lines) {
      // Skip comments, imports, types
      if (line.trim().startsWith('//') || line.trim().startsWith('*') ||
          line.trim().startsWith('import') || line.trim().startsWith('type') ||
          line.trim().startsWith('interface')) continue;

      // Clickable non-button elements without keyboard handler (Medium)
      if (/onClick/.test(line) && /<(?:div|span|li|td|tr|img|a(?!\s))/.test(line)) {
        // Check surrounding lines for onKeyDown/onKeyUp
        const context = lines.slice(Math.max(0, num - 3), Math.min(lines.length, num + 3))
          .map(l => l.line).join(' ');
        if (!/onKeyDown|onKeyUp|role=/.test(context)) {
          results.push(finding('Medium', 'Accessibility', 'Missing keyboard handler', file, num, line,
            'Clickable non-button element without onKeyDown/onKeyUp or role'));
        }
      }

      // Interactive elements without ARIA (Medium)
      // Check for custom interactive elements that might need ARIA
      if (/onClick|onPress/.test(line) && /<(?:div|span)\s/.test(line)) {
        const context = lines.slice(Math.max(0, num - 3), Math.min(lines.length, num + 3))
          .map(l => l.line).join(' ');
        if (!/aria-|role=/.test(context)) {
          results.push(finding('Medium', 'Accessibility', 'Missing ARIA', file, num, line,
            'Interactive div/span without role or aria-* attribute'));
        }
      }
    }
  }

  return results;
}
