import type { FileNode } from '@omniviewdev/base-ui';

export const scenarios = [
  'Browse',
  'Tree only',
  'Image layers',
  'Compare',
  'Live watch',
  'States',
] as const;
export type Scenario = (typeof scenarios)[number];
export const providerStates = [
  'permission',
  'loading',
  'empty',
  'offline',
  'binary',
  'large',
  'missing-tar',
] as const;
export type ProviderState = (typeof providerStates)[number];
export type Presence = 'present' | 'absent' | 'unknown';

export interface FixtureMetadata {
  readonly layer: number;
  readonly baseline: Presence;
  readonly current: Presence;
  readonly readFrom: 'current' | 'baseline';
  readonly mount?: string;
}

export interface FixtureEntry {
  readonly node: FileNode<FixtureMetadata>;
  readonly bytes?: Uint8Array;
  readonly mimeType?: string;
  readonly baselineBytes?: Uint8Array;
  readonly baselineMimeType?: string;
}

export interface FixtureOptions {
  readonly scenario: Scenario;
  readonly state: ProviderState;
  readonly layer: number;
  readonly cumulative: boolean;
}
