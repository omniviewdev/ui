/**
 * Configure Monaco web workers for Vite-based environments.
 *
 * Import this module as a **side-effect** before any Monaco editor mounts.
 * It sets up web workers for all language services including
 * YAML (via `monaco-yaml`).
 *
 * @example
 * ```ts
 * // In your app's entry point or Storybook preview:
 * import '@omniview/editors/setup';
 * ```
 */
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { editorSchemas } from '../schemas';

// Vite `?worker` imports — Vite bundles each worker with its dependencies,
// transforming CJS→ESM so they work correctly in the browser Worker context.
import EditorWorker from './editor.worker?worker';
import JsonWorker from './json.worker?worker';
import TsWorker from './ts.worker?worker';
import CssWorker from './css.worker?worker';
import HtmlWorker from './html.worker?worker';
import YamlWorker from './yaml.worker?worker';

const DEBUG = false;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[monaco-setup]', ...args);
}
function warn(...args: unknown[]) {
  if (DEBUG) console.warn('[monaco-setup]', ...args);
}

log('Module loaded — configuring MonacoEnvironment');

// Idempotency guard — prevent double-initialization when the module is
// imported more than once (e.g. HMR or duplicate bundles).
const SETUP_KEY = '__omniview_monaco_setup__';
if ((globalThis as Record<string, unknown>)[SETUP_KEY]) {
  log('Already initialized — skipping duplicate setup');
} else {
(globalThis as Record<string, unknown>)[SETUP_KEY] = true;

// ---------------------------------------------------------------------------
// 1. MonacoEnvironment.getWorker — maps language labels to bundled workers
// ---------------------------------------------------------------------------

const existingEnv = self.MonacoEnvironment ?? {};
self.MonacoEnvironment = {
  ...existingEnv,
  getWorker(_workerId: string, label: string) {
    log(`getWorker called — label="${label}", workerId="${_workerId}"`);

    let worker: Worker;
    try {
      switch (label) {
        case 'yaml':
          worker = new YamlWorker();
          break;
        case 'json':
          worker = new JsonWorker();
          break;
        case 'typescript':
        case 'javascript':
          worker = new TsWorker();
          break;
        case 'css':
        case 'scss':
        case 'less':
          worker = new CssWorker();
          break;
        case 'html':
        case 'handlebars':
        case 'razor':
          worker = new HtmlWorker();
          break;
        default:
          worker = new EditorWorker();
          break;
      }
      log(`Worker created for "${label}" — instanceof Worker: ${worker instanceof Worker}`);
    } catch (err) {
      warn(`Failed to create worker for "${label}":`, err);
      throw err;
    }

    worker.onerror = (e) => {
      warn(`Worker "${label}" error:`, e.message, '| filename:', e.filename);
    };

    worker.addEventListener('message', (e) => {
      log(`Worker "${label}" first message:`, JSON.stringify(e.data).slice(0, 200));
    }, { once: true });

    return worker;
  },
};

log('MonacoEnvironment set');

// ---------------------------------------------------------------------------
// 3. Configure monaco-yaml ONCE at startup with empty schemas
// ---------------------------------------------------------------------------

try {
  const yamlHandle = configureMonacoYaml(monaco, {
    enableSchemaRequest: false,
    schemas: [],
  });
  log('configureMonacoYaml succeeded — handle keys:', Object.keys(yamlHandle));
  editorSchemas._setYamlHandle(yamlHandle as unknown as Parameters<typeof editorSchemas._setYamlHandle>[0]);
  log('YAML handle injected into EditorSchemaRegistry');
} catch (err) {
  // Surface YAML config errors so they are visible in the console even
  // when DEBUG is off — a silent failure here breaks all YAML completions.
  console.error('[monaco-setup] configureMonacoYaml FAILED:', err);
}

} // end idempotency guard

// Re-export for consumers that need the function form
export function setupMonacoWorkers(): void {
  // No-op — importing this module is sufficient. The side effects above
  // have already configured everything. This export exists so consumers
  // can call it explicitly if they prefer that pattern.
}
