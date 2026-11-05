# feat(base-ui): ship standalone metrics components

Standalone, themed metrics primitives and compositions. **No IDE integration or provider changes.**

| Reference panel                                                                                                                                            | Expanded details                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Metric panel](https://raw.githubusercontent.com/omniviewdev/ui/refs/heads/feat/metrics-components-20261105/evidence/metrics-components/metric-panel.png) | ![Structured metric details](https://raw.githubusercontent.com/omniviewdev/ui/refs/heads/feat/metrics-components-20261105/evidence/metrics-components/metric-panel-details.png) |

## Review live

[Reference panel](http://127.0.0.1:48637/?path=/story/metrics-components-metricpanel--default&globals=theme:void;density:compact;motion:reduced) · [Details](http://127.0.0.1:48637/?path=/story/metrics-components-metricpanel--details-expanded&globals=theme:void;density:compact;motion:reduced) · [Large dataset](http://127.0.0.1:48637/?path=/story/metrics-compositions--large-data&globals=theme:void;density:compact;motion:reduced)

Desktop review server; not a public preview. [All 17 component entries / 67 stories](https://github.com/omniviewdev/ui/blob/feat/metrics-components-20261105/evidence/metrics-components/component-stories.md).

## Ships

- Controlled panels, details, display/range controls, time series, distributions, gauges, capacity, rankings, state timelines, and SLO summaries.
- Shared compact panel disclosure across compositions; stable refresh/range rendering and bounded large-data examples.
- Portable React 19 declarations and compiler-enabled Table v9 integration; clean lint, formatting, and audit gates.

## Verified

- Full validation, all library builds, showcase build, and static Storybook build pass.
- **2,266 package tests + 19 tooling tests pass.** Existing assertions and expectations are unchanged.
- Strict installed consumer passes without `skipLibCheck` or consumer patches.
- Live browser checks cover metrics rendering, keyboard disclosure, refresh/ranges, virtualization, sorting, filtering, resizing, selection, and pinning.
- Final review fixed managed declaration exports, non-null style assertions, and narrowed-subscription row/layout/pagination caches.

[Evidence and screenshots](https://github.com/omniviewdev/ui/blob/feat/metrics-components-20261105/evidence/metrics-components/review.md) · [Final review receipt](https://github.com/omniviewdev/ui/blob/feat/metrics-components-20261105/evidence/metrics-components/final-review.md)

## Scope and remaining advisories

Fixture data only; no live-cluster claim. The audit retains Medium/Low advisories. Optional Storybook/showcase builds retain upstream loader/code-generator/chunk-size advisories; no suppression or baseline expansion.

Related: https://github.com/omniviewdev/omniview/issues/388. This independent component release does not reopen or claim new IDE integration.

Editor API cleanup: the permanently disabled `editorSchemas.debugState()` method was exported. Its removal is explicitly versioned as an editor **minor** release; callers should remove debug-only calls.
