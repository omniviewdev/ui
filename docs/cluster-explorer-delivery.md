# Cluster Explorer: base-ui-first delivery

Tracking board: https://github.com/orgs/omniviewdev/projects/14

**Implementation: IN PROGRESS.** Source implementation exists across UI, Kubernetes and host/runtime. Native application verification, persistence/restart evidence, integrated screenshots and source-compatible release PRs remain integration gates. Source tests and standalone UI proof do not certify the native application.

## Current source implementation

The column visibility popup uses `--ov-space-stack-sm` between checkbox rows.
It must not reference table-root private variables: the popup renders in a portal
and does not inherit variables declared on `DataTable.Root`.

Extra-small text uses `--ov-font-size-xs` instead of falling back to body size.
Small tooltips use that same scale rather than a fixed rem value. Status dots
and labels share a font size and line height. Consumers should let `Card.Title`
and `Card.Description` supply typography instead of nesting a body-sized `Text`.

`DataTable.Root` can shrink inside a bounded flex layout, and `DataTable.Container`
fills its remaining height while keeping overflow inside the viewport. Outer
header, body, footer, and skeleton cells use the shared extra-small edge inset;
interior cells retain their density-specific padding.


The existing-behavior sections preserve the pre-migration audit against Kubernetes base `99cfc61422003bf1738d40da18aa387466e5542a`. Historical defects describe that baseline. This table records current implementation source, not completed runtime acceptance.

| Area                    | Implemented source and evidence                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Explorer and navigation | `pages/ClustersPage.tsx`, `components/connections/ExplorerSidebar.tsx` and `ConnectionCard.tsx`: shared search/scope/facets, compact cards, direct open, connected-first Debug view, folders and saved lenses.                                                                                                                                                                            |
| Table                   | `components/connections/ConnectionTable.tsx`: base-ui `DataTable`, identity/provider/environment/region/account/status/metadata columns, sorting, grouping, visibility, density and virtual body.                                                                                                                                                                                         |
| Preview and settings    | `components/connections/ConnectionContextMenu.tsx`: explicit Preview dialog, independent overflow actions and full encoded cluster Settings route. Settings retain identity, avatar, description, tags and connection controls.                                                                                                                                                           |
| Organization            | `components/connections/ClusterOrganization.tsx`, `ClusterHub.tsx`, `ExplorerSidebar.tsx`, `hooks/useClusterPreferences.ts` and `utils/folderRules.ts`: shared folder drop targets, explicit organization mode, cancellation-safe assignment, menu alternatives and deduplicated manual-plus-rule membership. Saved section order/collapse and legacy folder images remain.               |
| Named custom assets     | `components/connections/FolderDialog.tsx`, `utils/clusterIconAssets.ts`, `utils/folderIcons.ts` and `hooks/useClusterPreferences.ts`: reusable named raster assets, shared browse/drop validation, base-ui IconPicker, backend asset storage and legacy inline image fallback. In-use asset removal preserves folder appearance.                                                          |
| Saved lenses            | `hooks/useClusterPreferences.ts`, `types/clusterExplorer.ts` and `pages/ClustersPage.tsx`: backend `cluster_saved_lenses`, save/edit/delete/reorder and restoration of query/facets/scope/group/sort/view.                                                                                                                                                                                |
| Shared recents          | `pages/ClusterResourcesRoute.tsx` records access in the connected resource view, rather than assuming a click or connection attempt succeeded. Explorer, homepage and launcher routes converge on that view. `hooks/useClusterPreferences.ts` retains backend `cluster_recent`, timestamps/counts and 100-entry limit. Native restart and cross-entry-point verification remain required. |
| Source provenance       | `utils/clusterSearch.ts`, `hooks/useConnectionGrouping.ts`, `ConnectionCard.tsx` and `ConnectionTable.tsx`: explicit source/key provenance, configured-hint labels and current/stale/unknown metadata. Names do not establish environment or ownership. Readiness is not workload health; missing metrics remain unknown.                                                                 |

