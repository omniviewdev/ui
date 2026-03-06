# Tooling Standards

## Package manager

- `pnpm` only.

## Linting and formatting

- ESLint config: `eslint.config.mjs`
- Prettier config: `prettier.config.mjs`
- Prettier ignore: `.prettierignore`
- Editor baseline: `.editorconfig`

## Commands

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm validate
pnpm storybook
pnpm build-storybook
```

## Rule intent

1. ESLint catches correctness and consistency issues.
2. Prettier enforces formatting and minimizes stylistic diffs.
3. Prettier-compatible ESLint config avoids rule conflicts.

## Future additions (after component implementation starts)

1. Add CSS linting (`stylelint`) for token and module CSS files.
2. Add TypeScript project references for type-aware linting in package workspaces.
3. Add CI gates for `pnpm validate`.
