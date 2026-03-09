/**
 * Official Kubernetes JSON Schemas (v1.28.0, standalone-strict).
 * Source: https://github.com/yannh/kubernetes-json-schema
 *
 * Loaded lazily via dynamic import() so they don't bloat the main bundle.
 */

export interface K8sSchemaEntry {
  name: string;
  kind: string;
  /** Full API group/version, e.g. "v1", "apps/v1", "networking.k8s.io/v1". */
  apiVersion: string;
  /** The group::version::resource segment used in structured filenames. */
  gvr: string;
  load: () => Promise<{ default: Record<string, unknown> }>;
}

/**
 * Build a fileMatch pattern for the structured naming convention:
 *   <plugin>|"_global"/<connectionId>|"_global"/<group>::<version>::<resource>.yaml
 *
 * Monaco URL-encodes `:` to `%3A` in model URIs, so fileMatch patterns use
 * the encoded form. The `*` prefix matches any scheme/path prefix.
 */
function gvrFileMatch(gvr: string): string[] {
  const encoded = gvr.replace(/:/g, '%3A');
  return [`*${encoded}.yaml`, `*${encoded}.yml`];
}

export const k8sSchemas: K8sSchemaEntry[] = [
  {
    name: 'Pod',
    kind: 'Pod',
    apiVersion: 'v1',
    gvr: 'core::v1::Pod',
    load: () => import('./pod-v1.json'),
  },
  {
    name: 'Deployment',
    kind: 'Deployment',
    apiVersion: 'apps/v1',
    gvr: 'apps::v1::Deployment',
    load: () => import('./deployment-apps-v1.json'),
  },
  {
    name: 'Service',
    kind: 'Service',
    apiVersion: 'v1',
    gvr: 'core::v1::Service',
    load: () => import('./service-v1.json'),
  },
  {
    name: 'ConfigMap',
    kind: 'ConfigMap',
    apiVersion: 'v1',
    gvr: 'core::v1::ConfigMap',
    load: () => import('./configmap-v1.json'),
  },
  {
    name: 'Ingress',
    kind: 'Ingress',
    apiVersion: 'networking.k8s.io/v1',
    gvr: 'networking.k8s.io::v1::Ingress',
    load: () => import('./ingress-networking-v1.json'),
  },
];

export { gvrFileMatch };
