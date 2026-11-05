// scripts/eslint/css-audit-rules.mjs
// Custom ESLint rules for UI audit guardrails
export function unwrapStyleExpression(node) {
  while (
    node?.type === 'TSAsExpression' ||
    node?.type === 'TSTypeAssertion' ||
    node?.type === 'TSSatisfiesExpression' ||
    node?.type === 'TSNonNullExpression'
  ) {
    node = node.expression;
  }
  return node;
}

function resolveVariable(scope, name) {
  for (; scope; scope = scope.upper) {
    const variable = scope.set.get(name);
    if (variable) return variable;
  }
}

function isPublicStyleParameter(node, scope, getParent) {
  if (node.type !== 'Identifier') return false;
  const variable = resolveVariable(scope, node.name);
  if (!variable || variable.defs.length !== 1 || variable.references.some((ref) => ref.isWrite())) {
    return false;
  }
  const definition = variable.defs[0];
  if (definition.type !== 'Parameter') return false;
  const fn = definition.node;
  const parameter = fn.params[0];
  if (
    parameter?.type !== 'ObjectPattern' ||
    !parameter.properties.some(
      (property) =>
        property.type === 'Property' &&
        !property.computed &&
        (property.key.name ?? property.key.value) === 'style' &&
        property.value === definition.name,
    )
  ) {
    return false;
  }
  const call = getParent(fn);
  if (
    call?.type !== 'CallExpression' ||
    call.arguments[0] !== fn ||
    call.callee.type !== 'Identifier'
  ) {
    return false;
  }
  const factory = resolveVariable(scope, call.callee.name);
  return (
    factory?.defs.some(
      (def) =>
        def.type === 'ImportBinding' &&
        def.parent?.source.value === 'react' &&
        def.node.type === 'ImportSpecifier' &&
        (def.node.imported.name ?? def.node.imported.value) === 'forwardRef',
    ) ?? false
  );
}

// Public React style passthrough is the sole spread exception: resolve the
// binding to the first destructured parameter of an imported React forwardRef
// callback. Defaults, reassigned parameters, local maps and unknown spreads
// remain violations. Every explicit property must still be a CSS variable.
export function isAllowedStyleObject(node, scope, getParent = (child) => child.parent) {
  return node.properties.every((property) => {
    if (property.type === 'SpreadElement') {
      return isPublicStyleParameter(property.argument, scope, getParent);
    }
    return (
      property.type === 'Property' &&
      !property.computed &&
      property.key.type === 'Literal' &&
      typeof property.key.value === 'string' &&
      property.key.value.startsWith('--')
    );
  });
}

export const noInlineStyles = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow inline style objects in JSX' },
    messages: {
      noInlineStyle: 'Inline style={{}} is not allowed — use CSS Modules with data attributes.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === 'style' && node.value?.type === 'JSXExpressionContainer') {
          const expression = unwrapStyleExpression(node.value.expression);
          if (
            expression?.type === 'ObjectExpression' &&
            !isAllowedStyleObject(expression, context.sourceCode.getScope(node))
          ) {
            context.report({ node, messageId: 'noInlineStyle' });
          }
        }
      },
    };
  },
};
