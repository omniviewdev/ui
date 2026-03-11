# UI Audit Findings Report

**Date:** 2026-03-11
**Total findings:** 1135
**High:** 164 | **Medium:** 789 | **Low:** 182

---

## Summary by Check

| Severity | Category | Check | Count |
|----------|----------|-------|-------|
| High | Token/Styling | Hardcoded color | 32 |
| High | Token/Styling | Primitive token leakage | 99 |
| High | Convention | Inline style | 33 |
| Medium | Token/Styling | Hardcoded transition | 130 |
| Medium | Token/Styling | Hardcoded spacing | 85 |
| Medium | Token/Styling | Hardcoded radius | 19 |
| Medium | Token/Styling | Hardcoded box-shadow | 23 |
| Medium | Token/Styling | Missing theme coverage | 397 |
| Medium | Token/Styling | Missing IDE alias | 91 |
| Medium | Performance | Inline object prop | 24 |
| Medium | Performance | Inline array prop | 3 |
| Medium | Performance | Inline function prop | 1 |
| Medium | Performance | Missing memo | 16 |
| Low | Token/Styling | Hardcoded opacity | 114 |
| Low | Token/Styling | Hardcoded font-size | 17 |
| Low | Token/Styling | Hardcoded z-index | 32 |
| Low | Convention | Large component file | 19 |

---

## Detailed Findings

### High: Hardcoded color (Token/Styling)

**32 finding(s)**

- `packages/base-ui/src/components/avatar/Avatar.module.css:107` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #0b8f5a;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:108` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #f5fbf9;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:112` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #1f7ae0;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:113` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #f4f8ff;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:117` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #7e57c2;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:118` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #f6f1ff;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:122` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #d56a1f;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:123` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #1a0e04;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:127` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #c94153;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:128` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #fff1f3;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:132` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #137c8b;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:133` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #ebfbff;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:137` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #556274;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:138` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #f4f7ff;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:142` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #3f9153;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:143` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #f1fff5;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:147` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #9a5a2d;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:148` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #fff5ec;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:152` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #2f5bbb;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:153` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #eff3ff;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:157` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #7f4458;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:158` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #fff2f8;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:162` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-bg: #49508f;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:163` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-fallback-fg: #f0f2ff;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:26` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_ov-dt-pinned-shadow: rgb(0 0 0 / 0.12);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:396` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:412` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.3);
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:192` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 0 0 1px rgb(0 0 0 / 0.08),
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:193` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 1px 3px rgb(0 0 0 / 0.24);
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:20` — Hex color found — use a semantic token (--ov-color-*)
  ```
  --_ov-thumb-bg: #ffffff;
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:143` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 0 0 1px rgb(0 0 0 / 0.06),
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:144` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 1px 2px rgb(0 0 0 / 0.28);
  ```

### High: Primitive token leakage (Token/Styling)

**99 finding(s)**

- `packages/base-ui/src/components/basic-list/BasicList.module.css:27` — Primitive token used directly — use a semantic token instead
  ```
  font-size: var(--ov-primitive-font-size-11);
  ```
- `packages/base-ui/src/components/card/Card.module.css:98` — Primitive token used directly — use a semantic token instead
  ```
  box-shadow: var(--ov-primitive-shadow-sm);
  ```
- `packages/base-ui/src/components/card/Card.module.css:101` — Primitive token used directly — use a semantic token instead
  ```
  box-shadow: var(--ov-primitive-shadow-md);
  ```
- `packages/base-ui/src/components/card/Card.module.css:104` — Primitive token used directly — use a semantic token instead
  ```
  box-shadow: var(--ov-primitive-shadow-lg);
  ```
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:247` — Primitive token used directly — use a semantic token instead
  ```
  font-size: var(--ov-primitive-font-size-16);
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:4` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--_ov-group-spacing, var(--ov-primitive-space-1));
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:16` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-group-spacing: var(--ov-primitive-space-0);
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:19` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-group-spacing: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:22` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-group-spacing: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:25` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-group-spacing: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:28` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-group-spacing: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.module.css:33` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-font-size: var(--ov-primitive-font-size-16);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:320` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:489` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:13` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-tab-font-size: var(--ov-primitive-font-size-13);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:108` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-tab-font-size: var(--ov-primitive-font-size-11);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:154` — Primitive token used directly — use a semantic token instead
  ```
  font-size: var(--ov-primitive-font-size-11);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:296` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:413` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/filter-bar/FilterBar.module.css:5` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/find-bar/FindBar.module.css:4` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/find-bar/FindBar.module.css:5` — Primitive token used directly — use a semantic token instead
  ```
  padding: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/find-bar/FindBar.module.css:13` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/form-field/FormField.module.css:8` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/form-field/FormField.module.css:45` — Primitive token used directly — use a semantic token instead
  ```
  gap: calc(var(--ov-primitive-space-1) - 1px);
  ```
- `packages/base-ui/src/components/form-field/FormField.module.css:76` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:3` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--_ov-spacing, var(--ov-primitive-space-2));
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:56` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-0);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:59` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:62` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:65` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:68` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:73` — Primitive token used directly — use a semantic token instead
  ```
  row-gap: var(--ov-primitive-space-0);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:76` — Primitive token used directly — use a semantic token instead
  ```
  row-gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:79` — Primitive token used directly — use a semantic token instead
  ```
  row-gap: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:82` — Primitive token used directly — use a semantic token instead
  ```
  row-gap: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:85` — Primitive token used directly — use a semantic token instead
  ```
  row-gap: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:90` — Primitive token used directly — use a semantic token instead
  ```
  column-gap: var(--ov-primitive-space-0);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:93` — Primitive token used directly — use a semantic token instead
  ```
  column-gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:96` — Primitive token used directly — use a semantic token instead
  ```
  column-gap: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:99` — Primitive token used directly — use a semantic token instead
  ```
  column-gap: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:102` — Primitive token used directly — use a semantic token instead
  ```
  column-gap: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/image-list/ImageList.module.css:54` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-primitive-space-0);
  ```
- `packages/base-ui/src/components/image-list/ImageList.module.css:57` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/image-list/ImageList.module.css:60` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/image-list/ImageList.module.css:63` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/image-list/ImageList.module.css:66` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/image/Image.module.css:34` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/image/Image.module.css:37` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-radius: var(--ov-primitive-radius-md);
  ```
- `packages/base-ui/src/components/image/Image.module.css:40` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-radius: var(--ov-primitive-radius-lg);
  ```
- `packages/base-ui/src/components/meter/Meter.module.css:7` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/meter/Meter.module.css:71` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/meter/Meter.module.css:78` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/pagination/Pagination.module.css:5` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-primitive-space-1, 4px);
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:206` — Primitive token used directly — use a semantic token instead
  ```
  font-size: var(--ov-primitive-font-size-16);
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:37` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:81` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/sheet/Sheet.module.css:52` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-shadow: var(--ov-primitive-shadow-sm);
  ```
- `packages/base-ui/src/components/sheet/Sheet.module.css:56` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-shadow: var(--ov-primitive-shadow-md);
  ```
- `packages/base-ui/src/components/sheet/Sheet.module.css:60` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-shadow: var(--ov-primitive-shadow-lg);
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:34` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-label-size: var(--ov-primitive-font-size-11);
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:35` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-value-size: var(--ov-primitive-font-size-11);
  ```
- `packages/base-ui/src/components/stack/Stack.module.css:4` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--_ov-spacing, var(--ov-primitive-space-2));
  ```
