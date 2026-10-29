import { THEME_TOKEN_METADATA } from './generated/tokenKeys';
import type { ThemeTokenKey } from './generated/tokenKeys';
import { CSS_NAMED_COLORS } from './cssNamedColors';
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

const ID_PATTERN = /^[A-Za-z0-9._~%/:-]+$/;
const CSS_NUMBER = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e[+-]?\d+)?$/i;
const CSS_PERCENTAGE = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e[+-]?\d+)?%$/i;
const CSS_ANGLE =
  /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e[+-]?\d+)?(?:deg|grad|rad|turn)?$/i;
const CSS_COLOR_PROFILES: Readonly<Record<string, true>> = Object.freeze({
  srgb: true,
  'srgb-linear': true,
  'display-p3': true,
  'a98-rgb': true,
  'prophoto-rgb': true,
  rec2020: true,
  xyz: true,
  'xyz-d50': true,
  'xyz-d65': true,
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

function isNumber(value: string): boolean {
  return CSS_NUMBER.test(value);
}

function isPercentage(value: string): boolean {
  return CSS_PERCENTAGE.test(value);
}
function isPercentageOrNone(value: string): boolean {
  return value === 'none' || isPercentage(value);
}

function isNumberOrPercentage(value: string): boolean {
  return value === 'none' || isNumber(value) || isPercentage(value);
}

function isHue(value: string): boolean {
  return value === 'none' || CSS_ANGLE.test(value);
}

function structurallySupportsColor(value: string): boolean {
  const color = value.trim();
  if (STRICT_FALLBACK_HEX.test(color)) return true;
  if (Object.prototype.hasOwnProperty.call(CSS_NAMED_COLORS, color.toLowerCase())) return true;

  const call = /^([a-z]+)\(([^()]*)\)$/i.exec(color);
  if (!call) return false;
  const name = call[1]!.toLowerCase();
  const body = call[2]!.trim();
  if (body.length === 0 || !/^[a-z0-9\s.,%+\-/]+$/i.test(body)) return false;

  const slashParts = body.split('/');
  if (slashParts.length > 2 || slashParts.some((part) => part.trim().length === 0)) return false;
  const alpha = slashParts[1]?.trim().toLowerCase();
  if (alpha !== undefined && !isNumberOrPercentage(alpha)) return false;

  const main = slashParts[0]!.trim();
  const commaSyntax = main.includes(',');
  const components = commaSyntax
    ? main.split(',').map((part) => part.trim().toLowerCase())
    : main.split(/\s+/).map((part) => part.toLowerCase());
  if (components.some((part) => part.length === 0)) return false;

  if (commaSyntax) {
    if (alpha !== undefined || (name !== 'rgb' && name !== 'rgba' && name !== 'hsl' && name !== 'hsla')) {
      return false;
    }
    if (components.length !== 3 && components.length !== 4) return false;
    const legacyAlpha = components[3];
    if (
      legacyAlpha !== undefined &&
      !isNumber(legacyAlpha) &&
      !isPercentage(legacyAlpha)
    ) {
      return false;
    }

    if (name === 'rgb' || name === 'rgba') {
      const channels = components.slice(0, 3);
      return channels.every(isNumber) || channels.every(isPercentage);
    }
    return isHue(components[0]!) && isPercentage(components[1]!) && isPercentage(components[2]!);
  }

  if (name === 'color') {
    if (components.length !== 4) return false;
    const profile = components[0]!;
    if (
      !Object.prototype.hasOwnProperty.call(CSS_COLOR_PROFILES, profile) &&
      !/^--[a-z][a-z0-9-]*$/i.test(profile)
    ) {
      return false;
    }
    return components.slice(1).every(isNumberOrPercentage);
  }

  if (components.length !== 3) return false;
  switch (name) {
    case 'rgb':
    case 'rgba':
      return components.every(isNumberOrPercentage);
    case 'hsl':
    case 'hsla':
    case 'hwb':
      return (
        isHue(components[0]!) &&
        isPercentageOrNone(components[1]!) &&
        isPercentageOrNone(components[2]!)
      );
    case 'lab':
    case 'oklab':
      return components.every(isNumberOrPercentage);
    case 'lch':
    case 'oklch':
      return (
        isNumberOrPercentage(components[0]!) &&
        isNumberOrPercentage(components[1]!) &&
        isHue(components[2]!)
      );
    default:
      return false;
  }
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
