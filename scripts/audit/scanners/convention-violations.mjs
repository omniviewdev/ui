// scripts/audit/scanners/convention-violations.mjs
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { parser } from 'typescript-eslint';
import { findFiles, readLines, finding } from '../utils.mjs';
import { isAllowedStyleObject, unwrapStyleExpression } from '../../eslint/css-audit-rules.mjs';

export async function scanConventionViolations() {
  const results = [];

  // --- Inline styles in JSX (High) ---
  const tsxFiles = await findFiles('packages/*/src/**/*.tsx');
  const fileLineCounts = new Map();

  for (const file of tsxFiles) {
    const lines = readLines(file);
    fileLineCounts.set(file, lines.length);
    const fullText = lines.map((l) => l.line).join('\n');
    const { ast, scopeManager, visitorKeys } = parser.parseForESLint(fullText, {
      filePath: file,
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      loc: true,
      range: true,
      project: false,
      projectService: false,
    });
    const parents = new WeakMap();
    function visit(node, parent, scope) {
      parents.set(node, parent);
      scope = scopeManager.acquire(node, true) ?? scope;
      if (
        node.type === 'JSXAttribute' &&
        node.name.name === 'style' &&
        node.value?.type === 'JSXExpressionContainer'
      ) {
        const expression = unwrapStyleExpression(node.value.expression);
        if (
          expression?.type === 'ObjectExpression' &&
          !isAllowedStyleObject(expression, scope, (child) => parents.get(child))
        ) {
          const num = node.loc.start.line;
          results.push(
            finding(
              'High',
              'Convention',
              'Inline style',
              file,
              num,
              lines[num - 1].line,
              'style={{}} found — use CSS Modules + data attributes',
            ),
          );
        }
      }
      for (const key of visitorKeys[node.type] ?? []) {
        const children = node[key];
        if (Array.isArray(children)) {
          for (const child of children) {
            if (child) visit(child, node, scope);
          }
        } else if (children) {
          visit(children, node, scope);
        }
      }
    }
    visit(ast, undefined, scopeManager.globalScope);
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
            results.push(
              finding(
                'Low',
                'Convention',
                'CSS class naming',
                file,
                num,
                line,
                `Class ".${name}" uses kebab-case — use PascalCase (slots) or camelCase (modifiers)`,
              ),
            );
          }
        }
      }

      // Missing data attributes: flag class-based state selectors
      if (
        /\.(active|selected|disabled|focused|hover|pressed|open|closed|expanded|collapsed)\b/.test(
          line,
        ) &&
        !line.includes('data-') &&
        !line.includes(':hover') &&
        !line.includes(':focus') &&
        !line.includes(':active') &&
        !line.includes(':disabled')
      ) {
        results.push(
          finding(
            'Medium',
            'Convention',
            'Missing data attributes',
            file,
            num,
            line,
            'State styling via CSS class — use data-ov-* or Base UI data-* attributes',
          ),
        );
      }
    }
  }

  // --- Inconsistent exports (Medium) ---
  // Check that each component directory has a proper barrel export
  const allComponentDirs = await findFiles('packages/*/src/components/*/*.tsx');

  // Get unique component directories
  const dirSet = new Set(allComponentDirs.map((f) => dirname(f)));
  for (const dir of dirSet) {
    const hasIndex = existsSync(join(dir, 'index.ts')) || existsSync(join(dir, 'index.tsx'));
    if (!hasIndex) {
      results.push(
        finding(
          'Medium',
          'Convention',
          'Inconsistent exports',
          dir,
          0,
          '',
          'Component directory missing barrel export (index.ts)',
        ),
      );
    }
  }

  // --- Large component files (Low) ---
  for (const file of tsxFiles) {
    const lineCount = fileLineCounts.get(file) ?? readLines(file).length;
    if (lineCount > 300) {
      results.push(
        finding(
          'Low',
          'Convention',
          'Large component file',
          file,
          1,
          '',
          `File has ${lineCount} lines (threshold: 300) — consider splitting`,
        ),
      );
    }
  }

  return results;
}