- `packages/base-ui/src/components/stack/Stack.module.css:18` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-0);
  ```
- `packages/base-ui/src/components/stack/Stack.module.css:21` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/stack/Stack.module.css:24` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/stack/Stack.module.css:27` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/stack/Stack.module.css:30` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:31` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:33` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:51` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:52` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:64` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:65` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:87` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:98` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:99` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:122` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:123` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:136` — Primitive token used directly — use a semantic token instead
  ```
  padding-inline: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.module.css:137` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/tag-input/TagInput.module.css:4` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-space-stack-xs, var(--ov-primitive-space-1));
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:7` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-timeline-gap: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:8` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-timeline-item-gap: var(--ov-primitive-space-3);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:22` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-timeline-gap: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:23` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-timeline-item-gap: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:32` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-timeline-gap: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:33` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-timeline-item-gap: var(--ov-primitive-space-4);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:173` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:185` — Primitive token used directly — use a semantic token instead
  ```
  border-radius: var(--ov-primitive-radius-sm);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:224` — Primitive token used directly — use a semantic token instead
  ```
  padding-top: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:229` — Primitive token used directly — use a semantic token instead
  ```
  padding-top: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:285` — Primitive token used directly — use a semantic token instead
  ```
  padding-block: var(--ov-primitive-space-2);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:56` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-surface-shadow: var(--ov-primitive-shadow-md);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:130` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-surface-shadow: var(--ov-primitive-shadow-sm);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:134` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-surface-shadow: var(--ov-primitive-shadow-md);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:138` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-surface-shadow: var(--ov-primitive-shadow-lg);
  ```
- `packages/base-ui/src/components/toolbar/Toolbar.module.css:28` — Primitive token used directly — use a semantic token instead
  ```
  gap: var(--ov-primitive-space-1);
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:124` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-font-size: var(--ov-primitive-font-size-11);
  ```

### High: Inline style (Convention)

**33 finding(s)**

- `packages/ai-ui/src/components/artifact/AIArtifact.tsx:166` — style={{}} found — use CSS Modules + data attributes
  ```
  <Tooltip.Trigger render={<span style={{ display: 'inline-flex' }} />}>
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.tsx:130` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ height: `${virtualizer.getTotalSize()}px` }}
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.tsx:138` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/ai-ui/src/components/content/AIImageGeneration.tsx:30` — style={{}} found — use CSS Modules + data attributes
  ```
  <div className={styles.Frame} style={{ aspectRatio }}>
  ```
- `packages/base-ui/src/components/aspect-ratio/AspectRatio.tsx:17` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ ...style, aspectRatio: ratio }}
  ```
- `packages/base-ui/src/components/command-list/CommandList.tsx:315` — style={{}} found — use CSS Modules + data attributes
  ```
  <div style={{ height: virtualizer.totalSize, position: 'relative' }}>
  ```
- `packages/base-ui/src/components/command-list/CommandList.tsx:332` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/data-table/DataTableBody.tsx:42` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/data-table/DataTableContainer.tsx:52` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ ...columnSizeVars } as CSSProperties}
  ```
- `packages/base-ui/src/components/data-table/DataTableFooter.tsx:27` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/data-table/DataTableHeader.tsx:33` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/data-table/DataTableLoading.tsx:23` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/data-table/DataTableVirtualBody.tsx:56` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/data-table/DataTableVirtualBody.tsx:80` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/data-table/DataTableVirtualBody.tsx:97` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/drawer/Drawer.tsx:250` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ cursor: isVertical ? 'row-resize' : 'col-resize' }}
  ```
- `packages/base-ui/src/components/drawer/Drawer.tsx:277` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ '--_ov-size': `${clampedDefaultSize}px`, ...style } as React.CSSProperties}
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabsViewport.tsx:61` — style={{}} found — use CSS Modules + data attributes
  ```
  <div className={styles.AttachDropIndicator} style={{ left: indicatorLeft }} />
  ```
- `packages/base-ui/src/components/editor-tabs/context/TabDragBroker.tsx:236` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/image/Image.tsx:94` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ width, height, ...style }}
  ```
- `packages/base-ui/src/components/meter/Meter.tsx:89` — style={{}} found — use CSS Modules + data attributes
  ```
  <div className={styles.Fill} style={{ width: `${percentage}%` }} />
  ```
- `packages/base-ui/src/components/row-list/RowList.tsx:107` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/row-list/RowList.tsx:148` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.tsx:61` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.tsx:80` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ width: cssWidth, height: cssHeight, ...style }}
  ```
- `packages/base-ui/src/components/text-area/TextArea.tsx:107` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ ...style, resize }}
  ```
- `packages/base-ui/src/components/tree-list/TreeList.tsx:307` — style={{}} found — use CSS Modules + data attributes
  ```
  <div style={{ height: virtualizer.totalSize, position: 'relative' }}>
  ```
- `packages/base-ui/src/components/tree-list/TreeList.tsx:318` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/editors/src/components/code-editor/CodeEditor.tsx:599` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ height, width }}
  ```
- `packages/editors/src/components/code-editor/CodeEditor.tsx:602` — style={{}} found — use CSS Modules + data attributes
  ```
  <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
  ```
- `packages/editors/src/components/diff-viewer/DiffViewer.tsx:121` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ height }}
  ```
- `packages/editors/src/components/diff-viewer/DiffViewer.tsx:124` — style={{}} found — use CSS Modules + data attributes
  ```
  <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
  ```
- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:186` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ paddingLeft: depth * 16 }}
  ```

### Medium: Hardcoded transition (Token/Styling)

**130 finding(s)**

- `packages/ai-ui/src/components/agent/AgentControls.module.css:34` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: pulse-dot 1.5s ease-in-out infinite;
  ```
- `packages/ai-ui/src/components/agent/AgentControls.module.css:87` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/agent/AgentControls.module.css:90` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/agent/AgentControls.module.css:95` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/agent/AgentControls.module.css:99` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:91` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/chat/ChatInput.module.css:74` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:50` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:55` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:32` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:37` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/content/AIMarkdown.module.css:36` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/content/AIMarkdown.module.css:41` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/content/AISources.module.css:74` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/content/AISources.module.css:79` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/reasoning/ChainOfThought.module.css:25` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: color 0.2s;
  ```
