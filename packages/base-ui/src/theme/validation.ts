import { THEME_TOKEN_METADATA } from './generated/tokenKeys';
import type { ThemeTokenKey } from './generated/tokenKeys';
import type { BuiltInThemeId, ThemeDefinition } from './schema';

export type ThemeValidationErrorCode =
  | 'unsupported_schema'
  | 'invalid_id'
  | 'invalid_metadata'
  | 'unknown_base'
  | 'unknown_token'
  | 'invalid_value'
  | 'duplicate_id'
  | 'reserved_id'
  | 'owner_mismatch';

export class ThemeValidationError extends Error {
  constructor(
    readonly code: ThemeValidationErrorCode,
    readonly path: string,
    message: string,
  ) {
    super(message);
    this.name = 'ThemeValidationError';
  }
}

const BUILT_IN_THEME_IDS: Record<BuiltInThemeId, true> = {
  void: true,
  dark: true,
  light: true,
  obsidian: true,
  carbon: true,
  'solarized-dark': true,
  'solarized-light': true,
  'high-contrast-dark': true,
  'high-contrast-light': true,
};
const ID_PATTERN = /^[A-Za-z0-9._~%/:\-]+$/;
const FONT_STYLES = new Set([
  'normal',
  'italic',
  'bold',
  'underline',
  'bold italic',
  'bold underline',
  'italic underline',
  'bold italic underline',
]);

type SupportsColor = (value: string) => boolean;

function defaultSupportsColor(value: string): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    ? CSS.supports('color', value)
    : false;
}

function fail(code: ThemeValidationErrorCode, path: string, message: string): never {
  throw new ThemeValidationError(code, path, message);
}

function optionalMetadata(
  input: Record<string, unknown>,
  field: 'author' | 'version' | 'description',
  maximum?: number,
): string | undefined {
  const value = input[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || (maximum !== undefined && value.length > maximum)) {
    fail('invalid_metadata', field, `${field} must be a string${maximum === undefined ? '' : ` of at most ${maximum} characters`}`);
  }
  return value;
}

export function validateThemeDefinition(
  input: unknown,
  supportsColor: SupportsColor = defaultSupportsColor,
): ThemeDefinition {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    fail('invalid_metadata', '', 'Theme definition must be an object');
  }
  const candidate = input as Record<string, unknown>;

  if (candidate.schemaVersion !== 1) {
    fail('unsupported_schema', 'schemaVersion', 'Only theme schema version 1 is supported');
  }
  if (
    typeof candidate.id !== 'string' ||
    candidate.id.length === 0 ||
    candidate.id.length > 256 ||
    !ID_PATTERN.test(candidate.id)
  ) {
    fail('invalid_id', 'id', 'Theme ID is invalid');
  }
  if (typeof candidate.name !== 'string' || candidate.name.length === 0 || candidate.name.length > 80) {
    fail('invalid_metadata', 'name', 'Theme name must contain 1 to 80 characters');
  }
  if (
    typeof candidate.base !== 'string' ||
    !Object.prototype.hasOwnProperty.call(BUILT_IN_THEME_IDS, candidate.base)
  ) {
    fail('unknown_base', 'base', 'Theme base is not a built-in theme');
  }

  const author = optionalMetadata(candidate, 'author', 120);
  const version = optionalMetadata(candidate, 'version');
  const description = optionalMetadata(candidate, 'description', 500);
  if (typeof candidate.tokens !== 'object' || candidate.tokens === null || Array.isArray(candidate.tokens)) {
    fail('invalid_metadata', 'tokens', 'Theme tokens must be an object');
  }

  const entries = Object.entries(candidate.tokens);
  if (entries.length > Object.keys(THEME_TOKEN_METADATA).length) {
    fail('unknown_token', 'tokens', 'Theme has more token entries than the token catalog');
  }

  const tokens: Partial<Record<ThemeTokenKey, string>> = {};
  for (const [key, value] of entries) {
    if (!Object.prototype.hasOwnProperty.call(THEME_TOKEN_METADATA, key)) {
      fail('unknown_token', `tokens.${key}`, `Unknown theme token: ${key}`);
    }
    const path = `tokens.${key}`;
    if (typeof value !== 'string' || value.length > 256) {
      fail('invalid_value', path, 'Theme token value must be a string of at most 256 characters');
    }
    const metadata = THEME_TOKEN_METADATA[key as ThemeTokenKey];
    if (metadata.valueKind === 'font-style') {
      if (!FONT_STYLES.has(value)) fail('invalid_value', path, 'Unsupported font style');
    } else {
      const lowerValue = value.toLowerCase();
      if (
        lowerValue.includes('url(') ||
        value.includes(';') ||
        value.includes('{') ||
        value.includes('}') ||
        !supportsColor(value)
      ) {
        fail('invalid_value', path, 'Unsupported color value');
      }
    }
    tokens[key as ThemeTokenKey] = value;
  }

  const definition: ThemeDefinition = {
    schemaVersion: 1,
    id: candidate.id,
    name: candidate.name,
    base: candidate.base as BuiltInThemeId,
    ...(author === undefined ? {} : { author }),
    ...(version === undefined ? {} : { version }),
    ...(description === undefined ? {} : { description }),
    tokens: Object.freeze(tokens),
  };
  return Object.freeze(definition);
}
