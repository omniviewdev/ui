import { THEME_TOKEN_METADATA } from './generated/tokenKeys';
import type { ThemeTokenKey } from './generated/tokenKeys';
import { isBuiltInThemeId } from './registry/catalog';
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

const ID_PATTERN = /^[A-Za-z0-9._~%/:\-]+$/;
const SAFE_NAMED_COLOR = /^[a-z]+$/i;
const SAFE_COLOR_COMPONENT =
  /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e[+-]?\d+)?(?:%|deg|grad|rad|turn)?$/i;
const SAFE_ALPHA_COMPONENT = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e[+-]?\d+)?%?$/i;
const FALLBACK_COLOR_FUNCTION_ARITY: Readonly<Record<string, number | 'profile'>> = Object.freeze({
  rgb: 3,
  rgba: 3,
  hsl: 3,
  hsla: 3,
  hwb: 3,
  lab: 3,
  lch: 3,
  oklab: 3,
  oklch: 3,
  color: 'profile',
});
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

const STRICT_FALLBACK_HEX = /^(?:#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8})$/i;

function structurallySupportsColor(value: string): boolean {
  const color = value.trim();
  if (STRICT_FALLBACK_HEX.test(color) || SAFE_NAMED_COLOR.test(color)) return true;

  const call = /^([a-z]+)\(([^()]*)\)$/i.exec(color);
  if (!call) return false;
  const name = call[1]!.toLowerCase();
  const arity = FALLBACK_COLOR_FUNCTION_ARITY[name];
  if (arity === undefined) return false;

  const body = call[2]!.trim();
  if (body.length === 0 || !/^[a-z0-9\s.,%+\-/]+$/i.test(body)) return false;
  const slashParts = body.split('/');
  if (slashParts.length > 2 || slashParts.some((part) => part.trim().length === 0)) return false;
  const alpha = slashParts[1]?.trim();
  if (alpha !== undefined && !SAFE_ALPHA_COMPONENT.test(alpha)) return false;

  const main = slashParts[0]!.trim();
  const commaSyntax = main.includes(',');
  const components = commaSyntax ? main.split(',').map((part) => part.trim()) : main.split(/\s+/);
  if (components.some((part) => part.length === 0)) return false;

  if (arity === 'profile') {
    if (commaSyntax || components.length < 2 || !/^(?:--)?[a-z][a-z0-9-]*$/i.test(components[0]!)) {
      return false;
    }
    return components.slice(1).every((part) => SAFE_COLOR_COMPONENT.test(part));
  }

  if (commaSyntax) {
    if (alpha !== undefined) return false;
    const expected = name === 'rgba' || name === 'hsla' ? arity + 1 : arity;
    if (components.length !== expected) return false;
    const mainComponents = components.slice(0, arity);
    const legacyAlpha = components[arity];
    return (
      mainComponents.every((part) => SAFE_COLOR_COMPONENT.test(part)) &&
      (legacyAlpha === undefined || SAFE_ALPHA_COMPONENT.test(legacyAlpha))
    );
  }

  return components.length === arity && components.every((part) => SAFE_COLOR_COMPONENT.test(part));
}

function defaultSupportsColor(value: string): boolean {
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    return CSS.supports('color', value);
  }
  if (typeof document !== 'undefined') {
    const probe = document.createElement('option');
    probe.style.color = value;
    return probe.style.color !== '';
  }
  return structurallySupportsColor(value);
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
  if (typeof candidate.base !== 'string' || !isBuiltInThemeId(candidate.base)) {
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