- `packages/ai-ui/src/components/reasoning/ChainOfThought.module.css:54` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: transform 0.2s ease;
  ```
- `packages/ai-ui/src/components/reasoning/ChainOfThought.module.css:230` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/reasoning/ChainOfThought.module.css:236` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:20` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: color 0.2s;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:42` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: brain-pulse 2s ease-in-out infinite;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:61` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: transform 0.2s ease;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:89` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:92` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:97` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:101` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/ai-ui/src/components/streaming/StreamingText.module.css:25` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/streaming/StreamingText.module.css:30` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/streaming/TypingIndicator.module.css:48` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/ai-ui/src/components/streaming/TypingIndicator.module.css:53` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/accordion/Accordion.module.css:201` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/accordion/Accordion.module.css:207` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:94` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/app-shell/AppShell.module.css:184` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/autocomplete/Autocomplete.module.css:22` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/autocomplete/Autocomplete.module.css:166` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/autocomplete/Autocomplete.module.css:232` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/badge/Badge.module.css:31` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/badge/Badge.module.css:164` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-badge-pulse 1.5s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/badge/Badge.module.css:168` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/badge/Badge.module.css:173` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/breadcrumbs/Breadcrumbs.module.css:81` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/button/Button.module.css:31` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/card/Card.module.css:174` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/card/Card.module.css:202` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/card/Card.module.css:207` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/card/Card.module.css:346` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: indicator-pulse 2s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/card/Card.module.css:361` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:164` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:195` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:175` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:40` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:69` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.module.css:102` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/collapsible/Collapsible.module.css:63` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/collapsible/Collapsible.module.css:72` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/collapsible/Collapsible.module.css:77` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/combobox/Combobox.module.css:22` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/combobox/Combobox.module.css:169` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/combobox/Combobox.module.css:265` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/command-list/CommandList.module.css:129` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/confirm-button/ConfirmButton.module.css:30` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/context-menu/ContextMenu.module.css:111` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:226` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: opacity 0.15s ease;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:322` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:333` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: transform 0.15s ease;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:491` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:23` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:46` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:126` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/dock-layout/DockLayout.module.css:80` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/dock-layout/DockLayout.module.css:140` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/drawer/Drawer.module.css:16` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/drawer/Drawer.module.css:172` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/drawer/Drawer.module.css:281` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:178` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:302` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:456` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/image/Image.module.css:67` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/input/Input.module.css:102` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/list/List.module.css:111` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/menu/Menu.module.css:110` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/menu/Menu.module.css:206` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/meter/Meter.module.css:85` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:38` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:298` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/number-input/NumberInput.module.css:100` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/number-input/NumberInput.module.css:157` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/pagination/Pagination.module.css:45` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/popover/Popover.module.css:40` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/popover/Popover.module.css:129` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/progress/Progress.module.css:96` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:136` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:165` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/resizable-split-pane/ResizableSplitPane.module.css:101` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:41` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:89` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/select/Select.module.css:30` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/select/Select.module.css:257` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:45` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:43` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-skeleton-pulse 1.5s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:71` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-skeleton-wave 1.6s linear infinite;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:86` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:90` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:104` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:113` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:169` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:194` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:59` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-spinner-fade 0.8s linear infinite;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:106` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/split-button/SplitButton.module.css:44` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:81` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-pulse 1.5s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:101` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:118` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/stepper/Stepper.module.css:98` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:34` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:146` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:111` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/tag-input/TagInput.module.css:18` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/text-area/TextArea.module.css:99` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/text-field/TextField.module.css:93` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:234` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:238` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:188` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-toast-pulse 2s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:381` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:387` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:32` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:110` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:132` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:270` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: spin 0.8s linear infinite;
  ```

### Medium: Hardcoded spacing (Token/Styling)

**85 finding(s)**

- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:22` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:23` — Raw spacing value — use --ov-space-* token
  ```
  padding: 8px 12px;
  ```
- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:63` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:64` — Raw spacing value — use --ov-space-* token
  ```
  padding: 4px 12px;
  ```
- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:79` — Raw spacing value — use --ov-space-* token
  ```
  padding: 12px;
  ```
- `packages/ai-ui/src/components/branching/AIBranch.module.css:9` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/ai-ui/src/components/chat/AIContextIndicator.module.css:5` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/ai-ui/src/components/chat/AIFollowUp.module.css:4` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/ai-ui/src/components/chat/AIFollowUp.module.css:5` — Raw spacing value — use --ov-space-* token
  ```
  padding: 4px 0;
  ```
- `packages/ai-ui/src/components/chat/AIMessageActions.module.css:4` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/ai-ui/src/components/streaming/TypingIndicator.module.css:15` — Raw spacing value — use --ov-space-* token
  ```
  gap: 3px;
  ```
- `packages/base-ui/src/components/accordion/Accordion.module.css:7` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-header-gap: 8px;
  ```
- `packages/base-ui/src/components/accordion/Accordion.module.css:24` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-header-gap: 6px;
  ```
- `packages/base-ui/src/components/accordion/Accordion.module.css:38` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-header-gap: 10px;
  ```
- `packages/base-ui/src/components/accordion/Accordion.module.css:137` — Raw spacing value — use --ov-space-* token
  ```
  padding: 0 6px;
  ```
- `packages/base-ui/src/components/action-list/ActionList.module.css:77` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/banner/Banner.module.css:133` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/card/Card.module.css:315` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/card/Card.module.css:510` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/checkbox-group/CheckboxGroup.module.css:14` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:225` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:4` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/command-list/CommandList.module.css:192` — Raw spacing value — use --ov-space-* token
  ```
  gap: 3px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:379` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:406` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:416` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:429` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:435` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:445` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:446` — Raw spacing value — use --ov-space-* token
  ```
  padding: 32px 16px;
  ```
- `packages/base-ui/src/components/description-list/DescriptionList.module.css:4` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-gap: 10px;
  ```
- `packages/base-ui/src/components/description-list/DescriptionList.module.css:5` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 4px;
  ```
- `packages/base-ui/src/components/description-list/DescriptionList.module.css:18` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-gap: 8px;
  ```
- `packages/base-ui/src/components/description-list/DescriptionList.module.css:19` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 2px;
  ```
- `packages/base-ui/src/components/description-list/DescriptionList.module.css:25` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-gap: 12px;
  ```
- `packages/base-ui/src/components/description-list/DescriptionList.module.css:26` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 6px;
  ```
- `packages/base-ui/src/components/description-list/DescriptionList.module.css:55` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/drawer/Drawer.module.css:132` — Raw spacing value — use --ov-space-* token
  ```
  padding: 6px 0;
  ```
- `packages/base-ui/src/components/drawer/Drawer.module.css:138` — Raw spacing value — use --ov-space-* token
  ```
  padding: 0 6px;
  ```
- `packages/base-ui/src/components/editable-list/EditableList.module.css:31` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:151` — Raw spacing value — use --ov-space-* token
  ```
  padding: 0 3px;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:162` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:215` — Raw spacing value — use --ov-space-* token
  ```
  padding: 0 8px;
  ```
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:2` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-padding: 32px;
  ```
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:3` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-gap: 8px;
  ```
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:19` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-padding: 20px;
  ```
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:20` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-gap: 6px;
  ```
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:27` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-padding: 48px;
  ```
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:28` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-gap: 12px;
  ```
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:67` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:32` — Raw spacing value — use --ov-space-* token
  ```
  padding: var(--_ov-control-padding-block) 4px var(--_ov-control-padding-block)
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:159` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-popup-padding: 4px;
  ```
- `packages/base-ui/src/components/nav-list/NavList.module.css:56` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/nav-list/NavList.module.css:97` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/radio-group/RadioGroup.module.css:14` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:184` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:5` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:6` — Raw spacing value — use --ov-space-* token
  ```
  padding: 2px;
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:65` — Raw spacing value — use --ov-space-* token
  ```
  margin: -1px;
  ```
- `packages/base-ui/src/components/select/Select.module.css:157` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-popup-padding: 4px;
  ```
- `packages/base-ui/src/components/select/Select.module.css:181` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-popup-padding: 3px;
  ```
