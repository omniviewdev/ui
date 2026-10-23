import type { ReactNode } from 'react';

/** Host catalog identifiers are opaque; display labels never become resource identity. */
export interface ResourceScopeTarget {
  id: string;
  provider: string;
  connection: string;
  resourceType: string;
  description?: string;
  status?: 'ready' | 'loading' | 'partial' | 'denied' | 'offline' | 'unsupported';
  reason?: string;
  dimensions?: readonly {
    id: string;
    label: string;
    allowAny?: boolean;
    values: readonly { id: string; label: string; disabledReason?: string }[];
  }[];
}

/** Empty/missing dimensions stay unresolved; this control never broadens them. */
export interface ResourceScopeSelection {
  targetId: string;
  dimensions: Readonly<Record<string, readonly string[] | 'any'>>;
}

export interface ResourceGroupingField {
  id: string;
  label: string;
  groupable: boolean;
  splittable: boolean;
  reason?: string;
  applicability?: string;
}

export interface ResourceGroupingValue {
  groupBy: readonly string[];
  splitBy: readonly string[];
}

export type WorkspaceActionResult = {
  status: 'success' | 'conflict' | 'corrupt' | 'unsupported' | 'denied' | 'unavailable' | 'error';
  message?: string;
};

export interface SavedResourceItem {
  id: string;
  name: string;
  status?: 'ready' | 'conflict' | 'corrupt' | 'unsupported' | 'denied' | 'unavailable';
  reason?: string;
}

/** Presentation requests only: the host owns document schemas, semantics and persistence. */
export type SavedResourceAction<TDraft> =
  | { type: 'create'; name: string; draft: TDraft }
  | { type: 'rename'; id: string; name: string }
  | { type: 'select'; id: string | null }
  | { type: 'save'; id: string; name: string; draft: TDraft }
  | { type: 'reset'; id: string | null }
  | { type: 'delete'; id: string }
  | { type: 'import'; document: string }
  | { type: 'export'; id: string };

export interface ResourceNavigationResult<TResource> {
  label: string;
  provenance: string;
  resource: TResource;
  disabledReason?: string;
}

/** The host supplies already bounded/ranked results; no client filtering or indexing. */
export interface ResourceSearchItem<TPayload> {
  id: string;
  kind: 'command' | 'setting' | 'navigation' | 'resource';
  label: string;
  description?: string;
  provenance?: string;
  disabledReason?: string;
  payload: TPayload;
  decoration?: ReactNode;
}
