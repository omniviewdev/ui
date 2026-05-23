/** Convert a dotted token key to its CSS custom property name. */
export function dottedKeyToCssVar(key: string): string {
  return `--ov-${key.replaceAll('.', '-')}`;
}

/** Return the subset of `keys` that are NOT in `known`. */
export function validateKeys<T extends string>(
  keys: readonly string[],
  known: ReadonlySet<T>,
): string[] {
  const invalid: string[] = [];
  for (const key of keys) {
    if (!(known as ReadonlySet<string>).has(key)) invalid.push(key);
  }
  return invalid;
}
