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
          // Allow CSS variable assignments: style={{ '--_var': value }}
          const props = node.value.expression.properties;
          const allCssVars = props.every(
            (p) =>
              p.type === 'SpreadElement' ||
              (p.key?.type === 'Literal' &&
                typeof p.key.value === 'string' &&
                p.key.value.startsWith('--')),
          );
          if (!allCssVars) {
            context.report({ node, messageId: 'noInlineStyle' });
          }
        }
      },
    };
  },
};

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

    return {
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'(node) {
        if (node.id?.name && /^[A-Z]/.test(node.id.name)) {
          const init = node.init;
          const isMemoWrapped =
            init?.type === 'CallExpression' &&
            (init.callee?.name === 'memo' ||
              (init.callee?.object?.name === 'React' &&
                init.callee?.property?.name === 'memo'));
          const isForwardRef =
            init?.type === 'CallExpression' &&
            (init.callee?.name === 'forwardRef' ||
              (init.callee?.object?.name === 'React' &&
                init.callee?.property?.name === 'forwardRef'));
          const isMemoForwardRef =
            isMemoWrapped &&
            init.arguments?.[0]?.type === 'CallExpression' &&
            init.arguments[0].callee?.name === 'forwardRef';

          exportedComponents.set(node.id.name, {
            node,
            wrapped: isMemoWrapped || isForwardRef || isMemoForwardRef,
          });
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
