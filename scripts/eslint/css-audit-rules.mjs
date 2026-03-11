// scripts/eslint/css-audit-rules.mjs
// Custom ESLint rules for UI audit guardrails

export const noInlineStyles = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow inline style objects in JSX' },
    messages: {
      noInlineStyle:
        'Inline style={{}} is not allowed — use CSS Modules with data attributes.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.name === 'style' &&
          node.value?.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'ObjectExpression'
        ) {
          // Allow style objects where every explicit key is a CSS variable.
          // Spread elements are NOT allowed (they can smuggle arbitrary props).
          const props = node.value.expression.properties;
          const allCssVars = props.every(
            (p) =>
              p.type !== 'SpreadElement' &&
              p.key?.type === 'Literal' &&
              typeof p.key.value === 'string' &&
              p.key.value.startsWith('--'),
          );
          if (!allCssVars) {
            context.report({ node, messageId: 'noInlineStyle' });
          }
        }
      },
    };
  },
};

/** Check if a CallExpression is memo() or React.memo() */
function isMemoCall(node) {
  return (
    node?.type === 'CallExpression' &&
    (node.callee?.name === 'memo' ||
      (node.callee?.type === 'MemberExpression' &&
        node.callee.object?.name === 'React' &&
        node.callee.property?.name === 'memo'))
  );
}

/** Check if a CallExpression is forwardRef() or React.forwardRef() */
function isForwardRefCall(node) {
  return (
    node?.type === 'CallExpression' &&
    (node.callee?.name === 'forwardRef' ||
      (node.callee?.type === 'MemberExpression' &&
        node.callee.object?.name === 'React' &&
        node.callee.property?.name === 'forwardRef'))
  );
}

/** Check if an expression looks like a component (function/arrow or memo/forwardRef call) */
function isComponentShape(init) {
  if (!init) return false;
  // Arrow function or function expression
  if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') return true;
  // memo(...) or forwardRef(...) call
  if (isMemoCall(init) || isForwardRefCall(init)) return true;
  return false;
}

/** Determine if an init expression is wrapped in memo (directly or memo(forwardRef(...))) */
function isWrapped(init) {
  if (!init) return false;
  if (isMemoCall(init)) return true;
  if (isForwardRefCall(init)) return true;
  // memo(forwardRef(...))
  if (
    isMemoCall(init) &&
    init.arguments?.[0] &&
    isForwardRefCall(init.arguments[0])
  ) {
    return true;
  }
  return false;
}

export const preferMemoLeafComponent = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Suggest React.memo for exported leaf components' },
    messages: {
      preferMemo:
        'Exported component "{{name}}" is not wrapped in React.memo — consider wrapping leaf components.',
    },
    schema: [],
  },
  create(context) {
    const exportedComponents = new Map();

    function trackExport(name, node, init) {
      if (!name || !/^[A-Z]/.test(name)) return;
      // Only track if it looks like a component (function, arrow, memo/forwardRef call)
      if (!isComponentShape(init)) return;
      exportedComponents.set(name, {
        node,
        wrapped: isWrapped(init),
      });
    }

    return {
      // export const Foo = forwardRef(...) / memo(...) / () => ...
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node) {
        trackExport(node.id?.name, node, node.init);
      },
      // export function Foo() { ... }
      'ExportNamedDeclaration > FunctionDeclaration'(node) {
        if (node.id?.name) {
          exportedComponents.set(node.id.name, { node, wrapped: false });
        }
      },
      // export default function Foo() { ... }
      'ExportDefaultDeclaration > FunctionDeclaration'(node) {
        const name = node.id?.name;
        if (name && /^[A-Z]/.test(name)) {
          exportedComponents.set(name, { node, wrapped: false });
        }
      },
      'Program:exit'() {
        for (const [name, { node, wrapped }] of exportedComponents) {
          if (!wrapped) {
            context.report({
              node,
              messageId: 'preferMemo',
              data: { name },
            });
          }
        }
      },
    };
  },
};
