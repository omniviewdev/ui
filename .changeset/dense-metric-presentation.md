---
'@omniviewdev/base-ui': patch
---

Restore consistent metric presentation with compact `MetricCell` bars, a shared `MetricPanel.value` slot, and provider icons in `MetricDetails`. Keep unknown bounds distinct from utilization.

Use shared calendar/time fields in `TimeRangeControl`. Preserve unchanged timestamps, reject incomplete drafts, and support keyboard entry. Normalize Menu and Popover trigger icon spacing across sizes.

Make metric cells fill resized columns while reserving one compact value/unit slot. Use a single pulse per pending cell and stable card skeletons; retain supplied data during background refresh. Correct shared Skeleton CSS specificity so the operating system's reduced-motion preference disables animation.
