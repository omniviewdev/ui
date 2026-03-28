/**
 * EditorSchemaRegistry — runtime registry for adding language schemas
 * (primarily YAML/JSON) to Monaco editors.
 *
 * Plugins register schemas at runtime via `register()`. The CodeEditor
 * subscribes via `onChange()` and calls `applyYamlSchemas()` / `applyJsonSchemas()`
 * whenever schemas change.
 *
 * @example
 * ```ts
 * import { editorSchemas } from '@omniviewdev/editors';
 *
 * // Plugin registers a Kubernetes Deployment schema
 * editorSchemas.register({
 *   uri: 'https://kubernetesjsonschema.dev/v1.25.0/deployment-apps-v1.json',
 *   fileMatch: ['*apps%3A%3Av1%3A%3ADeployment.yaml'],
 *   schema: deploymentJsonSchema,
 * });
 * ```
 */

const DEBUG = false;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[schema-registry]', ...args);
}
function warn(...args: unknown[]) {
  if (DEBUG) console.warn('[schema-registry]', ...args);
}

export interface EditorSchema {
  /** Unique URI identifying this schema. Must be a valid https:// URL. */
  uri: string;
  /**
   * Glob patterns for filenames this schema applies to.
   * Tested against the full Monaco model URI string — use URL-encoded
   * colons (`%3A`) for structured GVR filenames.
   *
   * @example ['*core%3A%3Av1%3A%3APod.yaml']
   */
  fileMatch: string[];
  /** The JSON Schema object. */
  schema: Record<string, unknown>;
  /**
   * Human-readable name shown in hover tooltips as the "Source:" link text.
   * If omitted, the URI basename is used.
   * @example "Pod (v1)"
   */
  name?: string;
  /**
   * Description shown in hover tooltips below the schema title.
   * Supports plain text (markdown special chars will be escaped).
   */
  description?: string;
}

type SchemaChangeListener = () => void;

/**
 * Simple glob matcher — supports `*` (matches any sequence of chars).
 * Used to replicate the fileMatch behavior of monaco-yaml.
 */
function globMatch(pattern: string, str: string): boolean {
  // Simple iterative glob matcher — avoids RegExp to prevent ReDoS.
  let pi = 0;
  let si = 0;
  let starPi = -1;
  let starSi = -1;

  while (si < str.length) {
    if (pi < pattern.length && (pattern[pi] === str[si] || pattern[pi] === '?')) {
      pi++;
      si++;
    } else if (pi < pattern.length && pattern[pi] === '*') {
      starPi = pi;
      starSi = si;
      pi++;
    } else if (starPi >= 0) {
      pi = starPi + 1;
      starSi++;
      si = starSi;
    } else {
      return false;
    }
  }

  while (pi < pattern.length && pattern[pi] === '*') {
    pi++;
  }

  return pi === pattern.length;
}

type YamlHandle = {
  update: (options: Record<string, unknown>) => void;
  dispose: () => void;
};

class EditorSchemaRegistryImpl {
  private _schemas = new Map<string, EditorSchema>();
  private _listeners = new Set<SchemaChangeListener>();
  private _yamlHandle: YamlHandle | null = null;

  /** All currently registered schemas. */
  get schemas(): EditorSchema[] {
    return Array.from(this._schemas.values());
  }

  /**
   * Inject the yaml handle created by `setupMonacoWorkers`.
   * Called once at startup before any editor mounts.
   * @internal
   */
  _setYamlHandle(handle: YamlHandle): void {
    log('_setYamlHandle called — handle keys:', Object.keys(handle));
    this._yamlHandle = handle;
  }

  /**
   * Register a schema. If a schema with the same URI exists, it is replaced.
   * Notifies all listeners (active editors) to reconfigure.
   */
  register(schema: EditorSchema): void {
    log('register() — uri:', schema.uri, 'fileMatch:', schema.fileMatch,
      'schema keys:', Object.keys(schema.schema).slice(0, 10));
    this._schemas.set(schema.uri, schema);
    this._notify();
  }

  /** Register multiple schemas at once. */
  registerAll(schemas: EditorSchema[]): void {
    log('registerAll() —', schemas.length, 'schemas:',
      schemas.map(s => s.uri));
    for (const s of schemas) {
      this._schemas.set(s.uri, s);
    }
    this._notify();
  }

  /** Unregister a schema by URI. */
  unregister(uri: string): boolean {
    log('unregister() — uri:', uri);
    const deleted = this._schemas.delete(uri);
    if (deleted) this._notify();
    else log('  schema not found, nothing to unregister');
    return deleted;
  }