- `packages/base-ui/src/components/select/Select.module.css:191` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-popup-padding: 5px;
  ```
- `packages/base-ui/src/components/select/Select.module.css:240` — Raw spacing value — use --ov-space-* token
  ```
  margin: 2px 0;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:98` — Raw spacing value — use --ov-space-* token
  ```
  gap: 0.5em;
  ```
- `packages/base-ui/src/components/stat-row/StatRow.module.css:9` — Raw spacing value — use --ov-space-* token
  ```
  gap: var(--_ov-stat-gap, 8px);
  ```
- `packages/base-ui/src/components/stat-row/StatRow.module.css:17` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-stat-gap: 6px;
  ```
- `packages/base-ui/src/components/stat-row/StatRow.module.css:23` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-stat-gap: 8px;
  ```
- `packages/base-ui/src/components/stat-row/StatRow.module.css:29` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-stat-gap: 10px;
  ```
- `packages/base-ui/src/components/stat-row/StatRow.module.css:39` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:22` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:31` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:38` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:183` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:90` — Raw spacing value — use --ov-space-* token
  ```
  padding: 2px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:10` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:12` — Raw spacing value — use --ov-space-* token
  ```
  padding: 16px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:60` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:63` — Raw spacing value — use --ov-space-* token
  ```
  padding: 12px 16px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:150` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:12` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 4px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:36` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 3px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:43` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 6px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:52` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 3px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:59` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 6px;
  ```
- `packages/editors/src/components/object-inspector/ObjectInspector.module.css:66` — Raw spacing value — use --ov-space-* token
  ```
  padding: 1px 0;
  ```

### Medium: Hardcoded radius (Token/Styling)

**19 finding(s)**

- `packages/base-ui/src/components/accordion/Accordion.module.css:138` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 10px;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:23` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/avatar/Avatar.module.css:188` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/basic-list/BasicList.module.css:26` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 10px;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:152` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:435` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 1px;
  ```
- `packages/base-ui/src/components/popover/Popover.module.css:178` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 2px;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:133` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:178` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:57` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:99` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:165` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:180` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:188` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:56` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:28` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:140` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:134` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 999px;
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:163` — Raw border-radius — use --ov-radius-* token
  ```
  border-radius: 2px;
  ```

### Medium: Hardcoded box-shadow (Token/Styling)

**23 finding(s)**

- `packages/base-ui/src/components/badge/Badge.module.css:152` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 0 var(--_ov-pulse-color);
  ```
- `packages/base-ui/src/components/badge/Badge.module.css:155` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 4px transparent;
  ```
- `packages/base-ui/src/components/badge/Badge.module.css:158` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 0 transparent;
  ```
- `packages/base-ui/src/components/card/Card.module.css:31` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: none;
  ```
- `packages/base-ui/src/components/card/Card.module.css:352` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--_ov-indicator-color) 40%, transparent 60%);
  ```
- `packages/base-ui/src/components/card/Card.module.css:355` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--_ov-indicator-color) 0%, transparent 100%);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:396` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:412` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.3);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:424` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: inset 0 0 0 1px var(--_ov-tab-active-border);
  ```
- `packages/base-ui/src/components/input/Input.module.css:118` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```
- `packages/base-ui/src/components/number-input/NumberInput.module.css:112` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```
- `packages/base-ui/src/components/sheet/Sheet.module.css:15` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: var(--_ov-shadow);
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:166` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: inset 0 0 0 1px var(--_ov-track-border);
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:191` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow:
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:208` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow:
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:3` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 0 var(--_ov-pulse-color);
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:6` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 var(--_ov-pulse-spread) transparent;
  ```
- `packages/base-ui/src/components/status-dot/StatusDot.module.css:9` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 0 transparent;
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:142` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow:
  ```
- `packages/base-ui/src/components/text-area/TextArea.module.css:115` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```
- `packages/base-ui/src/components/text-field/TextField.module.css:109` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:68` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: var(--_ov-surface-shadow);
  ```
- `packages/base-ui/src/components/toggle-button/ToggleButton.module.css:7` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--_ov-accent-border) 64%, transparent 36%);
  ```

### Medium: Missing theme coverage (Token/Styling)

**397 finding(s)**

- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-sans missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-mono missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-size-caption missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-size-body missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-size-title missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-weight-body missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-weight-label missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-weight-title missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-inline-control missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-stack-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-stack-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-stack-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-control missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-surface missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-surface missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-duration-interactive missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-duration-panel missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-ease-standard missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-list-row-height missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-panel-padding missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-title-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-title-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-title-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-body-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-body-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-body-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-description-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-description-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-description-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-eyebrow-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-eyebrow-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-eyebrow-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-group-gap missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-group-gap missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-text-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-text-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-text-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-caption-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-caption-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-caption-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-overline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-overline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-overline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-overline-letter-spacing missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-1 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-2 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-3 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-4 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-5 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-6 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-inline-code-padding-inline missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-inline-code-padding-block missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-inline-code-radius missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-padding-inline missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-padding-block missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-radius missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-min-height missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-radius-rounded missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-radius missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-gap missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-radius missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-label-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-label-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-label-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-min-block-size missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-gap missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-radius missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-header-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-header-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-header-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-caption-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-caption-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-caption-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-resize-handle-width missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-expand-indent missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-nested-inset missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-xl missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-gutter missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-image-list-gap missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-title-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-title-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-title-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-body-font-size-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-body-font-size-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-body-font-size-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-radius missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-progress-track missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-progress-fill missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-scrollarea-thumb missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-scrollarea-thumb-hover missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-scrollarea-track missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-sm missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-md missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-lg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-drawer-handle-thickness missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-drawer-handle-length missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-drawer-handle missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-drawer-handle-hover missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-bg-base missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-bg-surface missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-bg-surface-raised missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-bg-surface-overlay missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-bg-inset missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-bg-elevated missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-fg-default missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-fg-muted missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-fg-subtle missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-fg-disabled missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-fg-inverse missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-border-default missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-border-muted missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-border-strong missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-border-focus missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-brand-500 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-brand-400 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-brand-300 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-accent-soft missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-accent-strong missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-success missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-success-soft missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-warning missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-warning-soft missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-danger missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-danger-soft missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-info missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-info-soft missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-state-hover missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-state-pressed missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-state-selected missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-state-focus-ring missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-fg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-active-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-active-fg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-active-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-inactive-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-inactive-fg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-hover-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-hover-fg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-modified-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-header-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-drop-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-tab-height missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-fg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-cursor missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-selection-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-selection-inactive-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-highlight-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-highlight-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-number missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-number-active missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-whitespace missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-indent-guide missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-indent-guide-active missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-ruler missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-match-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-match-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-range-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-link missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-match-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-match-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-1 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-2 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-3 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-4 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-5 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-6 missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-added missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-modified missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-deleted missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-diff-insert-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-diff-remove-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-selection missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-error missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-warning missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-find-match missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-terminal-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-terminal-fg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-terminal-cursor missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-terminal-selection-bg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-terminal-selection-fg missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-terminal-border missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-black missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-red missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-green missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-yellow missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-blue missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-magenta missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-cyan missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-white missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-black missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-red missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-green missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-yellow missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-blue missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-magenta missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-cyan missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-white missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-comment missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-string missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-string-escape missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-number missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-keyword missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-keyword-control missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-keyword-operator missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-type missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-class missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-interface missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-function missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-method missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-variable missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-parameter missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-property missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-namespace missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-decorator missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-regexp missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-operator missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-punctuation missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-comment missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-keyword missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-function missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-type missing from mode(s): light, high-contrast-dark, high-contrast-light

