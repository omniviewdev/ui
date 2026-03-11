// scripts/audit/scanners/react-performance.mjs
import { findFiles, readLines, finding } from '../utils.mjs';

const INLINE_OBJ_PROP = /\w+=\{\s*\{/;
const INLINE_ARR_PROP = /\w+=\{\s*\[/;
const ARROW_FN_PROP = /\w+=\{\s*\(\s*[\w,\s]*\)\s*=>/;
const ARROW_FN_PROP_SHORT = /\w+=\{\s*\w+\s*=>/;

export async function scanReactPerformance() {
  const results = [];

  const tsxFiles = await findFiles('packages/*/src/**/*.tsx');

  for (const file of tsxFiles) {
    const content = readLines(file);
    const fullText = content.map(l => l.line).join('\n');

    // --- Missing memo on exported components (Medium) ---
    // Check if file exports a component but doesn't use memo
    const hasExport = /export\s+(?:const|function)\s+[A-Z]/.test(fullText);
    const hasMemo = /React\.memo|memo\(/.test(fullText);
    const hasForwardRef = /forwardRef/.test(fullText);

    // Only flag leaf components (no children prop usage suggesting wrapper)
    // This is a heuristic — manual review will refine
    if (hasExport && !hasMemo && !hasForwardRef) {
      // Check if it's a simple component (no children destructured)
      const isLeaf = !/\bchildren\b/.test(fullText);
      if (isLeaf) {
        results.push(finding('Medium', 'Performance', 'Missing memo', file, 1, '',
          'Exported leaf component without React.memo — consider wrapping'));
      }
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
      if (ARROW_FN_PROP.test(line) || ARROW_FN_PROP_SHORT.test(line)) {
        // Only flag if it looks like a prop to a child component (line contains <Component or lowercase element)
        if (/<[A-Z]/.test(line) || /<[a-z]/.test(line)) {
          results.push(finding('Medium', 'Performance', 'Inline function prop', file, num, line,
            'Arrow function as prop — causes child re-renders, use useCallback'));
        }
      }
    }
  }

  return results;
}