Host tracking: [omniview#389](https://github.com/omniviewdev/omniview/issues/389) and [omniview#390](https://github.com/omniviewdev/omniview/issues/390). UI and Kubernetes work remains linked in the tracking table below.

## Publication and source-compatibility gate

Primary npm `latest` manifests observed during this audit:

| Package                                                             | Published version | Published peer dependencies                                                                                      |
| ------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| [base-ui](https://registry.npmjs.org/@omniviewdev%2fbase-ui/latest) | `0.13.0`          | `react ^19.3.1`, `react-dom ^19.3.1`                                                                             |
| [ai-ui](https://registry.npmjs.org/@omniviewdev%2fai-ui/latest)     | `6.1.7`           | `base-ui 0.13.0`, `react ^19.3.1`, `react-dom ^19.3.1`, `react-icons ^5.7.0`                                     |
| [editors](https://registry.npmjs.org/@omniviewdev%2feditors/latest) | `6.1.7`           | `base-ui 0.13.0`, `react ^19.3.1`, `react-dom ^19.3.1`                                                           |
| [runtime](https://registry.npmjs.org/@omniviewdev%2fruntime/latest) | `0.28.0`          | `base-ui ~0.13.0`, `react ^19.3.1`, `react-dom ^19.3.1`, `react-router ^8.5.0`, `@tanstack/react-query ^5.105.0` |

Local UI source still declares base-ui `0.13.0` and ai-ui/editors `6.1.7`; its workspace peers use `workspace:*`. Those declarations are not evidence that the new APIs exist in published `0.13.0`. Runtime source declares `0.7.4`, but stable release automation stamps the actual release version; that source value is not npm latest.

[UI#104](https://github.com/omniviewdev/ui/pull/104) merged at `429a614967e7654a2ba6c9dc94c9ba85f5fd26e6`. Live [UI#106](https://github.com/omniviewdev/ui/pull/106) is **OPEN**, not draft, with merge state **UNSTABLE**. Its current payload is base-ui `0.14.0`, ai-ui `6.1.8` and editors `6.1.8`, containing Card/KeyedSearch from #104. Its current release notes do not include IconPicker. The new `.changeset/reusable-icon-picker.md` requests a minor base-ui release; the final Changesets payload must include it before consumers select a version.

Safe publication order:

1. Obtain maintainer approval to merge the IconPicker source/export changes and changeset. Let Changesets update the release PR. If #106 has already published, use the next generated release instead; do not assume `0.14.0` contains IconPicker.
2. Review and authorize the resulting UI release PR. UI `.github/workflows/release.yml` installs with a frozen lock, builds, and runs Changesets on pushes to main; merging the version PR authorizes automatic npm publication. Confirm actual registry manifests and package exports for Card, KeyedSearch and IconPicker. Publish the matching ai-ui/editors cohort because their published base-ui peers are exact, not broad ranges.
3. Update host dependencies and runtime base-ui peer/devDependency to the actual released cohort. `~0.13.0` excludes `0.14.0`; changing only the plugin cannot fix that. Expose the new base-ui API through the host's shared dependency export and keep `ui/features/plugins/api/shared_dependencies.ts` synchronized with `packages/omniviewdev-vite-plugin/src/sharedPackages.ts`.
4. Regenerate ordinary repository locks from published packages with the repository's pinned pnpm, outside managed workspace-link overlays. Commit real resolution/integrity and peer snapshots with source-compatible manifests. Do not hand-write lock entries, freeze local `link:` overlays into release PRs, suppress peer errors, or reference unpublished versions. UI, host and plugin locks must each match their own final manifests.
5. Obtain explicit maintainer release authorization for the host/runtime cohort. Host `.github/workflows/release.yaml` supports npm-only `workflow_dispatch` with a version, or a `v*` tag for desktop plus npm. Its reusable `npm-publish.yml` stamps providers/runtime/vite-plugin to that version, builds providers → runtime → vite-plugin, and publishes to `latest`. Select an unused approved version rather than editing runtime's stale source version and assuming it publishes. Ensure npm trusted publishers authorize the calling `release.yaml`, and the workflow changes exist on main before tagging.
6. After that runtime exists on npm, update the Kubernetes consumer to the published runtime and matching UI cohort, regenerate its real lock, then complete integrated native verification and PR evidence. No plugin PR may depend on missing shared exports or only-local workspace APIs.

No release, tag, publish, merge or native-readiness claim is authorized by this audit. Parent owns final cohort selection, generated bindings, native linking, checks, screenshots, proof documentation and PRs.

## Delivery gates

1. Review and land the reusable Card interaction and KeyedSearch components in the UI repository. The first PR contains no Kubernetes implementation.
2. Deliver the reusable icon picker and release consumable base-ui components before migrating organization controls.
3. Migrate Kubernetes with a source-backed parity checklist. Saved lenses supplement folders; they do not replace manual folders or rule-based membership.

| Work                                                 | Tracker                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Interactive Card and action composition              | [ui#99](https://github.com/omniviewdev/ui/issues/99)                                   |
| Caret-aware KeyedSearch                              | [ui#100](https://github.com/omniviewdev/ui/issues/100)                                 |
| Theme, size, density and runtime verification        | [ui#101](https://github.com/omniviewdev/ui/issues/101)                                 |
| Domain-neutral icon picker                           | [ui#102](https://github.com/omniviewdev/ui/issues/102)                                 |
| Compact explorer and direct navigation               | [kubernetes#194](https://github.com/omniviewdev/omniview-plugin-kubernetes/issues/194) |
| Shared persistent recent history                     | [kubernetes#195](https://github.com/omniviewdev/omniview-plugin-kubernetes/issues/195) |
| Existing organization and customization parity       | [kubernetes#196](https://github.com/omniviewdev/omniview-plugin-kubernetes/issues/196) |
| Saved lenses and explicit organization mode          | [kubernetes#197](https://github.com/omniviewdev/omniview-plugin-kubernetes/issues/197) |
| Base-ui table migration                              | [kubernetes#198](https://github.com/omniviewdev/omniview-plugin-kubernetes/issues/198) |
| Debug readiness, provenance and metrics              | [kubernetes#199](https://github.com/omniviewdev/omniview-plugin-kubernetes/issues/199) |
| Custom image preservation and reusable asset library | [kubernetes#200](https://github.com/omniviewdev/omniview-plugin-kubernetes/issues/200) |

## Existing folder behavior must survive

Paths below are relative to the Kubernetes plugin's `ui/src/`. This is a source audit, not runtime certification.

| Capability                   | Existing contract                                                                                                                                                                                                                                   | Evidence                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Manual and automatic folders | Effective membership is the deduplicated union of explicit context IDs and rule matches. Removing a manual member does not exclude a context that still matches rules.                                                                              | `utils/folderRules.ts:155-176`                                                                                                 |
| Automatic attributes         | Displayed name, ID, provider, tags, connected state, labels, data and current metadata. Stale/missing metadata cannot satisfy negative rules.                                                                                                       | `utils/folderRules.ts:26-49,80-106`                                                                                            |
| Rules                        | All/Any; equality, negative equality, contains, negative contains, regex, exists and missing. Matching is case-insensitive; invalid regex never matches. Empty rules add no members.                                                                | `utils/folderRules.ts:54-150`, `components/connections/RuleBuilder.tsx:20-29,98-192`                                           |
| Tag matching                 | Existing implementation applies ANY-element semantics even for negative tag operators. Do not silently change this during migration.                                                                                                                | `utils/folderRules.ts:80-106`                                                                                                  |
| Folder identity              | Preset icon, color and per-folder custom image. Custom image takes precedence; switching to preset clears the saved image.                                                                                                                          | `components/connections/FolderDialog.tsx:140-143,263-270,350-449`, `utils/folderIcons.ts:79-106`                               |
| Image import                 | Browse/drop, preview, replace and remove. Decode and rasterize to JPEG within 64×64, preserving aspect ratio. Quality 0.85, then 0.5 retry; output data URL limited to 100,000 characters. SVG is not preserved as SVG.                             | `utils/avatarUtils.ts:24-80`, `components/connections/FolderDialog.tsx:200-244`                                                |
| Image persistence            | Inline `ConnectionGroup.customImage` in backend plugin data key `cluster_groups`, not browser-only storage.                                                                                                                                         | `types/clusters.ts:68-75`, `hooks/useClusterPreferences.ts:37-48,109-151`                                                      |
| Drag/drop                    | Pointer and keyboard sensors are wired. Folder drop assigns; cross-folder drop removes source manual membership then assigns destination.                                                                                                           | `components/connections/ClusterHub.tsx:133-185`, `components/connections/RowHandler.tsx:38-54`                                 |
| Drag edge case               | The baseline removed manual membership on a drop with no target. The replacement intentionally does not preserve that defect: cancellation and no-target drops leave membership unchanged. Native drag/drop acceptance remains an integration gate. | Baseline: `components/connections/ClusterHub.tsx:160-185`; replacement: shared folder-drop handlers and organization controls. |

Keyboard folder-drop parity needs a real runtime check: lift, move, drop, cancel, section reorder and focus restoration. Provide non-drag menu alternatives. Current menu checkmarks reflect manual membership only, not effective rule membership; the redesign should distinguish these concepts.

## New custom-icon library is separate scope

Existing Custom Image assigns an inline image to one folder. It is not a reusable Slack-like catalog. The new library needs stable asset IDs, names/search, upload/reuse, reference-aware deletion, profile/backend persistence, safe decoding and migration of existing images without loss. Base-ui owns the controlled picker and visual states; application code owns files, validation policy, persistence and access.

The baseline file picker used an `accept` hint without matching picker/drop validation. Current browse and drop imports use the same caller-owned `handleImageFile` and `decodeClusterIcon` path. Imports require matching PNG/JPEG/WebP MIME and signatures, nonempty files no larger than 5 MiB, successfully decoded dimensions within 8192 pixels per side and 16,777,216 pixels total. Output is rasterized to PNG within 128×128 and limited to 140,000 data-URL characters before backend persistence. SVG and HTML are not imported. Base-ui does not replace this application validation policy.

## Component requirements

Interactive cards use semantic hover, selection, focus and motion roles. The leading rail is a logical edge and must survive RTL, high contrast and focus. Content geometry remains stable; action menus are siblings, not controls nested inside a primary button/link.

KeyedSearch accepts domain-neutral fields. It combines free text with quoted keyed values, follows the cursor, shows automatic suggestions, preserves surrounding query text and gives completion keyboard handling priority only while its popup is open. The application owns filtered results and direct navigation. Input capitalization, autocorrection and spelling suggestions are disabled.

Native themes and sizes are data-driven: consume the built-in registry catalog, all five ComponentSize tiers, both densities and existing text-size preferences. Test reduced motion, long content, narrow panes, nested theme roots and custom token overrides. A new theme should inherit semantic aliases; no component may contain a fixed palette or theme-ID branch.

## Front-page parity beyond folders

| Capability          | Preserve or explicitly decide                                                                                                                                                                                                                   | Evidence in Kubernetes `ui/src/`                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Hub sections        | Connected → Recent → Favorites → Browse defaults; custom sections before Browse; saved order/collapse and IDs. Empty standard sections hide; empty folders remain drop targets.                                                                 | `hooks/useClusterPreferences.ts:17-22,69-90`, `hooks/useHubSections.ts:38-100,149-171`, `components/connections/ClusterHub.tsx:119-130,326-365` |
| Identity            | Display name, description, draft save/discard/reset, uploaded avatar, custom color and deterministic initials fallback. Preserve immutable context identity and async-loaded untouched fields.                                                  | `pages/ClusterEditPage/index.tsx:58-103`, `components/connections/AvatarEditor.tsx:53-94,129-187`, `components/shared/NamedAvatar.tsx:15-49`    |
| Provider and tags   | Provider mark is separate from avatar. Preserve EKS/GKE/AKS, distribution marks, OpenShift/Rancher and fallback. Tags remain editable and searchable/filterable/groupable/rule-compatible.                                                      | `utils/providers.ts:8-89`, `components/connections/ProviderIcon.tsx:14-40`, `components/connections/TagInput.tsx:10-36`                         |
| Favorites/history   | Pinned is a presentation rename of `cluster_favorites`, not another store. Preserve recent timestamp/access count, 100-entry bound and relative-time/bucket semantics. Hub displays up to eight recents.                                        | `hooks/useClusterPreferences.ts:96-106,187-217`, `hooks/useHubSections.ts:79-100`                                                               |
| Group/sort          | Preserve none/provider/status/favorites/custom/tags/recent/arbitrary-label modes, legacy aliases, multi-membership, Ungrouped/Untagged and sort direction. Label sort options require 10% coverage. Existing grouping applies to list and grid. | `hooks/useConnectionGrouping.ts:135-355`, `components/connections/GroupBySelector.tsx:27-58`, `components/connections/SortBySelector.tsx:27-61` |
| Search/facets       | Preserve description, tags, labels, nonretired data and current metadata discovery beyond the mock's limited fields. OR within a filter category; AND across categories. Dynamic label chips require 30% coverage and 2–8 values.               | `hooks/useConnectionGrouping.ts:65-119`, `components/connections/FilterChips.tsx:64-177`                                                        |
| Attribute browse    | Arbitrary-label drill-down/back and count ordering; preferred region/account/project/subscription/kubeconfig attributes. Existing click handler only records access: track the missing drill-through as a defect, not a desired contract.       | `components/connections/GroupBrowser.tsx:37-164`, `components/connections/ClusterHub.tsx:348-353`                                               |
| Table/grid          | Preserve layout, arbitrary-label column visibility and saved preferences. Existing flat grid and Hub page at 40 items. Manual cluster order and table column resizing/reorder were not found; those are enhancements.                           | `pages/ClustersPage.tsx:63-82`, `components/connections/ColumnPicker.tsx:34-90`, `components/connections/ConnectionTable.tsx:231-246,325-408`   |
| Context actions     | Connect/disconnect, new tab/window, Edit, Favorite, folder assign/remove/create, copy ID and confirmed Delete. Overflow actions must not activate primary navigation. No native right-click implementation was established.                     | `components/connections/ConnectionContextMenu.tsx:81-203`                                                                                       |
| Connection/settings | Connect before routing, encoded IDs, full identity/tags/server/connection/metrics/node-shell settings. Preserve unrelated override fields and resource-sidebar ordering. Rename-only mock settings are not sufficient for migration.            | `hooks/useClusterAction.ts:28-61`, `pages/ClusterEditPage/index.tsx:85-94,224-272`, `hooks/useSidebarOrder.ts:120-133`                          |
| Delete/discovery    | Preserve confirmation and kubeconfig-settings discovery. No frontend add/import wizard was found. Delete currently closes on failure and leaves preference references: track separately rather than silently deleting customization.            | `components/connections/DeleteConfirmationModal.tsx:18-34`, `pages/ClustersPage.tsx:286-445`, `components/connections/EmptyState.tsx:23-30`     |
| Home extension      | Preserve registration/config, shared identity/history/favorites, connected/recent/favorites/folders and default five-item limit. Connected cards retain sync/error, resource counts, collection state, metrics and disconnect.                  | `entry.ts:430-442`, `components/homepage/KubernetesHomepageCard.tsx:136-280`, `components/homepage/ConnectedClusterCard.tsx:73-201`             |
| Existing home gaps  | Folder chip currently uses a plain icon/manual count with no navigation; descriptions/tags/provider badges are missing. Effective smart-folder counts and custom icon navigation are improvements, not existing home behavior.                  | `components/homepage/KubernetesHomepageCard.tsx:71-95,123-131`                                                                                  |
| Persistence         | Plugin data owns favorites/groups/overrides/recent/Hub sections. LocalStorage owns tab/view/group/sort/direction/columns. Search/facets/All-group collapse/browse/page are transient; Hub collapse persists.                                    | `hooks/useClusterPreferences.ts:30-91`, `pages/ClustersPage.tsx:60-86`, `hooks/useStoredState.tsx:9-34`                                         |