### Medium: Missing IDE alias (Token/Styling)

**91 finding(s)**

- `packages/ai-ui/src/components/chat/AIAttachment.module.css:23` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/ai-ui/src/components/chat/AIAttachment.module.css:36` — Component in "chat" uses --ov-color-fg-subtle — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-subtle);
  ```
- `packages/ai-ui/src/components/chat/AIMessageEditor.module.css:19` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/ai-ui/src/components/chat/AIMessageEditor.module.css:26` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:17` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:21` — Component in "chat" uses --ov-color-bg-surface — consider IDE alias (--ov-color-chat-*)
  ```
  background: var(--ov-color-brand-soft-bg, var(--ov-color-bg-surface));
  ```
- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:22` — Component in "chat" uses --ov-color-fg-brand — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-brand-soft-fg, var(--ov-color-fg-brand));
  ```
- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:26` — Component in "chat" uses --ov-color-bg-inset — consider IDE alias (--ov-color-chat-*)
  ```
  background: var(--ov-color-bg-inset);
  ```
- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:27` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:33` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:50` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:67` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/ai-ui/src/components/chat/ChatInput.module.css:10` — Component in "chat" uses --ov-color-border-default — consider IDE alias (--ov-color-chat-*)
  ```
  border: 1px solid var(--ov-color-border-default);
  ```
- `packages/ai-ui/src/components/chat/ChatInput.module.css:12` — Component in "chat" uses --ov-color-bg-surface — consider IDE alias (--ov-color-chat-*)
  ```
  background: var(--ov-color-bg-surface);
  ```
- `packages/ai-ui/src/components/chat/ChatInput.module.css:36` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/ai-ui/src/components/chat/ChatInput.module.css:44` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:33` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:34` — Component in "chat" uses --ov-color-border-default — consider IDE alias (--ov-color-chat-*)
  ```
  border: 1px solid var(--ov-color-border-default);
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:45` — Component in "chat" uses --ov-color-bg-surface — consider IDE alias (--ov-color-chat-*)
  ```
  background: var(--ov-color-bg-surface-overlay, var(--ov-color-bg-surface));
  ```
- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:13` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:14` — Component in "chat" uses --ov-color-border-default — consider IDE alias (--ov-color-chat-*)
  ```
  border: 1px solid var(--ov-color-border-default);
  ```
- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:26` — Component in "chat" uses --ov-color-border-focus — consider IDE alias (--ov-color-chat-*)
  ```
  outline: 2px solid var(--ov-color-border-focus);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:10` — Component in "data-table" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-bg: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:16` — Component in "data-table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-border: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:17` — Component in "data-table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-divider: color-mix(in srgb, var(--ov-color-border-default) 80%, transparent 20%);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:21` — Component in "data-table" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-resize-handle: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:23` — Component in "data-table" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-sort-indicator: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:25` — Component in "data-table" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-pinned-bg: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:39` — Component in "data-table" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:66` — Component in "data-table" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-accent: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:93` — Component in "data-table" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-bg: color-mix(in srgb, var(--ov-color-bg-surface) 86%, var(--_ov-accent-soft) 14%);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:100` — Component in "data-table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-border: color-mix(in srgb, var(--ov-color-border-default) 54%, var(--_ov-accent) 46%);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:104` — Component in "data-table" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-bg: color-mix(in srgb, var(--ov-color-bg-surface) 92%, var(--_ov-accent-soft) 8%);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:111` — Component in "data-table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-dt-border: color-mix(in srgb, var(--ov-color-border-default) 74%, var(--_ov-accent) 26%);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:172` — Component in "data-table" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:195` — Component in "data-table" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:319` — Component in "data-table" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:328` — Component in "data-table" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:422` — Component in "data-table" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:447` — Component in "data-table" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:453` — Component in "data-table" uses --ov-color-fg-subtle — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-subtle);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:459` — Component in "data-table" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:538` — Component in "data-table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  border-bottom-color: color-mix(in srgb, var(--ov-color-border-default) 50%, transparent 50%);
  ```
- `packages/base-ui/src/components/editable-list/EditableList.module.css:42` — Component in "editable-list" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  border: 1px solid var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editable-list/EditableList.module.css:44` — Component in "editable-list" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  background: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/editable-list/EditableList.module.css:45` — Component in "editable-list" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/editable-list/EditableList.module.css:68` — Component in "editable-list" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  border: 1px solid var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editable-list/EditableList.module.css:71` — Component in "editable-list" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:12` — Component in "editor-tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-divider: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:12` — Component in "editor-tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-tab-divider: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:36` — Component in "editor-tabs" uses --ov-color-bg-surface — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-active-bg: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:36` — Component in "editor-tabs" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-tab-active-bg: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:58` — Component in "editor-tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-divider: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:58` — Component in "editor-tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-tab-divider: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:61` — Component in "editor-tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-editor-*)
  ```
  border-bottom-color: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:61` — Component in "editor-tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  border-bottom-color: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:79` — Component in "editor-tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-active-border: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:79` — Component in "editor-tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-tab-active-border: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:42` — Component in "selectable-list" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  border: 1px solid var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:64` — Component in "selectable-list" uses --ov-color-fg-inverse — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-inverse);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:71` — Component in "selectable-list" uses --ov-color-fg-inverse — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-inverse);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:76` — Component in "selectable-list" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  border-color: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:115` — Component in "selectable-list" uses --ov-color-border-muted — consider IDE alias (--ov-color-tab-*)
  ```
  border-bottom: 1px solid var(--ov-color-border-muted);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:119` — Component in "selectable-list" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  border-color: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:130` — Component in "selectable-list" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:139` — Component in "selectable-list" uses --ov-color-fg-subtle — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-subtle);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:142` — Component in "selectable-list" uses --ov-color-border-muted — consider IDE alias (--ov-color-tab-*)
  ```
  border-top: 1px solid var(--ov-color-border-muted);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:156` — Component in "selectable-list" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:167` — Component in "selectable-list" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  border-color: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/table/Table.module.css:10` — Component in "table" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-table-bg: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/table/Table.module.css:16` — Component in "table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-table-border: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/table/Table.module.css:17` — Component in "table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-table-divider: color-mix(in srgb, var(--ov-color-border-default) 80%, transparent 20%);
  ```
- `packages/base-ui/src/components/table/Table.module.css:33` — Component in "table" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/table/Table.module.css:59` — Component in "table" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-accent: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/table/Table.module.css:84` — Component in "table" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-table-bg: color-mix(in srgb, var(--ov-color-bg-surface) 86%, var(--_ov-accent-soft) 14%);
  ```
- `packages/base-ui/src/components/table/Table.module.css:90` — Component in "table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-table-border: color-mix(in srgb, var(--ov-color-border-default) 54%, var(--_ov-accent) 46%);
  ```
- `packages/base-ui/src/components/table/Table.module.css:94` — Component in "table" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-table-bg: color-mix(in srgb, var(--ov-color-bg-surface) 92%, var(--_ov-accent-soft) 8%);
  ```
