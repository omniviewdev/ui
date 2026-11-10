---
"@omniviewdev/base-ui": patch
---

Start the `MetricCell` loading pulse only after the cell has waited 500ms. A scrolling table mounts hundreds of loading cells and most are answered within a few frames, so each running pulse cost a compositor layer, a style update and an `animationstart` event for motion that was never visible. The placeholder, its busy state and its label are unchanged, and reduced motion still never pulses.

Make a `MetricCell` a size container only while it shows a value. A loading placeholder has no track or value slot to adapt, and every container makes the browser style its subtree in a separate pass after layout. Narrow-cell behavior for cells that show values is unchanged.

Format the displayed sample once per draw instead of once per label.
