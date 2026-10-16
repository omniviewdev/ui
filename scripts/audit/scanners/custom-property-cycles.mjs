import { readFileSync } from 'node:fs';
import { postcss, customPropertyReferences } from '../css.mjs';
import { findFiles, finding } from '../utils.mjs';

/** Strongly connected components, sorted independently of graph insertion order. */
export function findDependencyCycles(graph) {
  let nextIndex = 0;
  const indices = new Map();
  const lowLinks = new Map();
  const stack = [];
  const onStack = new Set();
  const cycles = [];

  function visit(property) {
    indices.set(property, nextIndex);
    lowLinks.set(property, nextIndex++);
    stack.push(property);
    onStack.add(property);
    for (const dependency of [...graph.get(property)].sort()) {
      if (!graph.has(dependency)) continue; // Inherited/external value, not a local edge.
      if (!indices.has(dependency)) {
        visit(dependency);
        lowLinks.set(property, Math.min(lowLinks.get(property), lowLinks.get(dependency)));
      } else if (onStack.has(dependency)) {
        lowLinks.set(property, Math.min(lowLinks.get(property), indices.get(dependency)));
      }
    }
    if (lowLinks.get(property) !== indices.get(property)) return;
    const component = [];
    let member;
    do {
      member = stack.pop();
      onStack.delete(member);
      component.push(member);
    } while (member !== property);
    if (component.length > 1 || graph.get(property).has(property)) cycles.push(component.sort());
  }

  for (const property of [...graph.keys()].sort()) {
    if (!indices.has(property)) visit(property);
  }
  return cycles.sort((left, right) => left.join('\0').localeCompare(right.join('\0')));
}

/**
 * Audit provable local cycles, not arbitrary selector intersections. Declarations
 * share a scope only with the identical selector and enclosing at-rule context.
 * Inherited parent values are already computed before child declarations and
 * must never be joined into the child's dependency graph.
 */
export function findCustomPropertyCycles(css, file) {
  const scopes = new Map();
  postcss.parse(css, { from: file }).walkRules((rule) => {
    const context = [];
    for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
      if (parent.type === 'atrule') context.unshift(`@${parent.name} ${parent.params}`);
      if (parent.type === 'rule') context.unshift(parent.selector);
    }
    for (const selector of postcss.list.comma(rule.selector)) {
      const key = JSON.stringify([...context, selector]);
      if (!scopes.has(key)) scopes.set(key, { selector, context, declarations: new Map() });
      const declarations = scopes.get(key).declarations;
      for (const node of rule.nodes ?? []) {
        if (node.type !== 'decl' || !node.prop.startsWith('--')) continue;
        const previous = declarations.get(node.prop);
        if (!previous?.important || node.important) declarations.set(node.prop, node);
      }
    }
  });

  const results = [];
  for (const scope of [...scopes.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, value]) => value)) {
    const graph = new Map([...scope.declarations].map(([property, declaration]) => [
      property, customPropertyReferences(declaration.value),
    ]));
    for (const properties of findDependencyCycles(graph)) {
      const declaration = scope.declarations.get(properties[0]);
      results.push({
        selector: scope.selector,
        context: scope.context,
        properties,
        line: declaration.source.start.line,
        snippet: declaration.toString(),
      });
    }
  }
  return results;
}

export async function scanCustomPropertyCycles() {
  const results = [];
  const files = await findFiles('packages/*/src/**/*.css', { excludeStylesCSS: false });
  for (const file of files) {
    for (const cycle of findCustomPropertyCycles(readFileSync(file, 'utf8'), file)) {
      results.push(finding('High', 'Token/Styling', 'Custom property dependency cycle',
        file, cycle.line, cycle.snippet,
        `Same-element custom-property cycle in ${[...cycle.context, cycle.selector].join(' / ')}: ${cycle.properties.join(', ')}. Cyclic values become invalid at computed-value time.`));
    }
  }
  return results;
}
