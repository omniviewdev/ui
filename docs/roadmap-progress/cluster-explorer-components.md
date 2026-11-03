# KeyedSearch and interactive Card verification

## Scope

Real base-ui React components rendered in Chromium through base-ui Storybook. No Kubernetes code changed, no real cluster connected, and no Wails/native WebView integration is claimed. Native themes means the nine built-in themes in the registry catalog.

## Exercised matrix

| Surface                               | Coverage                                                                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card                                  | 9 built-in themes × 2 densities × 5 size tiers = 90 combinations                                                                                                                         |
| KeyedSearch input and automatic popup | 9 built-in themes × 2 densities × 5 size tiers = 90 combinations                                                                                                                         |
| Text scaling                          | 80/90/100/110/125 preferences in light and dark; all search size/density tiers; all card tiers                                                                                           |
| Narrow pane                           | 360px viewport, high-contrast light, 125% text; long names and quoted values                                                                                                             |
| Theme boundaries                      | Nested dark/light; custom card aliases; custom syntax and popup scope                                                                                                                    |
| Interaction                           | Direct card link, keyboard selection, independent overflow, disabled primary, first-result Enter, automatic key/value suggestions, mid-query replacement, native selection and scrolling |
| Motion and direction                  | Reduced motion removes card transitions; RTL places the 3px rail on the right logical leading edge                                                                                       |

Native-theme contact sheets were visually opened and reviewed. Popup snapshots settle CSS transitions before capture. Checks also assert geometry, popup viewport containment, active-option visibility and no browser errors.

Built-ins: Void, Dark, Light, Obsidian, Carbon, Solarized Dark, Solarized Light, High Contrast Dark, High Contrast Light. The portable verifier imports the catalog rather than duplicating this list, so a newly registered built-in joins the matrix automatically.

## Reproduce

Start the base-ui Storybook server:

```sh
pnpm --filter @omniviewdev/base-ui exec storybook dev -p 6018 --ci --no-open
```

Then run the checked-in browser smoke using the existing benchmark package's Playwright dependency:

```sh
node packages/benchmarks/scripts/verify-explorer-components.mjs \
  http://localhost:6018 /tmp/omniview-explorer-components
```

Use a Node version with native TypeScript stripping (the repository's Node 26 works). Install Playwright Chromium if it is not already available, or set `CHROME_PATH`. The verifier captures each native theme/size/density fixture, exercises keyboard completion/direct navigation and writes `verification.json` outside the checkout by default.

## Results

| Check                                             | Observed result                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Full base-ui Vitest suite                         | 150 files, 1,717 tests passed                                                                                        |
| Base-ui TypeScript check                          | Passed                                                                                                               |
| ESLint on changed TS/TSX and browser verifier     | Passed                                                                                                               |
| Publishable base-ui build, including declarations | Passed                                                                                                               |
| Portable Chromium verifier                        | Passed; 108 records containing 180 component/theme/size/density combinations, plus text-scale and interaction checks |
| Theme dependency-cycle audit                      | Zero cycles                                                                                                          |
| Repository-wide UI audit                          | Fails its existing baseline gate: 115 High findings total, 92 reported as new relative to the stored baseline        |

Every one of the 115 High finding snippets already exists in the branch's starting HEAD. No High snippet comes from the new component work. The existing baseline was not regenerated, and the generated audit report was not committed. Lower-severity static findings include existing Card local stacking values and the combobox's intentional input-owned keyboard handling.

### Review fixes

- Filtering a manually scrolled suggestion list could leave the active option offscreen. Reproduced with native wheel/type input; the active row was above the popup. Updating the effect dependency restores it into view after filtering.
- Holding Space on the existing div ActionArea could scroll the page. Repeated activation keys now prevent scrolling without repeating activation.
- Rapid focus movement between searches exposed the exiting popup's listbox to accessibility queries. Exiting listboxes are now aria-hidden; only the focused search's suggestions remain exposed.

### Indexed candidate measurement

A local Chromium development run indexed 10,000 values in approximately 1.4ms. Across 200 worst-position exact-substring matching iterations, median was 0.3ms and p95 0.6ms. This measures parser/completion work, not end-to-end input latency or a cross-device performance guarantee. Mounted suggestions were capped at 12 in the large-data fixture; the final query displayed one match.

## Screenshots

- [Void / Dark / Light: sizes and densities](evidence/cluster-explorer/native-themes-1.png)
- [Obsidian / Carbon / Solarized Dark: sizes and densities](evidence/cluster-explorer/native-themes-2.png)
- [Solarized Light / both High Contrast themes: sizes and densities](evidence/cluster-explorer/native-themes-3.png)
- [Void / Dark / Light automatic popups](evidence/cluster-explorer/native-popups-1.png)
- [Obsidian / Carbon / Solarized Dark automatic popups](evidence/cluster-explorer/native-popups-2.png)
- [Solarized Light / both High Contrast automatic popups](evidence/cluster-explorer/native-popups-3.png)
- [Keyboard selection and independent card actions](evidence/cluster-explorer/card-keyboard-actions.png)
- [Distinct focus, selection and disabled states](evidence/cluster-explorer/card-states-light.png)
- [Nested and custom card aliases](evidence/cluster-explorer/card-nested-custom.png)
- [Nested and custom search syntax/popup](evidence/cluster-explorer/nested-custom-search.png)
- [Narrow card composition at 125% text](evidence/cluster-explorer/card-narrow-125.png)
- [Narrow search popup at 125% text](evidence/cluster-explorer/narrow-search-125.png)
- [10,000-value lookup](evidence/cluster-explorer/search-10000-candidates.png)
- [Machine-readable summary](evidence/cluster-explorer/verification-summary.json)

## Limits and next gates

Unit tests cover IME boundaries; an actual OS IME and screen reader were not exercised. Semantic token inheritance and a custom-theme smoke reduce coupling, but arbitrary future theme palettes still need contrast and visual review. The source-audited Kubernetes folder, icon, rule and homepage behavior remains a migration gate, not a runtime-certified plugin change. The reusable icon library is tracked separately; it is not implemented in this component PR.
