---
'@omniviewdev/base-ui': minor
---

Replace metric annotations and request-marker props with the generic `MetricReference` line/band union on time-series charts, stacked charts, capacity bars, metric cells, gauges, and ranked bars. Normalize missing/invalid configuration consistently, include references in automatic domains, retain pinned off-scale inspection, and group coincident geometry without losing names. Keep neutral defaults, base-unit values, fixed-height responsive table cells, and real-bound-only utilization.

Keep gauge values anchored to the arc independently of wrapped legends, normalize extreme finite chart projections, and retain zero-reference geometry on all-zero ranked axes. Paint reference bands behind data to preserve series colors.

Accept the same references on `MetricValue` so stat/current-only views retain inspectable configuration below the scalar, without a numeric scale or extra DOM when references are absent.
