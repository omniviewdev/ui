/** Convert a dotted token key to its CSS custom property name. */
export function dottedKeyToCssVar(key: string): string {
  return `--ov-${key.replaceAll('.', '-')}`;
}

/** Return the subset of `keys` that are NOT in `known`. */
export function validateKeys(
  keys: readonly string[],
  known: Readonly<Record<string, unknown>>,
  prefix?: string,
): string[] {
  const invalid: string[] = [];
  for (const key of keys) {
    if (!Object.hasOwn(known, key) || (prefix !== undefined && !key.startsWith(prefix))) {
      invalid.push(key);
    }
  }
  return invalid;
}
