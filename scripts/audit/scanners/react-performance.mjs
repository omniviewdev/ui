// scripts/audit/scanners/react-performance.mjs
import { findFiles, readLines, finding } from '../utils.mjs';

const INLINE_OBJ_PROP = /\w+=\{\s*\{/;
const INLINE_ARR_PROP = /\w+=\{\s*\[/;
const ARROW_FN_PROP = /\w+=\{\s*\(\s*[\w,\s]*\)\s*=>/;
const ARROW_FN_PROP_SHORT = /\w+=\{\s*\w+\s*=>/;

/**
 * Given the full file text and the array of content lines, extract per-export
 * source slices and check memo/forwardRef/children usage for each one independently.
 */
function getMissingMemoFindings(file, _content, fullText) {
  const findings = [];

  // Find all exported component declarations
  const exportRegex = /export\s+(?:const|function)\s+([A-Z]\w*)/g;
  let match;

  while ((match = exportRegex.exec(fullText)) !== null) {
    const componentName = match[1];
    const exportStart = match.index;

    // Find the approximate end of this export by locating the next top-level export
    // or end of file. We look for the next `export ` at column 0.
    const nextExportMatch = /\nexport\s+(?:const|function|default|type|interface)\s+/g;
    nextExportMatch.lastIndex = exportStart + match[0].length;
    const nextMatch = nextExportMatch.exec(fullText);
    const exportEnd = nextMatch ? nextMatch.index : fullText.length;

    const componentSlice = fullText.slice(exportStart, exportEnd);

    const hasMemo = /React\.memo|memo\(/.test(componentSlice);
    const hasForwardRef = /forwardRef/.test(componentSlice);
    const hasChildren = /\bchildren\b/.test(componentSlice);

    // Only flag leaf components (no children usage, no memo, no forwardRef)
    if (!hasMemo && !hasForwardRef && !hasChildren) {
      findings.push(finding('Medium', 'Performance', 'Missing memo', file, 1, '',
        `Exported leaf component "${componentName}" without React.memo — consider wrapping`));
    }
  }

  return findings;
}

export async function scanReactPerformance() {
  const results = [];

  const tsxFiles = await findFiles('packages/*/src/**/*.tsx');

  for (const file of tsxFiles) {
    const content = readLines(file);
    const fullText = content.map(l => l.line).join('\n');

    // --- Missing memo on exported components (Medium) — per-component check ---
    const hasExport = /export\s+(?:const|function)\s+[A-Z]/.test(fullText);
    if (hasExport) {
      const memoFindings = getMissingMemoFindings(file, content, fullText);
      results.push(...memoFindings);
    }

    // --- Inline object/array/function props (Medium) ---
    for (const { line, num } of content) {
      // Skip lines that are type definitions, comments, or imports
      if (line.trim().startsWith('//') || line.trim().startsWith('*') ||
          line.trim().startsWith('import') || line.trim().startsWith('type') ||
          line.trim().startsWith('interface')) continue;

      // Inline object literals as props
      if (INLINE_OBJ_PROP.test(line)) {
        // Exclude style={{}} (caught by convention scanner) and common exceptions
        if (!/style\s*=/.test(line)) {
          results.push(finding('Medium', 'Performance', 'Inline object prop', file, num, line,
            'Object literal as prop — creates new reference each render'));
        }
      }

      // Inline array literals as props
      if (INLINE_ARR_PROP.test(line)) {
        results.push(finding('Medium', 'Performance', 'Inline array prop', file, num, line,
          'Array literal as prop — creates new reference each render'));
      }

      // Inline arrow functions as props to child components
      // For multi-line JSX: when an arrow-fn prop is found, scan a window of surrounding
      // lines (previous 3-5 lines) to find an unclosed JSX opening tag.
      if (ARROW_FN_PROP.test(line) || ARROW_FN_PROP_SHORT.test(line)) {
        // Check if current line already has a JSX opening tag
        const currentLineHasTag = /<[A-Z]/.test(line) || /<[a-z]/.test(line);

        if (currentLineHasTag) {
          results.push(finding('Medium', 'Performance', 'Inline function prop', file, num, line,
            'Arrow function as prop — causes child re-renders, use useCallback'));
        } else {
          // Scan the previous 3-5 lines for an unclosed JSX opening tag
          const windowStart = Math.max(0, num - 5 - 1); // num is 1-based, content is 0-based
          const windowEnd = num - 1; // exclusive, up to (not including) current line
          const windowLines = content.slice(windowStart, windowEnd).map(l => l.line);

          // Look for a JSX opening tag that hasn't been closed yet
          // An unclosed tag would have <Component or <element without a matching >
          let foundOpenTag = false;
          for (let i = windowLines.length - 1; i >= 0; i--) {
            const wl = windowLines[i];
            // If this line opens a JSX tag that spans multiple lines (no closing > at end)
            if (/<(?:[A-Z]\w*|[a-z]+[\w]*)/.test(wl) && !/\/?>/.test(wl.trimEnd())) {
              foundOpenTag = true;
              break;
            }
            // If we hit a line that clearly ends a tag or statement, stop searching
            if (/\/?>/.test(wl) || /^\s*$/.test(wl)) break;
          }

          if (foundOpenTag) {
            results.push(finding('Medium', 'Performance', 'Inline function prop', file, num, line,
              'Arrow function as prop — causes child re-renders, use useCallback'));
          }
        }
      }
    }
  }

  return results;
}