- `packages/base-ui/src/components/table/Table.module.css:100` — Component in "table" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-table-border: color-mix(in srgb, var(--ov-color-border-default) 74%, var(--_ov-accent) 26%);
  ```
- `packages/base-ui/src/components/table/Table.module.css:194` — Component in "table" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/table/Table.module.css:224` — Component in "table" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/table/Table.module.css:228` — Component in "table" uses --ov-color-fg-subtle — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-subtle);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:5` — Component in "tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-list-border: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:6` — Component in "tabs" uses --ov-color-fg-muted — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-tab-fg: var(--ov-color-fg-muted);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:7` — Component in "tabs" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-tab-fg-active: var(--ov-color-fg-default);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:28` — Component in "tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-indicator: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:54` — Component in "tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  --_ov-list-border: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:71` — Component in "tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-tab-*)
  ```
  var(--ov-color-border-default) 30%
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:139` — Component in "tabs" uses --ov-color-border-muted — consider IDE alias (--ov-color-tab-*)
  ```
  border: 1px solid var(--ov-color-border-muted);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:141` — Component in "tabs" uses --ov-color-bg-surface — consider IDE alias (--ov-color-tab-*)
  ```
  background: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:142` — Component in "tabs" uses --ov-color-fg-default — consider IDE alias (--ov-color-tab-*)
  ```
  color: var(--ov-color-fg-default);
  ```
- `packages/editors/src/components/code-editor/CodeEditor.module.css:15` — Component in "code-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)
  ```
  color: var(--ov-color-fg-muted);
  ```

### Medium: Inline object prop (Performance)

**24 finding(s)**

- `packages/ai-ui/src/components/branching/AIBranch.tsx:46` — Object literal as prop — creates new reference each render
  ```
  <BranchContext.Provider value={{ count, active, onChange }}>
  ```
- `packages/base-ui/src/components/accordion/Accordion.tsx:200` — Object literal as prop — creates new reference each render
  ```
  <AccordionContext.Provider value={{ expandedIds, toggle, registerDefault, size }}>
  ```
- `packages/base-ui/src/components/action-list/ActionList.tsx:51` — Object literal as prop — creates new reference each render
  ```
  <ActionListContext.Provider value={{ color, size, itemVariant }}>
  ```
- `packages/base-ui/src/components/app-shell/AppShell.tsx:167` — Object literal as prop — creates new reference each render
  ```
  <AppShellContext.Provider value={{ sidebarCollapsed, secondarySidebarCollapsed }}>
  ```
- `packages/base-ui/src/components/avatar-group/AvatarGroup.tsx:74` — Object literal as prop — creates new reference each render
  ```
  <AvatarGroupContext.Provider value={{ variant, color, size, shape, deterministic }}>
  ```
- `packages/base-ui/src/components/avatar/Avatar.tsx:92` — Object literal as prop — creates new reference each render
  ```
  value={{ variant, color, size, shape, deterministic, paletteIndex }}
  ```
- `packages/base-ui/src/components/button-group/ButtonGroup.tsx:42` — Object literal as prop — creates new reference each render
  ```
  <ButtonGroupContext.Provider value={{ variant, color, size }}>
  ```
- `packages/base-ui/src/components/checkbox-group/CheckboxGroup.tsx:40` — Object literal as prop — creates new reference each render
  ```
  <CheckboxGroupContext.Provider value={{ variant, color, size }}>
  ```
- `packages/base-ui/src/components/chip/Chip.tsx:126` — Object literal as prop — creates new reference each render
  ```
  <ChipContext.Provider value={{ variant, color, size, mono, clickable }}>
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.tsx:110` — Object literal as prop — creates new reference each render
  ```
  codeTagProps={{ className: styles.Code }}
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.tsx:112` — Object literal as prop — creates new reference each render
  ```
  customStyle={{
  ```
- `packages/base-ui/src/components/dialog/Dialog.tsx:71` — Object literal as prop — creates new reference each render
  ```
  <DialogContext.Provider value={{ onClose, titleId }}>
  ```
- `packages/base-ui/src/components/filter-bar/FilterBar.tsx:39` — Object literal as prop — creates new reference each render
  ```
  <FilterBarContext.Provider value={{ size }}>
  ```
- `packages/base-ui/src/components/nav-list/NavList.tsx:100` — Object literal as prop — creates new reference each render
  ```
  <NavListGroupToggleContext.Provider value={{ expanded, toggle }}>
  ```
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:39` — Object literal as prop — creates new reference each render
  ```
  <RadioGroupContext.Provider value={{ variant, color, size }}>
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.tsx:78` — Object literal as prop — creates new reference each render
  ```
  <SegmentedControlContext.Provider value={{ value, onSelect, name, size, disabled }}>
  ```
- `packages/base-ui/src/components/select/Select.tsx:112` — Object literal as prop — creates new reference each render
  ```
  <SelectStyleContext.Provider value={{ ...resolved, showSelectionIndicator }}>
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.tsx:51` — Object literal as prop — creates new reference each render
  ```
  <SelectableListContext.Provider value={{ checkBehavior: resolved }}>
  ```
- `packages/base-ui/src/components/split-button/SplitButton.tsx:55` — Object literal as prop — creates new reference each render
  ```
  <SplitButtonContext.Provider value={{ variant, color, size, disabled }}>
  ```
- `packages/base-ui/src/components/status-bar/StatusBar.tsx:38` — Object literal as prop — creates new reference each render
  ```
  <StatusBarContext.Provider value={{ size }}>
  ```
- `packages/base-ui/src/components/stepper/Stepper.tsx:101` — Object literal as prop — creates new reference each render
  ```
  <StepperContext.Provider value={{ activeStep, orientation }}>
  ```
- `packages/base-ui/src/components/timeline/Timeline.tsx:40` — Object literal as prop — creates new reference each render
  ```
  <TimelineContext.Provider value={{ size }}>
  ```
- `packages/base-ui/src/components/toggle-button-group/ToggleButtonGroup.tsx:37` — Object literal as prop — creates new reference each render
  ```
  <ToggleButtonGroupContext.Provider value={{ variant, color, size }}>
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.tsx:94` — Object literal as prop — creates new reference each render
  ```
  <TooltipStyleContext.Provider value={{ ...resolved, lazy, hasOpened }}>
  ```

### Medium: Inline array prop (Performance)

**3 finding(s)**

- `packages/ai-ui/src/components/content/AIMarkdown.tsx:188` — Array literal as prop — creates new reference each render
  ```
  remarkPlugins={[remarkGfm]}
  ```
- `packages/base-ui/src/theme/ThemeSwitcher.tsx:16` — Array literal as prop — creates new reference each render
  ```
  <div className={[styles.Root, className].filter(Boolean).join(' ')}>
  ```
- `packages/editors/src/components/markdown-preview/MarkdownPreview.tsx:191` — Array literal as prop — creates new reference each render
  ```
  remarkPlugins={[remarkGfm]}
  ```

### Medium: Inline function prop (Performance)

**1 finding(s)**

- `packages/ai-ui/src/components/content/AISources.tsx:29` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  <List.Item key={source.id} itemKey={source.id} onClick={() => onNavigate?.(source)}>
  ```

### Medium: Missing memo (Performance)

