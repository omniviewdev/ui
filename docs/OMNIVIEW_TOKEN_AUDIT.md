# Omniview Token Audit (Non-Legacy)

This audit validates token completeness against current Omniview IDE functionality in `../omniview/ui`.

Legacy Trivy surfaces are intentionally out of scope for this v1 token contract.

## Coverage matrix

| Surface                      | States found in Omniview                                                                                           | Token family                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Plugin lifecycle             | `Running`, `Failed`, `BuildFailed`, `Starting`, `Building`, `Recovering`, `Validating`, `Stopped`, `Connecting`    | `--ov-color-plugin-phase-*`                                                                                        |
| Dev server                   | `ready`, `building`, `error`, `stopped`, `connecting`, gRPC connected/disconnected                                 | `--ov-color-devserver-*`                                                                                           |
| Connection sync              | connected, syncing, error, idle, skipped, forbidden, per-group progress                                            | `--ov-color-connection-*`                                                                                          |
| Logs                         | levels `error/warn/info/debug/trace`, source badge palettes, search match and active match, stream error banners   | `--ov-color-log-*`                                                                                                 |
| Terminal sessions            | connecting, connection failed, structured error with retry commands                                                | `--ov-color-terminal-session-*`                                                                                    |
| Footer runtime chips         | dev servers, failed plugins, operations, port-forward sessions                                                     | `--ov-color-footer-chip-*`, `--ov-color-operation-*`, `--ov-color-portforward-*`                                   |
| Drawer affordances           | bottom-drawer drag handle idle/hover/active, drawer tab active borders                                             | `--ov-color-bottomdrawer-*`, `--ov-color-rightdrawer-*`, `--ov-size-bottomdrawer-*`, `--ov-opacity-bottomdrawer-*` |
| Resource edit/diff workflows | submit/cancel/reset, parse/syntax errors, diff toggle and drawer framing                                           | `--ov-color-resource-editor-*`, `--ov-color-resource-drawer-*`                                                     |
| Marketplace metadata         | official badge, rating stars, download indicators, install/update surfaces                                         | `--ov-color-plugin-marketplace-*`, `--ov-color-plugin-install-*`                                                   |
| Resource runtime statuses    | `Running`, `Ready`, `Pending`, `Terminating`, `CrashLoopBackOff`, `ImagePullBackOff`, `OOMKilled`, `Unknown`, etc. | `--ov-color-resource-status-*` (alias to semantic status tokens)                                                   |

## Concrete source files reviewed

1. `../omniview/ui/pages/plugins/PluginListItem.tsx`
2. `../omniview/ui/pages/plugins/DevModeSection.tsx`
3. `../omniview/ui/pages/plugins/PluginsNav.tsx`
4. `../omniview/ui/pages/plugins/PluginDetails.tsx`
5. `../omniview/ui/components/displays/Footer/AppStatusFooter.tsx`
6. `../omniview/ui/components/displays/Footer/ConnectionStatusIndicator.tsx`
7. `../omniview/ui/features/connectionState/ConnectionStateDialog.tsx`
8. `../omniview/ui/providers/BottomDrawer/containers/LogViewer/types.ts`
9. `../omniview/ui/providers/BottomDrawer/containers/LogViewer/LogEntry.tsx`
10. `../omniview/ui/providers/BottomDrawer/containers/LogViewer/index.tsx`
11. `../omniview/ui/providers/BottomDrawer/containers/Terminal.tsx`
12. `../omniview/ui/providers/BottomDrawer/containers/TerminalError.tsx`
13. `../omniview/ui/layouts/core/main/BottomDrawer/index.tsx`
14. `../omniview/ui/components/displays/RightDrawer.tsx`
15. `../omniview/ui/federation/ResourceSidebarComponent.tsx`
16. `../omniview/ui/federation/LinkedResourceDrawer.tsx`
17. `../omniview/packages/omniviewdev-ui/src/domain/ResourceStatus.tsx`

## Action

The proposed tokens above are now reflected in:

1. `docs/IDE_TOKEN_CATALOG.md`
2. `docs/THEME_TOKEN_MAPPING.md`
3. `docs/TOKEN_CATALOG.md`
4. `docs/THEME_REVIEW_CHECKLIST.md`
