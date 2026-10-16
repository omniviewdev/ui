import { createRequire } from 'node:module';

// Use Base UI's declared toolchain: Vite already depends on PostCSS. Resolve
// through that dependency rather than relying on hoisting or a .pnpm path.
export const baseUIRequire = createRequire(new URL('../../packages/base-ui/package.json', import.meta.url));
const viteRequire = createRequire(baseUIRequire.resolve('vite/package.json'));
export const postcss = viteRequire('postcss');
const tokenize = viteRequire('postcss/lib/tokenize');

/** Read var() references, including fallbacks, without interpreting quoted text. */
export function customPropertyReferences(value) {
  const tokens = [];
  function appendTokens(text) {
    const tokenizer = tokenize(new postcss.Input(text));
    let previous;
    while (!tokenizer.endOfFile()) {
      const token = tokenizer.nextToken();
      if (token[0] === 'space' || token[0] === 'comment') continue;
      if (token[0] === 'brackets' && previous?.[1] !== 'url') {
        tokens.push(['(', '(']);
        appendTokens(token[1].slice(1, -1));
        tokens.push([')', ')']);
      } else {
        tokens.push(token);
      }
      previous = token;
    }
  }
  appendTokens(value);
  const references = new Set();
  for (let i = 0; i < tokens.length - 2; i++) {
    // PostCSS keeps commas in word tokens (e.g. "--a,var" in a fallback).
    if (tokens[i][0] !== 'word' || !/(?:^|[^\w-])var$/i.test(tokens[i][1])) continue;
    if (tokens[i + 1][0] !== '(' || tokens[i + 2][0] !== 'word') continue;
    const property = /^(--[\w-]+)/.exec(tokens[i + 2][1]);
    if (property) references.add(property[1]);
  }
  return references;
}