**16 finding(s)**

- `packages/ai-ui/src/components/reasoning/BrainIcon.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/command-list/context/CommandListContext.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/editor-tabs/DetachGhostTab.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/list/context/ListContext.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeContext.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Caption.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Code.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Em.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Hotkey.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Overline.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Quote.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Strong.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Typography.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Underline.tsx:1` — Exported leaf component without React.memo — consider wrapping
- `packages/base-ui/src/theme/ThemeSwitcher.tsx:1` — Exported leaf component without React.memo — consider wrapping

### Low: Hardcoded opacity (Token/Styling)

**114 finding(s)**

- `packages/ai-ui/src/components/agent/AgentControls.module.css:81` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  0%, 100% { opacity: 1; }
  ```
- `packages/ai-ui/src/components/agent/AgentControls.module.css:82` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  50% { opacity: 0.5; }
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:68` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:73` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:80` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:85` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:42` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:47` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/ai-ui/src/components/content/AIMarkdown.module.css:30` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:46` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  0%, 100% { opacity: 0.6; }
  ```
- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:47` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  50% { opacity: 1; }
  ```
- `packages/ai-ui/src/components/streaming/StreamingText.module.css:19` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/accordion/Accordion.module.css:68` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/badge/Badge.module.css:145` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/banner/Banner.module.css:164` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.65;
  ```
- `packages/base-ui/src/components/banner/Banner.module.css:170` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/button/Button.module.css:52` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/card/Card.module.css:196` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:150` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:193` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:201` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/chip/Chip.module.css:201` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:39` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:48` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:59` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:64` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.module.css:100` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.module.css:111` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/collapsible/Collapsible.module.css:25` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/confirm-button/ConfirmButton.module.css:51` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/context-menu/ContextMenu.module.css:140` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:224` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:231` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:497` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.4;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:500` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.8;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:149` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:152` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:158` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:162` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/drawer/Drawer.module.css:276` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/drawer/Drawer.module.css:285` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:204` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:237` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:300` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:309` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:315` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:322` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:345` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:351` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:370` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:376` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:411` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.85;
  ```
- `packages/base-ui/src/components/image/Image.module.css:57` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/image/Image.module.css:61` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/input/Input.module.css:122` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/list/List.module.css:201` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/list/List.module.css:208` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/menu/Menu.module.css:139` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:143` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.9;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:317` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:322` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:334` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/number-input/NumberInput.module.css:120` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/pagination/Pagination.module.css:77` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/popover/Popover.module.css:136` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/progress/Progress.module.css:98` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.4;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:123` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:163` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:171` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:27` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:56` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/select/Select.module.css:92` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/select/Select.module.css:276` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/select/Select.module.css:292` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/select/Select.module.css:303` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:48` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:51` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.4;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:54` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:107` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.52;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:58` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.15;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:97` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:100` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.15;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:107` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.4;
  ```
- `packages/base-ui/src/components/split-button/SplitButton.module.css:14` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/split-button/SplitButton.module.css:70` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/stepper/Stepper.module.css:46` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.48;
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:133` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/tag-input/TagInput.module.css:39` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/text-area/TextArea.module.css:123` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/text-field/TextField.module.css:118` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:180` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:183` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.6;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:211` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.8;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:236` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:242` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:256` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:260` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:272` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:276` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:294` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:298` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:305` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:309` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:333` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:337` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:344` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:348` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:355` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:359` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:366` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:370` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:117` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:382` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:389` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```

### Low: Hardcoded font-size (Token/Styling)

**17 finding(s)**

- `packages/ai-ui/src/components/agent/AgentStatusItem.module.css:12` — Raw font-size — use --ov-font-* token
  ```
  font-size: 12px;
  ```
- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:36` — Raw font-size — use --ov-font-* token
  ```
  font-size: 0.875rem;
  ```
- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:47` — Raw font-size — use --ov-font-* token
  ```
  font-size: 0.75rem;
  ```
- `packages/ai-ui/src/components/branching/AIBranch.module.css:17` — Raw font-size — use --ov-font-* token
  ```
  font-size: 0.75rem;
  ```
- `packages/ai-ui/src/components/content/AICodeBlock.module.css:55` — Raw font-size — use --ov-font-* token
  ```
  font-size: 14px;
  ```
- `packages/ai-ui/src/components/content/AIInlineCitation.module.css:3` — Raw font-size — use --ov-font-* token
  ```
  font-size: 0.75em;
  ```
- `packages/ai-ui/src/components/content/AIMarkdown.module.css:97` — Raw font-size — use --ov-font-* token
  ```
  font-size: 0.9em;
  ```
- `packages/ai-ui/src/components/content/AISources.module.css:52` — Raw font-size — use --ov-font-* token
  ```
  font-size: 10px;
  ```
- `packages/ai-ui/src/components/tool-calls/ToolCall.module.css:33` — Raw font-size — use --ov-font-* token
  ```
  font-size: 12px;
  ```
- `packages/base-ui/src/components/basic-list/BasicList.module.css:45` — Raw font-size — use --ov-font-* token
  ```
  font-size: 1.15em;
  ```
- `packages/base-ui/src/components/breadcrumbs/Breadcrumbs.module.css:65` — Raw font-size — use --ov-font-* token
  ```
  font-size: 0.85em;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:205` — Raw font-size — use --ov-font-* token
  ```
  font-size: 10px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:452` — Raw font-size — use --ov-font-* token
  ```
  font-size: 32px;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:85` — Raw font-size — use --ov-font-* token
  ```
  font-size: 1.25em;
  ```
- `packages/base-ui/src/components/select/Select.module.css:297` — Raw font-size — use --ov-font-* token
  ```
  font-size: calc(var(--_ov-decorator-size) - 2px);
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:340` — Raw font-size — use --ov-font-* token
  ```
  font-size: 10px;
  ```
- `packages/editors/src/components/object-inspector/ObjectInspector.module.css:86` — Raw font-size — use --ov-font-* token
  ```
  font-size: 10px;
  ```

### Low: Hardcoded z-index (Token/Styling)

**32 finding(s)**

- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:17` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:4` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1000;
  ```
- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:18` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1001;
  ```
- `packages/base-ui/src/components/autocomplete/Autocomplete.module.css:80` — Raw z-index — use --ov-z-* token
  ```
  z-index: 120;
  ```
- `packages/base-ui/src/components/card/Card.module.css:214` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/card/Card.module.css:398` — Raw z-index — use --ov-z-* token
  ```
  z-index: 0;
  ```
- `packages/base-ui/src/components/combobox/Combobox.module.css:80` — Raw z-index — use --ov-z-* token
  ```
  z-index: 120;
  ```
- `packages/base-ui/src/components/context-menu/ContextMenu.module.css:8` — Raw z-index — use --ov-z-* token
  ```
  z-index: 120;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:156` — Raw z-index — use --ov-z-* token
  ```
  z-index: 2;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:511` — Raw z-index — use --ov-z-* token
  ```
  z-index: 3;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:6` — Raw z-index — use --ov-z-* token
  ```
  z-index: 9000;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:31` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/dock-layout/DockLayout.module.css:54` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:372` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:395` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:437` — Raw z-index — use --ov-z-* token
  ```
  z-index: 2;
  ```
- `packages/base-ui/src/components/menu/Menu.module.css:9` — Raw z-index — use --ov-z-* token
  ```
  z-index: 120;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:151` — Raw z-index — use --ov-z-* token
  ```
  z-index: 120;
  ```
- `packages/base-ui/src/components/popover/Popover.module.css:2` — Raw z-index — use --ov-z-* token
  ```
  z-index: 150;
  ```
- `packages/base-ui/src/components/popover/Popover.module.css:13` — Raw z-index — use --ov-z-* token
  ```
  z-index: 151;
  ```
- `packages/base-ui/src/components/resizable-split-pane/ResizableSplitPane.module.css:65` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/row-list/RowList.module.css:16` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/select/Select.module.css:149` — Raw z-index — use --ov-z-* token
  ```
  z-index: 120;
  ```
- `packages/base-ui/src/components/select/Select.module.css:330` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/select/Select.module.css:336` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/split-button/SplitButton.module.css:55` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/table/Table.module.css:121` — Raw z-index — use --ov-z-* token
  ```
  z-index: 0;
  ```
