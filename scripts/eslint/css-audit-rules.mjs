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