  /** Clear all registered schemas. */
  clear(): void {
    log('clear() — removing', this._schemas.size, 'schemas');
    this._schemas.clear();
    this._notify();
  }

  /**
   * Find all registered schemas whose `fileMatch` patterns match the given
   * model URI string. Uses the same glob-like matching that monaco-yaml uses.
   */
  getSchemasForUri(modelUri: string): EditorSchema[] {
    return this.schemas.filter((s) =>
      s.fileMatch.some((pattern) => globMatch(pattern, modelUri)),
    );
  }

  /** Whether the YAML handle has been injected (workers initialized). */
  get isYamlReady(): boolean {
    return this._yamlHandle !== null;
  }

  /** Subscribe to schema changes. Returns an unsubscribe function. */
  onChange(listener: SchemaChangeListener): () => void {
    this._listeners.add(listener);
    log('onChange() — listener added, total listeners:', this._listeners.size);
    return () => {
      this._listeners.delete(listener);
      log('onChange() — listener removed, total listeners:', this._listeners.size);
    };
  }

  /**
   * Push all registered YAML schemas to the monaco-yaml worker via `update()`.
   * The yaml handle must have been injected by `setupMonacoWorkers` at startup.
   */
  applyYamlSchemas(): void {
    if (!this._yamlHandle) {
      warn('applyYamlSchemas() — NO yaml handle! Was setupMonacoWorkers imported?');
      return;
    }
    const schemas = this.schemas;
    const mapped = schemas.map((s) => ({
      uri: s.uri,
      fileMatch: s.fileMatch,
      schema: s.schema as Record<string, unknown>,
      // name/description are passed through to yaml-language-server's
      // registerExternalSchema — they appear in hover tooltips.
      ...(s.name && { name: s.name }),
      ...(s.description && { description: s.description }),
    }));
    log('applyYamlSchemas() — pushing', schemas.length, 'schemas');
    this._yamlHandle.update({
      enableSchemaRequest: false,
      schemas: mapped,
    });
    log('applyYamlSchemas() — update() called successfully');
  }

  /**
   * Apply all JSON schemas to Monaco's built-in JSON language service.
   * Accepts the `monaco` namespace so the registry itself doesn't import
   * `monaco-editor` — keeping it usable before Monaco loads.
   */
  applyJsonSchemas(monacoInstance: unknown): void {
    const m = monacoInstance as {
      json?: {
        jsonDefaults?: {
          setDiagnosticsOptions: (opts: {
            validate: boolean;
            schemas: Array<{
              uri: string;
              fileMatch: string[];
              schema: Record<string, unknown>;
            }>;
          }) => void;
        };
      };
      // Fallback for pre-0.55 (languages.json.jsonDefaults)
      languages?: {
        json?: {
          jsonDefaults?: {
            setDiagnosticsOptions: (opts: {
              validate: boolean;
              schemas: Array<{
                uri: string;
                fileMatch: string[];
                schema: Record<string, unknown>;
              }>;
            }) => void;
          };
        };
      };
    };

    const diagnosticsOptions = {
      validate: true,
      schemas: this.schemas.map((s) => ({
        uri: s.uri,
        fileMatch: s.fileMatch,
        schema: s.schema,
      })),
    };

    // 0.55+ top-level namespace
    const jsonDefaults = m.json?.jsonDefaults ?? m.languages?.json?.jsonDefaults;
    log('applyJsonSchemas() —', this.schemas.length, 'schemas, jsonDefaults available:',
      !!jsonDefaults);
    jsonDefaults?.setDiagnosticsOptions(diagnosticsOptions);
  }

  /** Log the current state of the registry for debugging. */
  debugState(): void {
    log('=== Registry State ===');
    log('  Schemas:', this._schemas.size);
    for (const [uri, schema] of this._schemas) {
      log(`    ${uri} → fileMatch: ${JSON.stringify(schema.fileMatch)}`);
    }
    log('  Listeners:', this._listeners.size);
    log('  YAML handle:', this._yamlHandle ? 'SET' : 'NOT SET');
    log('======================');
  }

  private _notify(): void {
    log('_notify() — notifying', this._listeners.size, 'listeners');
    for (const fn of this._listeners) {
      try {
        fn();
      } catch (err) {
        console.error('[schema-registry] listener threw during _notify():', err);
      }
    }
  }
}

/** Singleton schema registry instance. */
export const editorSchemas = new EditorSchemaRegistryImpl();

export type { EditorSchemaRegistryImpl as EditorSchemaRegistry };