- `packages/base-ui/src/components/table/Table.module.css:128` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:98` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:7` — Raw z-index — use --ov-z-* token
  ```
  z-index: 9999;
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:2` — Raw z-index — use --ov-z-* token
  ```
  z-index: 140;
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:6` — Raw z-index — use --ov-z-* token
  ```
  z-index: 140;
  ```

### Low: Large component file (Convention)

**19 finding(s)**

- `packages/ai-ui/src/components/reasoning/ChainOfThought.tsx:1` — File has 412 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/card/Card.tsx:1` — File has 353 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/combobox/Combobox.tsx:1` — File has 379 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/command-list/CommandList.tsx:1` — File has 725 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/context-menu/ContextMenu.tsx:1` — File has 391 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/dock-layout/DockLayout.tsx:1` — File has 510 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/drawer/Drawer.tsx:1` — File has 305 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/editable-list/EditableList.tsx:1` — File has 689 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/editor-tabs/EditorTabs.tsx:1` — File has 381 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/list/List.tsx:1` — File has 385 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/menu/Menu.tsx:1` — File has 382 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:1` — File has 395 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/select/Select.tsx:1` — File has 431 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/selectable-list/SelectableList.tsx:1` — File has 477 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/toast/Toast.tsx:1` — File has 326 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/tree-list/TreeList.tsx:1` — File has 705 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/code-editor/CodeEditor.tsx:1` — File has 609 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:1` — File has 421 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/terminal/Terminal.tsx:1` — File has 771 lines (threshold: 300) — consider splitting

---

## Triage Notes

### False Positives & Adjustments

1. **Avatar hardcoded colors (24 findings):** These are intentional per-initial color palettes (e.g., green for "A", blue for "B"). The avatar component uses a deterministic color mapping system. **Exclude from High severity fixes** — these should be moved to a token family (`--ov-color-avatar-*`) as a separate design task, not a bug fix.

2. **Missing theme coverage (397 findings):** All 397 are the same pattern — tokens defined in `:root` (dark) but missing from `light`, `high-contrast-dark`, and `high-contrast-light` modes. This is a **systemic theme authoring gap**, not a per-component issue. Should be addressed as a theme-level task.

3. **Inline styles — many are legitimate:** Several inline styles are necessary for dynamic values:
   - Virtualization heights (`DataTableVirtualBody`, `TreeList`, `RowList`) — required by `@tanstack/react-virtual`
   - Dynamic dimensions (`AspectRatio`, `Meter`, `Skeleton`) — CSS variable pass-through recommended but not a bug
   - Cursor styles (`Drawer` resize handle) — state-dependent
   - **Recommendation:** Convert static inline styles to CSS Modules; for dynamic ones, use CSS variable pass-through pattern (`style={{ '--_var': value }}`)

4. **Hardcoded opacity (114 findings):** Many are legitimate CSS values (`opacity: 0`, `opacity: 1`) for transitions/animations. Only flag opacity values between 0 and 1 exclusive that could use tokens.

5. **CSS class naming (kebab-case):** Some kebab-case class names are from CSS pseudo-selectors and selector combinators, not actual class definitions. Scanner may overcount.

### Systemic Patterns

| Pattern | Count | Type |
|---------|-------|------|
| Theme gaps (dark-only tokens) | 397 | Systemic — needs theme authoring sprint |
| Primitive token leakage | 99 | Systemic — concentrated in 26 files, mostly base-ui |
| Hardcoded transitions | 130 | Systemic — most components lack motion token adoption |
| Hardcoded spacing | 85 | Systemic — varies from intentional 1px borders to large gaps |
| Missing IDE alias | 91 | Low impact — only relevant for IDE-surface components |

### Top 10 Worst Offending Components (by finding density)

1. **DataTable** (43 findings) — spacing, transitions, primitive tokens
2. **EditorTabs** (42 findings) — transitions, primitive tokens, colors
3. **Toast** (35 findings) — transitions, colors, primitive tokens
4. **Avatar** (26 findings) — hardcoded color palette (see false positive note)
5. **Card** (16 findings) — spacing, primitive tokens
6. **Grid** (16 findings) — primitive tokens (16 uses)
7. **Timeline** (14 findings) — primitive tokens, transitions
8. **Select** (14 findings) — spacing, transitions
9. **SelectableList** (14 findings) — transitions, spacing
10. **Table** (14 findings) — spacing, transitions

---

## Manual Review Notes

### Performance Review of Complex Components

Manual deep-dive of 12 key components across all 3 packages.

#### Critical Issues

**1. CommandList — Meta Object Allocation in Render Loop** [CRITICAL]
- `packages/base-ui/src/components/command-list/CommandList.tsx` (lines 319-326, 378-385)
- New `CommandItemMeta` objects created on every render in map functions
- Triggers unnecessary `renderItem` invocations for large lists
- **Fix:** Memoize meta computation or move to store layer

#### Important Issues

**2. CommandList — Mouse Move Handler Closure Churn** [IMPORTANT]
- Lines 435-439: `handleMouseMove` depends on reactive `itemState.isActive`
- Creates new closures during rapid navigation
- **Fix:** Memoize `store.setActiveKey` invocation separately

**3. DataTable — Non-Virtualized Row Rendering** [IMPORTANT]
- `DataTableBody.tsx` (lines 21-65): Rows rendered inline without memoization
- All cells recalculate pinning/sizing styles on parent re-renders
- **Fix:** Extract to memoized Row component (pattern exists in DataTableVirtualBody)

**4. DataTable — Confusing 'use no memo' Directive** [IMPORTANT]
- `MemoizedRow.tsx` (line 1): Declares `'use no memo'` but component IS memoized
- **Fix:** Remove directive or add clarifying comment

#### Minor Issues

- **CodeEditor:** 11 separate useEffect hooks — cognitive burden, consider grouping
- **DiffViewer:** Language prop not memoized — document requirement for consumers
- **ToolCall:** Re-renders on status changes even when visibility unchanged

#### Components with Excellent Performance

- **TreeList:** Three-context split, useSyncExternalStore, flat node caching — exemplary
- **Terminal:** Callback refs, debouncing, comprehensive cleanup — excellent
- **ChatMessageList:** Virtualized with sophisticated auto-scroll — excellent
- **StreamingText:** Direct DOM updates during streaming — efficient
- **ChatInput, TypingIndicator, ToolCallList:** Appropriately simple, no issues
