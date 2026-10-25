// P18 evidence-only runner. Never imported by the application or package builds.
// Usage: node p18-browser-bootstrap.mjs HOST/e2e/package.json EXTRACTED_BUNDLE
//        FRESH_WORKSPACE_INSPECT_JSON NEW_PRIVATE_RESULT_JSON [CHROMIUM_EXECUTABLE]
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const [packageFile, bundleDirectory, descriptorFile, outputFile, executablePath] = process.argv.slice(2);
assert(packageFile && bundleDirectory && descriptorFile && outputFile,
  'Expected host E2E package.json, extracted bundle, fresh inspect JSON and new private output path');
const require = createRequire(resolve(packageFile));
const { chromium } = require('@playwright/test');
const automationVersion = require('@playwright/test/package.json').version;
const descriptor = JSON.parse(await readFile(descriptorFile, 'utf8'));
const instance = descriptor.instance;
assert.equal(descriptor.launchPhase, 'ready', 'Use a fresh canonical workspace inspect after launch');
assert.equal(instance?.kind, 'development');
assert.equal(descriptor.manifest.workspaceID, instance.workspaceID);
assert.equal(instance.instanceID, instance.workspaceID);
assert.equal(descriptor.generation, instance.generation);
assert.equal(descriptor.stateRoot, instance.stateRoot);
assert.equal(descriptor.manifest.plugins.length, 0, 'Use a plugin-free owned comparison workspace');
const cohort = {
  omniview: 'fd50802230bd2df7f101c23fd85061c11dcd9aa8',
  'plugin-sdk': '1e92fb518b117814acb504aaae1772ff39abcdef',
  ui: '229a060885acea203410b1b113c68e4016d81b97',
};
for (const [id, commit] of Object.entries(cohort)) {
  assert.equal(instance.repositories.find(repository => repository.id === id)?.commit, commit,
    `This historical-cohort reproduction requires the recorded ${id} revision`);
}
assert.equal(instance.process.source, instance.repositories.find(repository => repository.id === 'omniview').path);
const endpoint = new URL(instance.endpoints.browser);
assert.equal(endpoint.protocol, 'http:');
assert.equal(endpoint.hostname, '127.0.0.1');
assert(!endpoint.username && !endpoint.password && !endpoint.search && !endpoint.hash);
endpoint.hash = '/__p18-editor-feasibility';
const helperSource = await readFile(resolve(bundleDirectory, 'browser-measurement-functions.js'), 'utf8');
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const result = {
  method: 'portable Playwright adapter over archived helpers; new observations, not historical timing equivalence',
  automationVersion, browserVersion: browser.version(), cohort,
  workspaceID: instance.workspaceID, generation: instance.generation, candidates: {},
  limitations: ['loaded-shell mount, not cold app start', 'script focus, not OS focus/paint',
    'Worker instrumentation records construction and explicit terminate only; CDP supplies live targets',
    'no OS clipboard, IME, VoiceOver, native AX, native heap or production semantics proof'],
};

// Install before navigation, including host-owned workers created before the route mounts.
// This is supplied reproduction instrumentation, not a recovered historical initializer.
function instrumentWorkers() {
  const records = [];
  Object.defineProperty(window, '__P18_WORKERS__', { value: records });
  const OriginalWorker = window.Worker;
  window.Worker = class extends OriginalWorker {
    constructor(url, options) {
      super(url, options);
      this.p18WorkerID = records.length;
      records.push({ kind: 'constructed', id: this.p18WorkerID, url: String(url), at: performance.now() });
    }
    terminate() {
      records.push({ kind: 'terminate-called', id: this.p18WorkerID, at: performance.now() });
      return super.terminate();
    }
  };
}

async function freshPage() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  try {
    await context.addInitScript(instrumentWorkers);
    const page = await context.newPage();
    page.setDefaultTimeout(30_000);
    await page.goto(endpoint.href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(expected => {
      const identity = window.__OMNIVIEW_BOOTSTRAP__?.identity;
      return identity?.instanceID === expected.instanceID && identity?.generation === expected.generation
        && identity?.kind === 'development' && window.__P18?.source === 'p18-host-comparison-37c896d0-v1';
    }, { instanceID: instance.instanceID, generation: instance.generation });
    await page.waitForSelector('[data-testid="p18-comparison"]', { state: 'visible' });
    // Supply only the small Puppeteer-shaped surface used by the unchanged archived helpers.
    const p18tab = {
      evaluate: expression => page.evaluate(expression),
      async run(fn, { args = [], timeout = 30 } = {}) {
        const listeners = [];
        const compatiblePage = new Proxy(page, {
          get(target, property) {
            if (property === 'createCDPSession') return () => context.newCDPSession(page);
            if (property === 'waitForSelector') return (selector, options = {}) => target.waitForSelector(selector, {
              state: options.hidden ? 'hidden' : options.visible ? 'visible' : 'attached',
            });
            if (property === 'on') return (event, listener) => {
              listeners.push([event, listener]);
              target.on(event, listener);
            };
            const value = Reflect.get(target, property);
            return typeof value === 'function' ? value.bind(target) : value;
          },
        });
        let timer;
        try {
          return await Promise.race([
            fn({ page: compatiblePage }, ...args),
            new Promise((_, reject) => {
              timer = setTimeout(() => reject(new Error(`Archived helper exceeded ${timeout}s deadline`)), timeout * 1000);
            }),
          ]);
        } finally {
          clearTimeout(timer);
          for (const [event, listener] of listeners) page.off(event, listener);
        }
      },
    };
    const helpers = { p18tab };
    vm.runInNewContext(helperSource, helpers, { filename: 'browser-measurement-functions.js' });
    return { context, page, ...helpers };
  } catch (error) {
    await context.close();
    throw error;
  }
}

async function waitForDisposal(page, candidate, count) {
  await page.waitForFunction(({ candidate, count }) => {
    const evidence = window.__P18;
    const events = evidence.events.filter(event => event.candidate === candidate);
    return events.filter(event => event.kind === 'adapter-disposed').length === count
      && (candidate !== 'monaco' || (events.filter(event => event.kind === 'document-closed').length === count
        && evidence.monaco.editor.getModels().length === 0));
  }, { candidate, count });
}

try {
  for (const candidate of ['lightweight', 'monaco']) {
    const latency = await freshPage();
    const samples = {};
    result.candidates[candidate] = samples;
    try {
      samples.first = await latency.p18cycle(candidate, 1);
      await waitForDisposal(latency.page, candidate, 1);
      samples.warm20 = await latency.p18cycle(candidate, 20);
      await waitForDisposal(latency.page, candidate, 21);
      samples.afterLatency = await latency.p18measure('after-first-and-warm20');
    } finally { await latency.context.close(); }
    const heap = await freshPage();
    try {
      samples.before = await heap.p18measure('before');
      samples.batch20 = await heap.p18cycle(candidate, 20);
      await waitForDisposal(heap.page, candidate, 20);
      samples.after20 = await heap.p18measure('after20');
      samples.batch40 = await heap.p18cycle(candidate, 20);
      await waitForDisposal(heap.page, candidate, 40);
      samples.after40 = await heap.p18measure('after40');
      samples.events = await heap.page.evaluate(() => window.__P18.events);
    } finally { await heap.context.close(); }
  }
} catch (error) {
  result.failure = { name: error.name, message: error.message };
  process.exitCode = 1;
} finally {
  try { await browser.close(); }
  finally {
    // Resource URLs may contain dev HMR credentials. Keep new output private and review before sharing.
    await writeFile(outputFile, JSON.stringify(result, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  }
}
