# UI Audit Findings Report

**Date:** 2026-11-05
**Total findings:** 1302
**High:** 0 | **Medium:** 1089 | **Low:** 213

---

## Summary by Check

| Severity | Category      | Check                    | Count |
| -------- | ------------- | ------------------------ | ----- |
| Medium   | Token/Styling | Hardcoded transition     | 13    |
| Medium   | Token/Styling | Hardcoded spacing        | 220   |
| Medium   | Token/Styling | Hardcoded box-shadow     | 31    |
| Medium   | Token/Styling | Hardcoded radius         | 22    |
| Medium   | Token/Styling | Missing theme coverage   | 458   |
| Medium   | Token/Styling | Missing IDE alias        | 45    |
| Medium   | Performance   | Inline function prop     | 126   |
| Medium   | Performance   | Missing memo             | 134   |
| Medium   | Performance   | Inline object prop       | 4     |
| Medium   | Performance   | Inline array prop        | 22    |
| Medium   | Accessibility | Missing keyboard handler | 13    |
| Medium   | Accessibility | Missing ARIA             | 1     |
| Low      | Token/Styling | Hardcoded opacity        | 103   |
| Low      | Token/Styling | Hardcoded z-index        | 25    |
| Low      | Token/Styling | Hardcoded font-size      | 49    |
| Low      | Convention    | Large component file     | 36    |

---

## Detailed Findings

### Medium: Hardcoded transition (Token/Styling)

**13 finding(s)**

- `packages/ai-ui/src/components/agent/AgentControls.module.css:38` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: pulse-dot var(--_duration-pulse) var(--_ease-pulse) infinite;
  ```

- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:46` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: brain-pulse var(--_duration-pulse) var(--_ease-pulse) infinite;
  ```

- `packages/base-ui/src/components/badge/Badge.module.css:201` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: ov-badge-pulse var(--_duration-pulse) ease-in-out infinite;
  ```

- `packages/base-ui/src/components/card/Card.module.css:500` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: indicator-pulse var(--_duration-pulse) var(--_easing-pulse) infinite;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:612` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: skeleton-pulse var(--_duration-pulse) var(--_easing-skeleton) infinite;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:100` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  transition: opacity 100ms;
  ```

- `packages/base-ui/src/components/skeleton/Skeleton.module.css:59` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: ov-skeleton-pulse var(--_duration-pulse) ease-in-out infinite;
  ```

- `packages/base-ui/src/components/skeleton/Skeleton.module.css:87` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: ov-skeleton-wave var(--_duration-wave) linear infinite;
  ```

- `packages/base-ui/src/components/spinner/Spinner.module.css:80` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: ov-spinner-fade var(--_duration-spin) linear infinite;
  ```

- `packages/base-ui/src/components/status-dot/StatusDot.module.css:102` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: ov-pulse var(--_duration-pulse) var(--_ease-pulse) infinite;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:225` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: ov-toast-pulse var(--_duration-pulse) var(--_easing-pulse) infinite;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:353` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  animation: spin var(--_ov-duration-spin) linear infinite;
  ```

- `packages/base-ui/src/components/visualization/ViewLayout.module.css:12` — Raw transition/animation — use --ov-duration-_/--ov-ease-_ tokens (breaks reduced motion)

  ```css
  transition: var(--_ov-view-drag-transition);
  ```

### Medium: Hardcoded spacing (Token/Styling)

**220 finding(s)**

- `packages/ai-ui/src/components/branching/AIBranch.module.css:9` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/ai-ui/src/components/chat/AIContextIndicator.module.css:5` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/ai-ui/src/components/chat/AIMessageActions.module.css:4` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:18` — Raw spacing value — use --ov-space-* token

  ```css
  padding-top: 2px;
  ```

- `packages/ai-ui/src/components/content/AIMarkdown.module.css:22` — Raw spacing value — use --ov-space-* token

  ```css
  margin-left: 1px;
  ```

- `packages/ai-ui/src/components/reasoning/ChainOfThought.module.css:89` — Raw spacing value — use --ov-space-* token

  ```css
  padding-top: 1px;
  ```

- `packages/ai-ui/src/components/streaming/StreamingText.module.css:11` — Raw spacing value — use --ov-space-* token

  ```css
  margin-left: 1px;
  ```

- `packages/ai-ui/src/components/streaming/TypingIndicator.module.css:15` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 3px;
  ```

- `packages/base-ui/src/components/accordion/Accordion.module.css:25` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-header-gap: 4px;
  ```

- `packages/base-ui/src/components/accordion/Accordion.module.css:38` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-header-gap: 6px;
  ```

- `packages/base-ui/src/components/accordion/Accordion.module.css:51` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-header-gap: 10px;
  ```

- `packages/base-ui/src/components/accordion/Accordion.module.css:64` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-header-gap: 12px;
  ```

- `packages/base-ui/src/components/accordion/Accordion.module.css:79` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-header-gap: 2px;
  ```

- `packages/base-ui/src/components/accordion/Accordion.module.css:196` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 0 6px;
  ```

- `packages/base-ui/src/components/action-list/ActionList.module.css:105` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/action-list/ActionList.module.css:144` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block: 2px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:18` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 12px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:19` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 16px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:36` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 8px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:37` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 8px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:41` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 10px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:42` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 12px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:46` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 14px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:47` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 20px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:51` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 16px;
  ```

- `packages/base-ui/src/components/alert-dialog/AlertDialog.module.css:52` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 24px;
  ```

- `packages/base-ui/src/components/app-shell/AppShell.module.css:151` — Raw spacing value — use --ov-space-* token

  ```css
  padding-top: env(titlebar-area-height, 52px);
  ```

- `packages/base-ui/src/components/banner/Banner.module.css:151` — Raw spacing value — use --ov-space-* token

  ```css
  margin-top: 1px;
  ```

- `packages/base-ui/src/components/banner/Banner.module.css:165` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/banner/Banner.module.css:190` — Raw spacing value — use --ov-space-* token

  ```css
  margin-top: 1px;
  ```

- `packages/base-ui/src/components/basic-list/BasicList.module.css:25` — Raw spacing value — use --ov-space-* token

  ```css
  padding-inline: 6px;
  ```

- `packages/base-ui/src/components/button-group/ButtonGroup.module.css:26` — Raw spacing value — use --ov-space-* token

  ```css
  margin-inline-start: -1px;
  ```

- `packages/base-ui/src/components/button-group/ButtonGroup.module.css:31` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-start: -1px;
  ```

- `packages/base-ui/src/components/card/Card.module.css:469` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/components/card/Card.module.css:621` — Raw spacing value — use --ov-space-* token

  ```css
  padding-block: 2px;
  ```

- `packages/base-ui/src/components/card/Card.module.css:704` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/checkbox-group/CheckboxGroup.module.css:18` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/components/checkbox-group/CheckboxGroup.module.css:42` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 10px;
  ```

- `packages/base-ui/src/components/checkbox/Checkbox.module.css:341` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/chip/Chip.module.css:5` — Raw spacing value — use --ov-space-* token

  ```css
  gap: var(--_ov-group-spacing, 4px); /* fallback: --ov-space-stack-xs; no semantic token for 4px */
  ```

- `packages/base-ui/src/components/code-block/CodeBlock.module.css:175` — Raw spacing value — use --ov-space-* token

  ```css
  padding-inline-end: 10px;
  ```

- `packages/base-ui/src/components/command-list/CommandList.module.css:114` — Raw spacing value — use --ov-space-* token

  ```css
  padding-block: 6px;
  ```

- `packages/base-ui/src/components/command-list/CommandList.module.css:121` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-start: 2px;
  ```

- `packages/base-ui/src/components/command-list/CommandList.module.css:269` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 3px;
  ```

- `packages/base-ui/src/components/command-list/CommandList.module.css:299` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block: 2px;
  ```

- `packages/base-ui/src/components/date-field/DateField.module.css:71` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 0 1px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:5` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 10px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:6` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 4px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:19` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 6px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:20` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 2px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:26` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 8px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:27` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 2px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:33` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 12px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:34` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 6px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:40` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 16px;
  ```

- `packages/base-ui/src/components/description-list/DescriptionList.module.css:41` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 8px;
  ```

- `packages/base-ui/src/components/drawer/Drawer.module.css:132` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 6px 0;
  ```

- `packages/base-ui/src/components/drawer/Drawer.module.css:138` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 0 6px;
  ```

- `packages/base-ui/src/components/editable-list/EditableList.module.css:12` — Raw spacing value — use --ov-space-* token

  ```css
  padding-inline: 4px;
  ```

- `packages/base-ui/src/components/editable-list/EditableList.module.css:31` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:103` — Raw spacing value — use --ov-space-* token

  ```css
  margin: 4px 2px;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:104` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 0 14px;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:224` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 0 3px;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:237` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/components/empty-state/EmptyState.module.css:2` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 32px;
  ```

- `packages/base-ui/src/components/empty-state/EmptyState.module.css:19` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 20px;
  ```

- `packages/base-ui/src/components/empty-state/EmptyState.module.css:20` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 6px;
  ```

- `packages/base-ui/src/components/empty-state/EmptyState.module.css:27` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding: 48px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:17` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:18` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 5px 8px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:113` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:114` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 3px 8px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:134` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 8px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:137` — Raw spacing value — use --ov-space-* token

  ```css
  padding-inline: 10px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:169` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:179` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px 12px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:181` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 8px 12px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:203` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:26` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 4px 8px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:35` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 2px 8px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:112` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 12px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:113` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 4px 12px;
  ```

- `packages/base-ui/src/components/filter-bar/FilterBar.module.css:3` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 8px;
  ```

- `packages/base-ui/src/components/filter-bar/FilterBar.module.css:12` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 4px;
  ```

- `packages/base-ui/src/components/filter-bar/FilterBar.module.css:16` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 6px;
  ```

- `packages/base-ui/src/components/filter-bar/FilterBar.module.css:20` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 10px;
  ```

- `packages/base-ui/src/components/filter-bar/FilterBar.module.css:24` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-gap: 12px;
  ```

- `packages/base-ui/src/components/find-bar/FindBar.module.css:4` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```

- `packages/base-ui/src/components/find-bar/FindBar.module.css:13` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```

- `packages/base-ui/src/components/form-field/FormField.module.css:47` — Raw spacing value — use --ov-space-* token

  ```css
  gap: calc(var(--_space-stack-xs) - 1px); /* derived from local alias */
  ```

- `packages/base-ui/src/components/icon-picker/IconPicker.module.css:158` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/components/keyed-search/KeyedSearch.module.css:171` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/components/list/List.module.css:117` — Raw spacing value — use --ov-space-* token

  ```css
  padding-block: 2px;
  ```

- `packages/base-ui/src/components/list/List.module.css:249` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block: 2px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:17` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-control-padding-block: 2px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:40` — Raw spacing value — use --ov-space-* token

  ```css
  padding: var(--_ov-control-padding-block) 4px var(--_ov-control-padding-block);
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:65` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-control-padding-block: 0px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:74` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-control-padding-block: 1px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:83` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-control-padding-block: 3px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:92` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-control-padding-block: 4px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:181` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 1px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:182` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:183` — Raw spacing value — use --ov-space-* token

  ```css
  scroll-padding-inline: 1px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:273` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-popup-padding: 4px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:362` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-end: 2px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:366` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-end: 1px;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:370` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-end: 3px;
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.module.css:280` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/components/radio-group/RadioGroup.module.css:14` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/components/radio/Radio.module.css:220` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceInspectorControls.module.css:85` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceInspectorControls.module.css:95` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 4px 8px;
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceInspectorControls.module.css:136` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 1px 6px;
  ```

- `packages/base-ui/src/components/search-input/SearchInput.module.css:32` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-hotkey-padding-block: 0px;
  ```

- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:5` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:6` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 2px;
  ```

- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:81` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:97` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```

- `packages/base-ui/src/components/select/Select.module.css:218` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-popup-padding: 4px;
  ```

- `packages/base-ui/src/components/select/Select.module.css:242` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-popup-padding: 2px;
  ```

- `packages/base-ui/src/components/select/Select.module.css:252` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-popup-padding: 3px;
  ```

- `packages/base-ui/src/components/select/Select.module.css:262` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-popup-padding: 5px;
  ```

- `packages/base-ui/src/components/select/Select.module.css:272` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-popup-padding: 6px;
  ```

- `packages/base-ui/src/components/select/Select.module.css:322` — Raw spacing value — use --ov-space-* token

  ```css
  scroll-padding-block: 18px;
  ```

- `packages/base-ui/src/components/select/Select.module.css:337` — Raw spacing value — use --ov-space-* token

  ```css
  margin: 2px 0;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:3` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-shortcut-row-gap: 10px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:13` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-shortcut-row-gap: 6px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:23` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-shortcut-row-gap: 12px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:27` — Raw spacing value — use --ov-space-* token

  ```css
  margin: 0 0 16px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:44` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 12px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:52` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:68` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 2px 6px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:96` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 8px;
  ```

- `packages/base-ui/src/components/shortcut-summary/ShortcutSummary.module.css:103` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/base-ui/src/components/skeleton/Skeleton.module.css:114` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 0.5em;
  ```

- `packages/base-ui/src/components/sortable-table/SortableHeader.module.css:4` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/stat-row/StatRow.module.css:9` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-stat-gap: 6px;
  ```

- `packages/base-ui/src/components/stat-row/StatRow.module.css:23` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-stat-gap: 4px;
  ```

- `packages/base-ui/src/components/stat-row/StatRow.module.css:29` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-stat-gap: 6px;
  ```

- `packages/base-ui/src/components/stat-row/StatRow.module.css:35` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-stat-gap: 8px;
  ```

- `packages/base-ui/src/components/stat-row/StatRow.module.css:41` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-stat-gap: 10px;
  ```

- `packages/base-ui/src/components/stat-row/StatRow.module.css:47` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-stat-gap: 12px;
  ```

- `packages/base-ui/src/components/stat-row/StatRow.module.css:57` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px;
  ```

- `packages/base-ui/src/components/status-dot/StatusDot.module.css:25` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/components/switch/Switch.module.css:224` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/tabs/Tabs.module.css:165` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 2px;
  ```

- `packages/base-ui/src/components/tag-input/TagInput.module.css:6` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding-block: 2px;
  ```

- `packages/base-ui/src/components/tag-input/TagInput.module.css:33` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding-block: 0px;
  ```

- `packages/base-ui/src/components/tag-input/TagInput.module.css:40` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding-block: 1px;
  ```

- `packages/base-ui/src/components/tag-input/TagInput.module.css:47` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding-block: 3px;
  ```

- `packages/base-ui/src/components/tag-input/TagInput.module.css:54` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-padding-block: 4px;
  ```

- `packages/base-ui/src/components/time-picker/TimePicker.module.css:57` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 1px;
  ```

- `packages/base-ui/src/components/time-picker/TimePicker.module.css:95` — Raw spacing value — use --ov-space-* token

  ```css
  padding-block: 1px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:10` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-gap: 12px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:11` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-item-gap: 12px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:25` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-gap: 6px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:26` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-item-gap: 6px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:35` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-gap: 8px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:36` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-item-gap: 8px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:45` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-gap: 14px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:46` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-item-gap: 14px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:55` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-gap: 16px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:56` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-timeline-item-gap: 16px;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:196` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:247` — Raw spacing value — use --ov-space-* token

  ```css
  padding-top: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:252` — Raw spacing value — use --ov-space-* token

  ```css
  padding-top: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:98` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:187` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/components/toggle-button-group/ToggleButtonGroup.module.css:30` — Raw spacing value — use --ov-space-* token

  ```css
  margin-left: -1px;
  ```

- `packages/base-ui/src/components/toggle-button-group/ToggleButtonGroup.module.css:45` — Raw spacing value — use --ov-space-* token

  ```css
  margin-top: -1px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:37` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-padding-inline: 2px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:38` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 2px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:47` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-padding-inline: 6px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:48` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 6px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:56` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-padding-inline: 2px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:57` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 3px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:63` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-padding-inline: 6px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:64` — Raw spacing value — use --ov-space-* token

  ```css
  --_ov-item-gap: 6px;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:445` — Raw spacing value — use --ov-space-* token

  ```css
  padding-inline: 4px;
  ```

- `packages/base-ui/src/components/typography/Typography.module.css:294` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/components/visualization/ViewLayout.module.css:78` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/metrics/ComponentStories.module.css:22` — Raw spacing value — use --ov-space-* token

  ```css
  padding-bottom: 12px;
  ```

- `packages/base-ui/src/metrics/ComponentStories.module.css:30` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 5px 9px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:39` — Raw spacing value — use --ov-space-* token

  ```css
  padding-block-start: 8px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:51` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 2px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:52` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 2px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:81` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 10px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:87` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:111` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 5px 0;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:129` — Raw spacing value — use --ov-space-* token

  ```css
  margin-inline-end: 5px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:145` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 5px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:157` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 3px 5px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:161` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 3px 5px;
  ```

- `packages/base-ui/src/metrics/Distributions.module.css:110` — Raw spacing value — use --ov-space-* token

  ```css
  padding-inline-start: 72px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:13` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 10px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:14` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-end: 10px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:20` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:26` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 6px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:32` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 3px 8px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:63` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 8px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:64` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-end: 14px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:69` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 2px 6px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:76` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 14px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:83` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 24px 16px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:96` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 7px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:99` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 0 10px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:111` — Raw spacing value — use --ov-space-* token

  ```css
  margin-bottom: 14px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:118` — Raw spacing value — use --ov-space-* token

  ```css
  padding-bottom: 12px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:121` — Raw spacing value — use --ov-space-* token

  ```css
  margin-top: 12px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:12` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 8px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:13` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 12px 16px 8px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:16` — Raw spacing value — use --ov-space-* token

  ```css
  padding-block-end: 8px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:33` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 0 16px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:42` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 5px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:44` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 10px 16px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:51` — Raw spacing value — use --ov-space-* token

  ```css
  gap: 7px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:64` — Raw spacing value — use --ov-space-* token

  ```css
  margin-block-end: 12px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:309` — Raw spacing value — use --ov-space-* token

  ```css
  margin: -1px;
  ```

- `packages/base-ui/src/metrics/TimePlots.module.css:49` — Raw spacing value — use --ov-space-* token

  ```css
  padding-inline-start: 50px;
  ```

- `packages/editors/src/components/object-inspector/ObjectInspector.module.css:66` — Raw spacing value — use --ov-space-* token

  ```css
  padding: 1px 0;
  ```

### Medium: Hardcoded box-shadow (Token/Styling)

**31 finding(s)**

- `packages/base-ui/src/components/badge/Badge.module.css:189` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 0 var(--_ov-pulse-color);
  ```

- `packages/base-ui/src/components/badge/Badge.module.css:192` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 4px transparent;
  ```

- `packages/base-ui/src/components/badge/Badge.module.css:195` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 0 transparent;
  ```

- `packages/base-ui/src/components/card/Card.module.css:37` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: none;
  ```

- `packages/base-ui/src/components/card/Card.module.css:192` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_card-shadow-sm);
  ```

- `packages/base-ui/src/components/card/Card.module.css:195` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_card-shadow-md);
  ```

- `packages/base-ui/src/components/card/Card.module.css:198` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_card-shadow-lg);
  ```

- `packages/base-ui/src/components/card/Card.module.css:318` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: inset var(--_ov-card-rail-offset) 0 transparent;
  ```

- `packages/base-ui/src/components/card/Card.module.css:506` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--_ov-indicator-color) 40%, transparent 60%);
  ```

- `packages/base-ui/src/components/card/Card.module.css:509` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--_ov-indicator-color) 0%, transparent 100%);
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:237` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_dt-pin-shadow, none);
  ```

- `packages/base-ui/src/components/date-field/DateField.module.css:64` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: none;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:468` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_shadow-drag);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:484` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_shadow-ghost);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:496` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: inset 0 0 0 1px var(--_ov-tab-active-border);
  ```

- `packages/base-ui/src/components/input/Input.module.css:154` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```

- `packages/base-ui/src/components/number-input/NumberInput.module.css:140` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```

- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:62` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow:;
  ```

- `packages/base-ui/src/components/sheet/Sheet.module.css:18` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_ov-shadow);
  ```

- `packages/base-ui/src/components/slider/Slider.module.css:195` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: inset 0 0 0 1px var(--_ov-track-border);
  ```

- `packages/base-ui/src/components/slider/Slider.module.css:235` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow:;
  ```

- `packages/base-ui/src/components/status-dot/StatusDot.module.css:3` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 0 var(--_ov-pulse-color);
  ```

- `packages/base-ui/src/components/status-dot/StatusDot.module.css:6` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 var(--_ov-pulse-spread) transparent;
  ```

- `packages/base-ui/src/components/status-dot/StatusDot.module.css:9` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 0 transparent;
  ```

- `packages/base-ui/src/components/tabs/Tabs.module.css:138` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: inset 0 -2px 0 var(--_ov-indicator);
  ```

- `packages/base-ui/src/components/text-area/TextArea.module.css:142` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```

- `packages/base-ui/src/components/text-field/TextField.module.css:136` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:74` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: var(--_ov-surface-shadow);
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:90` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: none;
  ```

- `packages/base-ui/src/components/toggle-button/ToggleButton.module.css:38` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--_ov-accent-border) 64%, transparent 36%);
  ```

- `packages/base-ui/src/components/toggle-button/ToggleButton.module.css:80` — Raw box-shadow — use --ov-shadow-* token

  ```css
  box-shadow:;
  ```

### Medium: Hardcoded radius (Token/Styling)

**22 finding(s)**

- `packages/base-ui/src/components/checkbox/Checkbox.module.css:275` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 1px;
  ```

- `packages/base-ui/src/components/checkbox/Checkbox.module.css:331` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 1px;
  ```

- `packages/base-ui/src/components/date-field/DateField.module.css:72` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:102` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 6px;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:508` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 1px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:91` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 3px;
  ```

- `packages/base-ui/src/components/popover/Popover.module.css:203` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

- `packages/base-ui/src/components/sortable-table/SortableHeader.module.css:24` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

- `packages/base-ui/src/components/time-picker/TimePicker.module.css:75` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

- `packages/base-ui/src/components/tooltip/Tooltip.module.css:104` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

- `packages/base-ui/src/metrics/ComponentStories.module.css:29` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 6px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:54` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 6px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:67` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 4px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:153` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 4px;
  ```

- `packages/base-ui/src/metrics/Distributions.module.css:80` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:29` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 5px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:53` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:71` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 4px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:102` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 5px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:3` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 8px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:70` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 1px;
  ```

- `packages/base-ui/src/metrics/TimePlots.module.css:127` — Raw border-radius — use --ov-radius-* token

  ```css
  border-radius: 2px;
  ```

### Medium: Missing theme coverage (Token/Styling)

**458 finding(s)**

- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-black missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-blue missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-black missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-blue missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-cyan missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-green missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-magenta missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-red missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-white missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-bright-yellow missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-cyan missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-green missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-magenta missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-red missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-white missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-ansi-yellow missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-1-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-1-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-10-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-10-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-11-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-11-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-12-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-12-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-2-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-2-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-3-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-3-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-4-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-4-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-5-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-5-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-6-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-6-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-7-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-7-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-8-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-8-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-9-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-avatar-palette-9-fg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-chart-series-1 missing from mode(s): dark, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-chart-series-2 missing from mode(s): dark, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-chart-series-3 missing from mode(s): dark, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-chart-series-4 missing from mode(s): dark, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-danger missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-danger-soft missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-bg missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-bg-hover missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-bg-selected missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-bg-today missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-fg missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-fg-disabled missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-fg-other-month missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-fg-selected missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-cell-fg-today missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-datepicker-header-bg missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-diff-insert-bg missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-diff-remove-bg missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-discovery missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-discovery-soft missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-drawer-handle missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-drawer-handle-hover missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-1 missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-2 missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-3 missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-4 missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-5 missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-6 missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-match-bg missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-bracket-match-border missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-match-bg missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-match-border missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-range-bg missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-border missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-drop-border missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-group-header-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-indent-guide missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-indent-guide-active missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-highlight-bg missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-highlight-border missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-number missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-line-number-active missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-link missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-ruler missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-selection-inactive-bg missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-whitespace missing from mode(s): void, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-fg-inverse missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-added missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-bg missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-deleted missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-gutter-modified missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-info missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-info-soft missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-bg missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-error missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-find-match missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-selection missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-minimap-warning missing from mode(s): void, light, obsidian, carbon, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-progress-fill missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-progress-track missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-scrollarea-thumb missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-scrollarea-thumb-hover missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-scrollarea-track missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-secondary missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-secondary-soft missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-shadow-pinned missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-success missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-success-soft missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-tab-inactive-bg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-warning missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-warning-soft missing from mode(s): solarized-dark, solarized-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-control-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-duration-fast missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-duration-interactive missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-duration-panel missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-ease-standard missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-mono missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-sans missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-weight-body missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-weight-label missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-weight-medium missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-font-weight-title missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-line-height-normal missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-list-row-height missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-panel-padding missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-control missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-full missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-surface missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-radius-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-drag missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-drag-ghost missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-slider-thumb missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-surface missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-surface-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-surface-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-shadow-switch-thumb missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-gap missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-icon-size-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-item-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-action-list-shortcut-min-width-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-group-overlap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-icon-size-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-radius-rounded missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-avatar-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-gap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-icon-size-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-block-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-banner-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-group-gap missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-button-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-action-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-gap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-footer-padding-block-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-gap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-group-gap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-indicator-dot-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-block-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-card-stat-font-size-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-gap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-group-gap missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-icon-size-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-chip-radius-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-control-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-gap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-indicator-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-choice-radius missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-gutter missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-container-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-drawer-handle-length missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-drawer-handle-thickness missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-icon-button-icon-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-image-list-gap missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-after-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-group-label-gap-top-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-gap missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-list-item-radius missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-progress-radius missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-scrollarea-scrollbar-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-inset-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-min-block-size missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-separator-thickness-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-sheet-padding-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-spinner-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-gap-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-thumb-size-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-switch-track-width-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-tab-height missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-block-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-cell-padding-inline-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-expand-indent missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-nested-inset missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-radius missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-resize-handle-width missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-xl missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-table-row-height-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-1 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-2 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-3 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-heading-4 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-min-height missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-padding-block missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-padding-inline missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-hotkey-radius missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-inline-code-padding-block missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-inline-code-padding-inline missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-inline-code-radius missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-size-typography-overline-letter-spacing missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-1 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-1-5 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-2 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-2-5 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-3 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-4 missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-inline-control missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-stack-lg missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-stack-md missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-stack-sm missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-space-stack-xs missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-class missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-comment missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-decorator missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-function missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-interface missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-keyword missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-keyword-control missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-keyword-operator missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-method missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-namespace missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-number missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-operator missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-parameter missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-property missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-punctuation missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-regexp missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-string missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-string-escape missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-comment missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-function missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-keyword missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-type missing from mode(s): void, light, obsidian, carbon, solarized-dark, solarized-light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-type missing from mode(s): void, obsidian, carbon
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-variable missing from mode(s): void, obsidian, carbon

### Medium: Missing IDE alias (Token/Styling)

**45 finding(s)**

- `packages/ai-ui/src/components/chat/AIAttachment.module.css:23` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/ai-ui/src/components/chat/AIAttachment.module.css:36` — Component in "chat" uses --ov-color-fg-subtle — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-subtle);
  ```

- `packages/ai-ui/src/components/chat/AIConversationHeader.module.css:6` — Component in "chat" uses --ov-color-border-muted — consider IDE alias (--ov-color-chat-*)

  ```css
  border-bottom: 1px solid var(--ov-color-border-muted);
  ```

- `packages/ai-ui/src/components/chat/AIMessageEditor.module.css:5` — Component in "chat" uses --ov-color-border-control — consider IDE alias (--ov-color-chat-*)

  ```css
  border: 1px solid var(--ov-color-border-control);
  ```

- `packages/ai-ui/src/components/chat/AIMessageEditor.module.css:19` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-default);
  ```

- `packages/ai-ui/src/components/chat/AIMessageEditor.module.css:26` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:16` — Component in "chat" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-chat-*)

  ```css
  background: var(--ov-color-bg-surface-raised);
  ```

- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:17` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-default);
  ```

- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:21` — Component in "chat" uses --ov-color-bg-surface — consider IDE alias (--ov-color-chat-*)

  ```css
  background: var(--ov-color-brand-soft-bg, var(--ov-color-bg-surface));
  ```

- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:22` — Component in "chat" uses --ov-color-fg-brand — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-brand-soft-fg, var(--ov-color-fg-brand));
  ```

- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:26` — Component in "chat" uses --ov-color-bg-inset — consider IDE alias (--ov-color-chat-*)

  ```css
  background: var(--ov-color-bg-inset);
  ```

- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:27` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:39` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-default);
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:56` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:73` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/ai-ui/src/components/chat/ChatInput.module.css:10` — Component in "chat" uses --ov-color-border-control — consider IDE alias (--ov-color-chat-*)

  ```css
  border: 1px solid var(--ov-color-border-control);
  ```

- `packages/ai-ui/src/components/chat/ChatInput.module.css:12` — Component in "chat" uses --ov-color-bg-surface — consider IDE alias (--ov-color-chat-*)

  ```css
  background: var(--ov-color-bg-surface);
  ```

- `packages/ai-ui/src/components/chat/ChatInput.module.css:36` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-default);
  ```

- `packages/ai-ui/src/components/chat/ChatInput.module.css:52` — Component in "chat" uses --ov-color-fg-muted — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:38` — Component in "chat" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-chat-*)

  ```css
  background: var(--ov-color-bg-surface-raised);
  ```

- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:39` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-default);
  ```

- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:40` — Component in "chat" uses --ov-color-border-default — consider IDE alias (--ov-color-chat-*)

  ```css
  border: 1px solid var(--ov-color-border-default);
  ```

- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:51` — Component in "chat" uses --ov-color-bg-surface — consider IDE alias (--ov-color-chat-*)

  ```css
  background: var(--ov-color-bg-surface-overlay, var(--ov-color-bg-surface));
  ```

- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:12` — Component in "chat" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-chat-*)

  ```css
  background: var(--ov-color-bg-surface-raised);
  ```

- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:13` — Component in "chat" uses --ov-color-fg-default — consider IDE alias (--ov-color-chat-*)

  ```css
  color: var(--ov-color-fg-default);
  ```

- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:14` — Component in "chat" uses --ov-color-border-default — consider IDE alias (--ov-color-chat-*)

  ```css
  border: 1px solid var(--ov-color-border-default);
  ```

- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:26` — Component in "chat" uses --ov-color-border-focus — consider IDE alias (--ov-color-chat-*)

  ```css
  outline: 2px solid var(--ov-color-border-focus);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:23` — Component in "editor-tabs" uses --ov-color-border-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  --_ov-tab-divider: var(--ov-color-border-muted);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:63` — Component in "editor-tabs" uses --ov-color-border-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  --_ov-tab-divider: var(--ov-color-border-muted);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:66` — Component in "editor-tabs" uses --ov-color-border-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  border-bottom-color: var(--ov-color-border-muted);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:81` — Component in "editor-tabs" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-editor-*)

  ```css
  --_ov-tab-active-bg: var(--ov-color-bg-surface-raised);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:83` — Component in "editor-tabs" uses --ov-color-bg-surface — consider IDE alias (--ov-color-editor-*)

  ```css
  --_ov-tab-hover-bg: var(--ov-color-bg-surface);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:85` — Component in "editor-tabs" uses --ov-color-bg-base — consider IDE alias (--ov-color-editor-*)

  ```css
  --_ov-group-header-bg: var(--ov-color-bg-base);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:130` — Component in "editor-tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-editor-*)

  ```css
  --_ov-tab-active-border: var(--ov-color-border-strong);
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:265` — Component in "editor-tabs" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-editor-*)

  ```css
  background: var(--ov-color-bg-surface-raised);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:10` — Component in "cel-query-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:16` — Component in "cel-query-editor" uses --ov-color-border-default — consider IDE alias (--ov-color-editor-*)

  ```css
  border: 1px solid var(--ov-color-border-default);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:18` — Component in "cel-query-editor" uses --ov-color-bg-surface — consider IDE alias (--ov-color-editor-*)

  ```css
  background: var(--ov-color-bg-surface);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:21` — Component in "cel-query-editor" uses --ov-color-border-focus — consider IDE alias (--ov-color-editor-*)

  ```css
  border-color: var(--ov-color-border-focus);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:22` — Component in "cel-query-editor" uses --ov-color-border-focus — consider IDE alias (--ov-color-editor-*)

  ```css
  box-shadow: 0 0 0 1px var(--ov-color-border-focus);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:28` — Component in "cel-query-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:33` — Component in "cel-query-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:36` — Component in "cel-query-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.module.css:41` — Component in "cel-query-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

- `packages/editors/src/components/code-editor/CodeEditor.module.css:28` — Component in "code-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)

  ```css
  color: var(--ov-color-fg-muted);
  ```

### Medium: Inline function prop (Performance)

**126 finding(s)**

- `packages/ai-ui/src/components/chat/AIMessageEditor.tsx:61` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(e) => setValue(e.target.value)}
  ```

- `packages/ai-ui/src/components/content/AIImageGeneration.tsx:53` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onLoad={() => setImageLoaded(true)}
  ```

- `packages/ai-ui/src/components/content/AISources.tsx:31` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <List.Item key={source.id} itemKey={source.id} onClick={() => onNavigate?.(source)}>
  ```

- `packages/ai-ui/src/components/permissions/PermissionRequest.tsx:67` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => setExpanded((v) => !v)}
  ```

- `packages/base-ui/src/components/breadcrumbs/Breadcrumbs.tsx:127` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/data-table/DataTableColumnVisibility.tsx:42` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
  ```

- `packages/base-ui/src/components/data-table/context/DataTableContext.tsx:46` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <table.Subscribe selector={(state) => state}>
  ```

- `packages/base-ui/src/components/date-picker/Calendar.tsx:227` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => setFocusedDate(addMonths(focusedDate, -1))}
  ```

- `packages/base-ui/src/components/date-picker/Calendar.tsx:237` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => setFocusedDate(addMonths(focusedDate, 1))}
  ```

- `packages/base-ui/src/components/dock-layout/DockLayout.tsx:288` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={(e) => {
  ```

- `packages/base-ui/src/components/drawer/Drawer.tsx:262` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onOpenChange?.(false)}
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabsViewport.tsx:39` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  ref={(node) => {
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:68` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onSelectedKeysChange={(keys) => {
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:99` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:111` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:132` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => void action.onSelect(selected)}
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:198` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => sync.onEnabledChange(event.target.checked)}
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:219` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => void sync.onRefresh()}
  ```

- `packages/base-ui/src/components/file-explorer/FileTree.tsx:142` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onDoubleClick={() => onOpen?.(node)}
  ```

- `packages/base-ui/src/components/file-explorer/FileTree.tsx:275` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button size="sm" onClick={() => void onLoadChildren(node)}>
  ```

- `packages/base-ui/src/components/file-explorer/FileTree.tsx:279` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button size="sm" onClick={() => void onLoadMore(null)}>
  ```

- `packages/base-ui/src/components/file-explorer/FileTree.tsx:290` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button size="sm" onClick={() => void onLoadMore(node)}>
  ```

- `packages/base-ui/src/components/file-table/FileTable.tsx:156` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => ctx.onSelect?.(item)}
  ```

- `packages/base-ui/src/components/icon-picker/IconPicker.tsx:287` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  ref={(node) => {
  ```

- `packages/base-ui/src/components/icon-picker/IconPicker.tsx:323` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/icon-picker/IconPicker.tsx:351` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => fileInput.current?.click()}
  ```

- `packages/base-ui/src/components/icon-picker/IconPicker.tsx:363` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/keyed-search/KeyedSearch.tsx:326` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onOpenChange={(next, details) => {
  ```

- `packages/base-ui/src/components/list/List.tsx:170` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  ref={(node) => {
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:281` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  render={(removeProps) => (
  ```

- `packages/base-ui/src/components/nav-list/NavList.tsx:143` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={(event) => {
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.tsx:184` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => void switchMode('code')}
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.tsx:192` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => void switchMode('builder')}
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.tsx:204` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => onScopeChange?.(event.target.value)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.tsx:240` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onRun(value)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.tsx:282` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(text) =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.tsx:301` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(builder) => onChange({ ...value, builder })}
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:70` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:98` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:153` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => onChange({ ...value, negated: event.target.checked })}
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:209` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:223` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => onChange({ ...value, negated: event.target.checked })}
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:242` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(next) => replace(index, next)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:253` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(next) => replace(index, next)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:266` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => move(index, -1)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:274` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => move(index, 1)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:283` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:301` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:311` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:463` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button size="sm" disabled={blocked} onClick={() => onChange(example.value)}>
  ```

- `packages/base-ui/src/components/query-authoring/QueryInput.tsx:372` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onOpenChange={(next, details) => {
  ```

- `packages/base-ui/src/components/query-authoring/QueryInput.tsx:390` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onMouseDown={(event) => event.preventDefault()}
  ```

- `packages/base-ui/src/components/query-authoring/QueryInput.tsx:456` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/query-authoring/QueryInput.tsx:480` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => accept(diagnostic.fix!)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryValueInput.tsx:114` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => setSearch(event.target.value)}
  ```

- `packages/base-ui/src/components/query-authoring/QueryValueInput.tsx:220` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() =>
  ```

- `packages/base-ui/src/components/query-authoring/QueryValueInput.tsx:255` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/query-authoring/QueryVariables.tsx:72` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onChange({ ...value, [variable.id]: variable.defaultValue })}
  ```

- `packages/base-ui/src/components/query-authoring/QueryVariables.tsx:83` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipPreview.tsx:33` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onNavigate(navigationId)}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:58` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => onChange(event.target.value)}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:166` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => onChange({ ...draft, name: event.target.value })}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:206` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => {
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:250` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(operatorId) => updateCondition(condition.id, { operatorId })}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:276` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() =>
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:296` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => action.run('preview', (context) => onPreview(draft, context))}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:302` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => action.run('save', (context) => onSave(draft, context))}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:308` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => action.run('enable', (context) => onSetEnabled(!draft.enabled, context))}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:251` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => review('rebuild', index, index.kind)}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:259` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => review('drop', index, index.kind)}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:278` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => setProposalId(event.target.value)}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:290` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => selectedProposal && review('create', selectedProposal)}
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:336` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:394` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button disabled={Boolean(action.pending)} onClick={() => setApproval(null)}>
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceGroupingControls.tsx:69` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button size="sm" variant="ghost" onClick={() => change(id, false)}>
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceResultNavigation.tsx:37` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceScopePicker.tsx:76` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onCheckedChange={(checked) =>
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceScopePicker.tsx:112` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onCheckedChange={(checked) =>
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceScopePicker.tsx:161` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() =>
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceScopePicker.tsx:186` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceScopePicker.tsx:211` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onChange(value.filter((item) => item.targetId !== entry.targetId))}
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceSearchResults.tsx:57` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  itemKey={(item) => item.id}
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:83` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => dispatch({ type: 'select', id: event.target.value || null })}
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:118` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => dispatch({ type: 'create', name: nameDraft, draft })}
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:125` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:135` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:145` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => dispatch({ type: 'reset', id: selectedId })}
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:153` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:182` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:200` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => onImportDraftChange(event.target.value)}
  ```

- `packages/base-ui/src/components/resource-workspace-controls/SavedResourceManager.tsx:208` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => dispatch({ type: 'import', document: importDraft })}
  ```

- `packages/base-ui/src/components/search-input/SearchInput.tsx:118` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  ref={(node) => {
  ```

- `packages/base-ui/src/components/tag-input/TagInput.tsx:198` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={(e) => {
  ```

- `packages/base-ui/src/components/toast/Toast.tsx:179` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/components/toast/Toast.tsx:192` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onDismiss(item.id, 'close', true)}
  ```

- `packages/base-ui/src/components/visualization/ViewLayout.tsx:388` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onDragStart={() => {
  ```

- `packages/base-ui/src/components/visualization/VisualizationBindingEditor.tsx:70` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onValueChange={(id) => {
  ```

- `packages/base-ui/src/components/visualization/VisualizationBindingEditor.tsx:126` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onValueChange={(fieldId, details) => {
  ```

- `packages/base-ui/src/metrics/MetricDisplayPicker.tsx:92` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onChange(option.value)}
  ```

- `packages/base-ui/src/metrics/MetricPanel.tsx:80` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onToggle={(event) => {
  ```

- `packages/base-ui/src/metrics/MetricPanel.tsx:87` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={(event) => {
  ```

- `packages/base-ui/src/metrics/PodReference.tsx:102` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onRefresh={() => setRevision((current) => current + 1)}
  ```

- `packages/base-ui/src/metrics/PodReference.tsx:135` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => setVisible((current) => [...current, metric.id])}
  ```

- `packages/base-ui/src/metrics/PodReference.tsx:174` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(next) => setDisplays((current) => ({ ...current, [metric.id]: next }))}
  ```

- `packages/base-ui/src/metrics/PodReference.tsx:219` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button size="sm" variant="ghost" onClick={() => setVisible(['cpu', 'memory'])}>
  ```

- `packages/base-ui/src/metrics/RankedBars.tsx:93` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onSelect(item.id)}
  ```

- `packages/base-ui/src/metrics/SmallMultiples.tsx:57` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onSelect(item.id)}
  ```

- `packages/base-ui/src/metrics/SmallMultiples.tsx:75` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onPageChange?.(current - 1)}
  ```

- `packages/base-ui/src/metrics/SmallMultiples.tsx:86` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => onPageChange?.(current + 1)}
  ```

- `packages/base-ui/src/metrics/TimeRangeControl.tsx:42` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onOpenChange={(next) => {
  ```

- `packages/base-ui/src/metrics/TimeRangeControl.tsx:70` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onClick={() => {
  ```

- `packages/base-ui/src/metrics/TimeRangeControl.tsx:81` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onSubmit={(event) => {
  ```

- `packages/base-ui/src/metrics/TimeRangeControl.tsx:99` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => setStart(event.target.value)}
  ```

- `packages/base-ui/src/metrics/TimeRangeControl.tsx:108` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => setEnd(event.target.value)}
  ```

- `packages/base-ui/src/theme/ThemeSwitcher.tsx:25` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => setTheme(event.target.value)}
  ```

- `packages/base-ui/src/theme/ThemeSwitcher.tsx:40` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => setDensity(event.target.value as typeof density)}
  ```

- `packages/base-ui/src/theme/ThemeSwitcher.tsx:52` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(event) => setMotion(event.target.value as typeof motion)}
  ```

- `packages/benchmarks/src/__perf__/base-ui/Dialog.perf-test.tsx:12` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button onClick={() => setOpen(true)}>Open Dialog</Button>
  ```

- `packages/benchmarks/src/__perf__/base-ui/Dialog.perf-test.tsx:13` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Dialog open={open} onClose={() => setOpen(false)} size="md">
  ```

- `packages/benchmarks/src/__perf__/base-ui/Dialog.perf-test.tsx:17` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button onClick={() => setOpen(false)}>Cancel</Button>
  ```

- `packages/benchmarks/src/__perf__/base-ui/Dialog.perf-test.tsx:18` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <Button onClick={() => setOpen(false)}>Confirm</Button>
  ```

- `packages/benchmarks/src/base-ui/FilterBar.bench.tsx:15` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  <FilterBar.Chip key={filter} onRemove={() => {}}>
  ```

- `packages/editors/src/components/cel-query-editor/CelQueryEditor.tsx:133` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(text) => {
  ```

- `packages/editors/src/components/command-palette/CommandPalette.tsx:155` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  ref={(node) => {
  ```

- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:188` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onKeyDown={(e) => {
  ```

- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:288` — Arrow function as prop — causes child re-renders, use useCallback

  ```tsx
  onChange={(e) => setSearchQuery(e.target.value)}
  ```

### Medium: Missing memo (Performance)

**134 finding(s)**

- `packages/base-ui/src/components/accordion/Accordion.tsx:1` — Exported leaf component "Accordion" without React.memo — consider wrapping
- `packages/base-ui/src/components/action-list/ActionList.tsx:1` — Exported leaf component "ActionList" without React.memo — consider wrapping
- `packages/base-ui/src/components/alert-dialog/AlertDialog.tsx:1` — Exported leaf component "AlertDialog" without React.memo — consider wrapping
- `packages/base-ui/src/components/app-shell/AppShell.tsx:1` — Exported leaf component "AppShell" without React.memo — consider wrapping
- `packages/base-ui/src/components/autocomplete/Autocomplete.tsx:1` — Exported leaf component "Autocomplete" without React.memo — consider wrapping
- `packages/base-ui/src/components/avatar-group/AvatarGroup.tsx:1` — Exported leaf component "AvatarGroup" without React.memo — consider wrapping
- `packages/base-ui/src/components/avatar/Avatar.tsx:1` — Exported leaf component "Avatar" without React.memo — consider wrapping
- `packages/base-ui/src/components/banner/Banner.tsx:1` — Exported leaf component "Banner" without React.memo — consider wrapping
- `packages/base-ui/src/components/basic-list/BasicList.tsx:1` — Exported leaf component "BasicList" without React.memo — consider wrapping
- `packages/base-ui/src/components/box/Box.tsx:1` — Exported leaf component "Box" without React.memo — consider wrapping
- `packages/base-ui/src/components/breadcrumbs/Breadcrumbs.tsx:1` — Exported leaf component "Breadcrumbs" without React.memo — consider wrapping
- `packages/base-ui/src/components/button-group/ButtonGroup.tsx:1` — Exported leaf component "ButtonGroup" without React.memo — consider wrapping
- `packages/base-ui/src/components/card/Card.tsx:1` — Exported leaf component "Card" without React.memo — consider wrapping
- `packages/base-ui/src/components/checkbox-group/CheckboxGroup.tsx:1` — Exported leaf component "CheckboxGroup" without React.memo — consider wrapping
- `packages/base-ui/src/components/checkbox/Checkbox.tsx:1` — Exported leaf component "Checkbox" without React.memo — consider wrapping
- `packages/base-ui/src/components/chip/Chip.tsx:1` — Exported leaf component "Chip" without React.memo — consider wrapping
- `packages/base-ui/src/components/combobox/Combobox.tsx:1` — Exported leaf component "Combobox" without React.memo — consider wrapping
- `packages/base-ui/src/components/command-list/CommandList.tsx:1` — Exported leaf component "CommandList" without React.memo — consider wrapping
- `packages/base-ui/src/components/command-list/context/CommandListContext.tsx:1` — Exported leaf component "CommandListConfigContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/command-list/context/CommandListContext.tsx:1` — Exported leaf component "CommandListStoreContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/command-list/context/CommandListContext.tsx:1` — Exported leaf component "CommandListActionsContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/context-menu/ContextMenu.tsx:1` — Exported leaf component "ContextMenu" without React.memo — consider wrapping
- `packages/base-ui/src/components/data-table/DataTable.tsx:1` — Exported leaf component "DataTable" without React.memo — consider wrapping
- `packages/base-ui/src/components/date-picker/Calendar.tsx:1` — Exported leaf component "Calendar" without React.memo — consider wrapping
- `packages/base-ui/src/components/date-picker/DatePicker.tsx:1` — Exported leaf component "DatePicker" without React.memo — consider wrapping
- `packages/base-ui/src/components/date-range-picker/DateRangePicker.tsx:1` — Exported leaf component "DateRangePicker" without React.memo — consider wrapping
- `packages/base-ui/src/components/date-time-picker/DateTimePicker.tsx:1` — Exported leaf component "DateTimePicker" without React.memo — consider wrapping
- `packages/base-ui/src/components/description-list/DescriptionList.tsx:1` — Exported leaf component "DescriptionList" without React.memo — consider wrapping
- `packages/base-ui/src/components/dialog/Dialog.tsx:1` — Exported leaf component "Dialog" without React.memo — consider wrapping
- `packages/base-ui/src/components/dock-layout/DockLayout.tsx:1` — Exported leaf component "DockLayout" without React.memo — consider wrapping
- `packages/base-ui/src/components/drawer/Drawer.tsx:1` — Exported leaf component "Drawer" without React.memo — consider wrapping
- `packages/base-ui/src/components/editable-list/EditableList.tsx:1` — Exported leaf component "EditableList" without React.memo — consider wrapping
- `packages/base-ui/src/components/editor-tabs/EditorTabs.tsx:1` — Exported leaf component "EditorTabs" without React.memo — consider wrapping
- `packages/base-ui/src/components/editor-tabs/context/TabDragBroker.tsx:1` — Exported leaf component "DEFAULT_TAB_DRAG_TYPE" without React.memo — consider wrapping
- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:1` — Exported leaf component "FileExplorer" without React.memo — consider wrapping
- `packages/base-ui/src/components/file-table/FileTable.tsx:1` — Exported leaf component "FileTableColumn" without React.memo — consider wrapping
- `packages/base-ui/src/components/file-table/FileTable.tsx:1` — Exported leaf component "FileTableBody" without React.memo — consider wrapping
- `packages/base-ui/src/components/file-table/FileTable.tsx:1` — Exported leaf component "FileTableStatus" without React.memo — consider wrapping
- `packages/base-ui/src/components/file-table/FileTable.tsx:1` — Exported leaf component "FileTable" without React.memo — consider wrapping
- `packages/base-ui/src/components/filter-bar/FilterBar.tsx:1` — Exported leaf component "FilterBar" without React.memo — consider wrapping
- `packages/base-ui/src/components/grid/Grid.tsx:1` — Exported leaf component "Grid" without React.memo — consider wrapping
- `packages/base-ui/src/components/icon-picker/IconPicker.tsx:1` — Exported leaf component "IconPicker" without React.memo — consider wrapping
- `packages/base-ui/src/components/image-list/ImageList.tsx:1` — Exported leaf component "ImageList" without React.memo — consider wrapping
- `packages/base-ui/src/components/input/Input.tsx:1` — Exported leaf component "Input" without React.memo — consider wrapping
- `packages/base-ui/src/components/list/List.tsx:1` — Exported leaf component "List" without React.memo — consider wrapping
- `packages/base-ui/src/components/list/context/ListContext.tsx:1` — Exported leaf component "ListConfigContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/list/context/ListContext.tsx:1` — Exported leaf component "ListStoreContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/list/context/ListContext.tsx:1` — Exported leaf component "ListActionsContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/menu/Menu.tsx:1` — Exported leaf component "Menu" without React.memo — consider wrapping
- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:1` — Exported leaf component "MultiSelect" without React.memo — consider wrapping
- `packages/base-ui/src/components/nav-list/NavList.tsx:1` — Exported leaf component "NavList" without React.memo — consider wrapping
- `packages/base-ui/src/components/number-input/NumberInput.tsx:1` — Exported leaf component "NumberInput" without React.memo — consider wrapping
- `packages/base-ui/src/components/popover/Popover.tsx:1` — Exported leaf component "Popover" without React.memo — consider wrapping
- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:1` — Exported leaf component "QueryBuilder" without React.memo — consider wrapping
- `packages/base-ui/src/components/query-authoring/QueryInput.tsx:1` — Exported leaf component "QueryInput" without React.memo — consider wrapping
- `packages/base-ui/src/components/query-authoring/QueryValueInput.tsx:1` — Exported leaf component "QueryValueInput" without React.memo — consider wrapping
- `packages/base-ui/src/components/query-authoring/QueryVariables.tsx:1` — Exported leaf component "QueryVariables" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:1` — Exported leaf component "RadioGroupRoot" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:1` — Exported leaf component "RadioGroupItem" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:1` — Exported leaf component "RadioGroup" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio/Radio.tsx:1` — Exported leaf component "RadioGroupContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio/Radio.tsx:1` — Exported leaf component "Radio" without React.memo — consider wrapping
- `packages/base-ui/src/components/resizable-split-pane/ResizableSplitPane.tsx:1` — Exported leaf component "ResizableSplitPane" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-inspector-controls/InspectorEvidence.tsx:1` — Exported leaf component "Evidence" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-inspector-controls/InspectorEvidence.tsx:1` — Exported leaf component "Footprint" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-inspector-controls/InspectorEvidence.tsx:1` — Exported leaf component "Diagnostics" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-inspector-controls/QueryExplainPanel.tsx:1` — Exported leaf component "QueryExplainPanel" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-inspector-controls/RelationshipPreview.tsx:1` — Exported leaf component "RelationshipPreview" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:1` — Exported leaf component "RelationshipRuleEditor" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:1` — Exported leaf component "ResourceIndexManager" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-workspace-controls/ExploreWorkspace.tsx:1` — Exported leaf component "ExploreWorkspace" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-workspace-controls/ResourceGroupingControls.tsx:1` — Exported leaf component "ResourceGroupingControls" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-workspace-controls/ResourceResultNavigation.tsx:1` — Exported leaf component "ResourceResultNavigation" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-workspace-controls/ResourceScopePicker.tsx:1` — Exported leaf component "ResourceScopePicker" without React.memo — consider wrapping
- `packages/base-ui/src/components/resource-workspace-controls/ResourceSearchResults.tsx:1` — Exported leaf component "ResourceSearchResults" without React.memo — consider wrapping
- `packages/base-ui/src/components/row-list/RowList.tsx:1` — Exported leaf component "RowList" without React.memo — consider wrapping
- `packages/base-ui/src/components/segmented-control/SegmentedControl.tsx:1` — Exported leaf component "SegmentedControl" without React.memo — consider wrapping
- `packages/base-ui/src/components/select/Select.tsx:1` — Exported leaf component "Select" without React.memo — consider wrapping
- `packages/base-ui/src/components/selectable-list/SelectableList.tsx:1` — Exported leaf component "SelectableList" without React.memo — consider wrapping
- `packages/base-ui/src/components/separator/Separator.tsx:1` — Exported leaf component "Separator" without React.memo — consider wrapping
- `packages/base-ui/src/components/sheet/Sheet.tsx:1` — Exported leaf component "Paper" without React.memo — consider wrapping
- `packages/base-ui/src/components/slider/Slider.tsx:1` — Exported leaf component "Slider" without React.memo — consider wrapping
- `packages/base-ui/src/components/split-button/SplitButton.tsx:1` — Exported leaf component "SplitButton" without React.memo — consider wrapping
- `packages/base-ui/src/components/stack/Stack.tsx:1` — Exported leaf component "Stack" without React.memo — consider wrapping
- `packages/base-ui/src/components/stat-row/StatRow.tsx:1` — Exported leaf component "StatRow" without React.memo — consider wrapping
- `packages/base-ui/src/components/status-bar/StatusBar.tsx:1` — Exported leaf component "StatusBar" without React.memo — consider wrapping
- `packages/base-ui/src/components/stepper/Stepper.tsx:1` — Exported leaf component "Stepper" without React.memo — consider wrapping
- `packages/base-ui/src/components/switch/Switch.tsx:1` — Exported leaf component "Switch" without React.memo — consider wrapping
- `packages/base-ui/src/components/table/Table.tsx:1` — Exported leaf component "Table" without React.memo — consider wrapping
- `packages/base-ui/src/components/tabs/Tabs.tsx:1` — Exported leaf component "Tabs" without React.memo — consider wrapping
- `packages/base-ui/src/components/text-area/TextArea.tsx:1` — Exported leaf component "TextArea" without React.memo — consider wrapping
- `packages/base-ui/src/components/text-field/TextField.tsx:1` — Exported leaf component "TextField" without React.memo — consider wrapping
- `packages/base-ui/src/components/time-picker/TimeColumns.tsx:1` — Exported leaf component "TimeColumn" without React.memo — consider wrapping
- `packages/base-ui/src/components/time-picker/TimeColumns.tsx:1` — Exported leaf component "TimeColumns" without React.memo — consider wrapping
- `packages/base-ui/src/components/time-picker/TimePicker.tsx:1` — Exported leaf component "TimePicker" without React.memo — consider wrapping
- `packages/base-ui/src/components/timeline/Timeline.tsx:1` — Exported leaf component "Timeline" without React.memo — consider wrapping
- `packages/base-ui/src/components/toggle-button-group/ToggleButtonGroup.tsx:1` — Exported leaf component "ToggleButtonGroup" without React.memo — consider wrapping
- `packages/base-ui/src/components/toolbar/Toolbar.tsx:1` — Exported leaf component "Toolbar" without React.memo — consider wrapping
- `packages/base-ui/src/components/tooltip/Tooltip.tsx:1` — Exported leaf component "Tooltip" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/TreeList.tsx:1` — Exported leaf component "TreeList" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeContext.tsx:1` — Exported leaf component "TreeConfigContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeContext.tsx:1` — Exported leaf component "TreeStoreContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeContext.tsx:1` — Exported leaf component "TreeActionsContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeReorderContext.tsx:1` — Exported leaf component "TreeReorderContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeReorderContext.tsx:1` — Exported leaf component "TreeItemActivatorContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Caption.tsx:1` — Exported leaf component "Caption" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Code.tsx:1` — Exported leaf component "Code" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Em.tsx:1` — Exported leaf component "Em" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Overline.tsx:1` — Exported leaf component "Overline" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Quote.tsx:1` — Exported leaf component "Quote" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Strong.tsx:1` — Exported leaf component "Strong" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Typography.tsx:1` — Exported leaf component "Typography" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Underline.tsx:1` — Exported leaf component "Underline" without React.memo — consider wrapping
- `packages/base-ui/src/components/visualization/ViewLayout.tsx:1` — Exported leaf component "ViewLayout" without React.memo — consider wrapping
- `packages/base-ui/src/components/visualization/Visualization.tsx:1` — Exported leaf component "VisualizationFields" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/CapacityBar.tsx:1` — Exported leaf component "CapacityBar" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/Gauge.tsx:1` — Exported leaf component "Gauge" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/Heatmap.tsx:1` — Exported leaf component "Heatmap" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/Histogram.tsx:1` — Exported leaf component "Histogram" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/MetricDetails.tsx:1` — Exported leaf component "MetricDetails" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/MetricDisplayPicker.tsx:1` — Exported leaf component "MetricDisplayPicker" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/MetricLegend.tsx:1` — Exported leaf component "MetricLegend" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/MetricValue.tsx:1` — Exported leaf component "MetricValue" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/PodReference.tsx:1` — Exported leaf component "PodReference" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/RankedBars.tsx:1` — Exported leaf component "RankedBars" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/SloSummary.tsx:1` — Exported leaf component "SloSummary" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/SmallMultiples.tsx:1` — Exported leaf component "SmallMultiples" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/Sparkline.tsx:1` — Exported leaf component "Sparkline" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/StackedTimeSeriesChart.tsx:1` — Exported leaf component "StackedTimeSeriesChart" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/StateTimeline.tsx:1` — Exported leaf component "StateTimeline" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/TimeRangeControl.tsx:1` — Exported leaf component "TimeRangeControl" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/TimeSeriesChart.tsx:1` — Exported leaf component "TimeSeriesChart" without React.memo — consider wrapping
- `packages/base-ui/src/metrics/TimeSeriesChart.tsx:1` — Exported leaf component "TimePlot" without React.memo — consider wrapping
- `packages/editors/src/components/cel-query-editor/CelQueryEditor.tsx:1` — Exported leaf component "CelQueryEditor" without React.memo — consider wrapping

### Medium: Inline object prop (Performance)

**4 finding(s)**

- `packages/base-ui/src/components/data-table/context/DataTableContext.tsx:48` — Object literal as prop — creates new reference each render

  ```tsx
  <DataTableContext.Provider value={{ ...value, state, options: table.options }}>
  ```

- `packages/base-ui/src/metrics/PodReference.tsx:177` — Object literal as prop — creates new reference each render

  ```tsx
  details={{
  ```

- `packages/base-ui/src/metrics/PodReference.tsx:196` — Object literal as prop — creates new reference each render

  ```tsx
  format={{ maximumFractionDigits: metric.precision }}
  ```

- `packages/base-ui/src/metrics/SloSummary.tsx:49` — Object literal as prop — creates new reference each render

  ```tsx
  <MetricValue value={budget} unit={{ kind: 'ratio' }} />
  ```

### Medium: Inline array prop (Performance)

**22 finding(s)**

- `packages/base-ui/src/components/date-field/DateField.tsx:69` — Array literal as prop — creates new reference each render

  ```tsx
  className={[styles.root, className].filter(Boolean).join(' ')}
  ```

- `packages/base-ui/src/components/date-picker/Calendar.tsx:222` — Array literal as prop — creates new reference each render

  ```tsx
  <div className={[styles.root, className].filter(Boolean).join(' ')}>
  ```

- `packages/base-ui/src/components/date-picker/DatePicker.tsx:112` — Array literal as prop — creates new reference each render

  ```tsx
  className={[
  ```

- `packages/base-ui/src/components/date-range-picker/DateRangePicker.tsx:145` — Array literal as prop — creates new reference each render

  ```tsx
  className={[
  ```

- `packages/base-ui/src/components/date-time-picker/DateTimePicker.tsx:139` — Array literal as prop — creates new reference each render

  ```tsx
  className={[
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.tsx:77` — Array literal as prop — creates new reference each render

  ```tsx
  className={[styles.explorer, className].filter(Boolean).join(' ')}
  ```

- `packages/base-ui/src/components/file-explorer/FilePreview.tsx:28` — Array literal as prop — creates new reference each render

  ```tsx
  className={[styles.preview, className].filter(Boolean).join(' ')}
  ```

- `packages/base-ui/src/components/file-explorer/FileTree.tsx:208` — Array literal as prop — creates new reference each render

  ```tsx
  <div {...props} className={[styles.tree, className].filter(Boolean).join(' ')}>
  ```

- `packages/base-ui/src/components/keyed-search/KeyedSearch.tsx:200` — Array literal as prop — creates new reference each render

  ```tsx
  aria-describedby={[
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceGroupingControls.tsx:57` — Array literal as prop — creates new reference each render

  ```tsx
  description={[field.applicability, field.reason].filter(Boolean).join(' · ')}
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceSearchResults.tsx:65` — Array literal as prop — creates new reference each render

  ```tsx
  groupOrder={['command', 'setting', 'navigation', 'resource']}
  ```

- `packages/base-ui/src/components/search-input/SearchTrigger.tsx:43` — Array literal as prop — creates new reference each render

  ```tsx
  className={[inputStyles.Root, inputStyles.ControlShell, styles.Trigger, className]
  ```

- `packages/base-ui/src/components/time-picker/TimeColumns.tsx:97` — Array literal as prop — creates new reference each render

  ```tsx
  className={[styles.columnItem, isSelected ? styles.columnItemSelected : '']
  ```

- `packages/base-ui/src/components/time-picker/TimeColumns.tsx:233` — Array literal as prop — creates new reference each render

  ```tsx
  <div className={[styles.columns, className].filter(Boolean).join(' ')}>
  ```

- `packages/base-ui/src/components/time-picker/TimePicker.tsx:111` — Array literal as prop — creates new reference each render

  ```tsx
  className={[styles.root, className].filter(Boolean).join(' ')}
  ```

- `packages/base-ui/src/metrics/MetricLegend.tsx:27` — Array literal as prop — creates new reference each render

  ```tsx
  className={[styles.Legend, virtual ? styles.VirtualLegend : '', className]
  ```

- `packages/base-ui/src/metrics/PodReference.tsx:201` — Array literal as prop — creates new reference each render

  ```tsx
  series={[currentSeries]}
  ```

- `packages/base-ui/src/metrics/SmallMultiples.tsx:37` — Array literal as prop — creates new reference each render

  ```tsx
  <section className={[styles.Multiples, className].filter(Boolean).join(' ')} aria-label={label}>
  ```

- `packages/base-ui/src/metrics/Sparkline.tsx:28` — Array literal as prop — creates new reference each render

  ```tsx
  className={[styles.Sparkline, className].filter(Boolean).join(' ')}
  ```

- `packages/base-ui/src/metrics/TimeSeriesChart.tsx:289` — Array literal as prop — creates new reference each render

  ```tsx
  <div ref={container} className={[styles.Chart, className].filter(Boolean).join(' ')}>
  ```

- `packages/benchmarks/src/base-ui/CheckboxGroup.bench.tsx:10` — Array literal as prop — creates new reference each render

  ```tsx
  <CheckboxGroup value={['a']}>
  ```

- `packages/benchmarks/src/base-ui/ToggleButtonGroup.bench.tsx:10` — Array literal as prop — creates new reference each render

  ```tsx
  <ToggleButtonGroup defaultValue={['bold']}>
  ```

### Medium: Missing keyboard handler (Accessibility)

**13 finding(s)**

- `packages/ai-ui/src/components/chat/AIAttachment.tsx:49` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  {
    size != null && <span className={styles.Size}>{formatSize(size)}</span>;
  }
  ```

- `packages/base-ui/src/components/command-list/CommandList.tsx:456` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/dialog/Dialog.tsx:77` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/drawer/Drawer.tsx:258` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/file-table/FileTable.tsx:153` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <tr
  ```

- `packages/base-ui/src/components/keyed-search/KeyedSearch.tsx:355` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/list/List.tsx:227` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/nav-list/NavList.tsx:157` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/query-authoring/QueryInput.tsx:399` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/resource-workspace-controls/ResourceSearchResults.tsx:108` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  {
    status ? <div role="status">{status}</div> : null;
  }
  ```

- `packages/base-ui/src/components/tag-input/TagInput.tsx:174` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/base-ui/src/components/tree-list/TreeList.tsx:778` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

- `packages/editors/src/components/command-palette/CommandPalette.tsx:148` — Clickable non-button element without onKeyDown/onKeyUp

  ```tsx
  <div
  ```

### Medium: Missing ARIA (Accessibility)

**1 finding(s)**

- `packages/base-ui/src/components/drawer/Drawer.tsx:258` — Interactive div/span without role or aria-* attribute

  ```tsx
  <div
  ```

### Low: Hardcoded opacity (Token/Styling)

**103 finding(s)**

- `packages/ai-ui/src/components/agent/AgentControls.module.css:87` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/ai-ui/src/components/agent/AgentControls.module.css:90` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:74` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:79` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:86` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/ai-ui/src/components/chat/ChatBubble.module.css:91` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:43` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:48` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/ai-ui/src/components/content/AIMarkdown.module.css:30` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:52` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.6;
  ```

- `packages/ai-ui/src/components/reasoning/ThinkingBlock.module.css:55` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/ai-ui/src/components/streaming/StreamingText.module.css:19` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/badge/Badge.module.css:182` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/banner/Banner.module.css:196` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.65;
  ```

- `packages/base-ui/src/components/banner/Banner.module.css:202` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/checkbox/Checkbox.module.css:235` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/checkbox/Checkbox.module.css:243` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:39` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:48` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:59` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:64` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/code-block/CodeBlock.module.css:112` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/code-block/CodeBlock.module.css:123` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/context-menu/ContextMenu.module.css:162` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:313` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:320` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:618` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.4;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:621` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.8;
  ```

- `packages/base-ui/src/components/date-field/DateField.module.css:95` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.85;
  ```

- `packages/base-ui/src/components/dialog/Dialog.module.css:150` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/dialog/Dialog.module.css:153` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/dialog/Dialog.module.css:159` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/dialog/Dialog.module.css:163` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/drawer/Drawer.module.css:276` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/drawer/Drawer.module.css:285` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:312` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:375` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:384` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:390` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:397` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:442` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:448` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:483` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.85;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:99` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:104` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/image/Image.module.css:59` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/image/Image.module.css:63` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/list/List.module.css:212` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/list/List.module.css:219` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/menu/Menu.module.css:151` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:257` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.9;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:449` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:454` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:466` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/popover/Popover.module.css:147` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/progress/Progress.module.css:117` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.4;
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.module.css:71` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.6;
  ```

- `packages/base-ui/src/components/radio/Radio.module.css:199` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/radio/Radio.module.css:207` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/resource-inspector-controls/ResourceInspectorControls.module.css:117` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.6;
  ```

- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:38` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:72` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/select/Select.module.css:373` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/select/Select.module.css:389` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/select/Select.module.css:400` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/skeleton/Skeleton.module.css:64` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/skeleton/Skeleton.module.css:67` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.4;
  ```

- `packages/base-ui/src/components/skeleton/Skeleton.module.css:70` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/slider/Slider.module.css:136` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.52;
  ```

- `packages/base-ui/src/components/sortable-table/SortableHeader.module.css:29` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.7;
  ```

- `packages/base-ui/src/components/sortable-table/SortableHeader.module.css:33` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/spinner/Spinner.module.css:79` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.15;
  ```

- `packages/base-ui/src/components/spinner/Spinner.module.css:118` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/spinner/Spinner.module.css:121` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.15;
  ```

- `packages/base-ui/src/components/spinner/Spinner.module.css:128` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.4;
  ```

- `packages/base-ui/src/components/switch/Switch.module.css:163` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:217` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:220` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.6;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:248` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.8;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:273` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.5;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:279` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:293` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:297` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:309` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:313` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:331` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:335` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:342` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:346` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:370` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:374` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:381` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:385` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:392` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:396` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:403` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/toast/Toast.module.css:407` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/tooltip/Tooltip.module.css:44` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:198` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.8;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:489` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:496` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 1;
  ```

- `packages/base-ui/src/components/visualization/ViewLayout.module.css:15` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.65;
  ```

- `packages/base-ui/src/metrics/TimePlots.module.css:108` — Raw opacity — use --ov-opacity-* token if applicable

  ```css
  opacity: 0.45;
  ```

### Low: Hardcoded z-index (Token/Styling)

**25 finding(s)**

- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:18` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/card/Card.module.css:320` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 3;
  ```

- `packages/base-ui/src/components/card/Card.module.css:367` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/card/Card.module.css:400` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 3;
  ```

- `packages/base-ui/src/components/card/Card.module.css:556` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 0;
  ```

- `packages/base-ui/src/components/card/Card.module.css:691` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 2;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:201` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 2;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:236` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/dialog/Dialog.module.css:31` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/dock-layout/DockLayout.module.css:54` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:7` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 99999;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:444` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:467` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:510` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 2;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:23` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/resizable-split-pane/ResizableSplitPane.module.css:75` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/row-list/RowList.module.css:16` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/select/Select.module.css:427` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/select/Select.module.css:433` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/split-button/SplitButton.module.css:60` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/table/Table.module.css:152` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 0;
  ```

- `packages/base-ui/src/components/table/Table.module.css:159` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/timeline/Timeline.module.css:121` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:196` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

- `packages/base-ui/src/components/visualization/ViewLayout.module.css:16` — Raw z-index — use --ov-z-* token

  ```css
  z-index: 1;
  ```

### Low: Hardcoded font-size (Token/Styling)

**49 finding(s)**

- `packages/ai-ui/src/components/content/AIInlineCitation.module.css:3` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.75em;
  ```

- `packages/ai-ui/src/components/content/AIMarkdown.module.css:105` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.9em;
  ```

- `packages/ai-ui/src/components/content/AISources.module.css:52` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

- `packages/base-ui/src/components/accordion/Accordion.module.css:95` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/components/basic-list/BasicList.module.css:47` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 1.15em;
  ```

- `packages/base-ui/src/components/breadcrumbs/Breadcrumbs.module.css:65` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.85em;
  ```

- `packages/base-ui/src/components/code-block/CodeBlock.module.css:33` — Raw font-size — use --ov-font-* token

  ```css
  --_ov-font-size: 1rem; /* restores original 16px — body token resolves to 14px which removes the size progression */
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:294` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

- `packages/base-ui/src/components/data-table/DataTable.module.css:573` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 32px;
  ```

- `packages/base-ui/src/components/dialog/Dialog.module.css:86` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 1.25em;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:10` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 13px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:66` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 13px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:74` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 13px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:78` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 12px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:86` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:139` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 13px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:154` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 12px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:182` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 12px;
  ```

- `packages/base-ui/src/components/file-explorer/FileExplorer.module.css:194` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 12px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:16` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 12px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:31` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:74` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:83` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:88` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/components/file-table/FileTable.module.css:117` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.module.css:83` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.85em;
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.module.css:88` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.9em;
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.module.css:97` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.9em;
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.module.css:179` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.8em;
  ```

- `packages/base-ui/src/components/query-authoring/QueryAuthoring.module.css:231` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.9em;
  ```

- `packages/base-ui/src/components/select/Select.module.css:394` — Raw font-size — use --ov-font-* token

  ```css
  font-size: calc(var(--_ov-decorator-size) - 2px);
  ```

- `packages/base-ui/src/components/tooltip/Tooltip.module.css:51` — Raw font-size — use --ov-font-* token

  ```css
  --_ov-font-size: 0.6875rem; /* restores original 11px — caption token resolves to 12px which removes the size progressio
  ```

- `packages/base-ui/src/components/tree-list/TreeList.module.css:447` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

- `packages/base-ui/src/components/visualization/Visualization.module.css:38` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 0.85em;
  ```

- `packages/base-ui/src/metrics/ComponentStories.module.css:18` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:41` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:90` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:106` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

- `packages/base-ui/src/metrics/Controls.module.css:154` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

- `packages/base-ui/src/metrics/Metrics.stories.module.css:21` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 20px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:34` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:66` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:86` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 12px;
  ```

- `packages/base-ui/src/metrics/PodReference.module.css:104` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 12px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:23` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 13px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:46` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 11px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:96` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 34px;
  ```

- `packages/base-ui/src/metrics/Scalars.module.css:111` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 13px;
  ```

- `packages/editors/src/components/object-inspector/ObjectInspector.module.css:87` — Raw font-size — use --ov-font-* token

  ```css
  font-size: 10px;
  ```

### Low: Large component file (Convention)

**36 finding(s)**

- `packages/ai-ui/src/components/reasoning/ChainOfThought.tsx:1` — File has 405 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/card/Card.tsx:1` — File has 444 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/combobox/Combobox.tsx:1` — File has 379 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/command-list/CommandList.tsx:1` — File has 768 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/context-menu/ContextMenu.tsx:1` — File has 391 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/data-table/DataTableVirtualBody.tsx:1` — File has 436 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/date-picker/Calendar.tsx:1` — File has 345 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/dock-layout/DockLayout.tsx:1` — File has 550 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/drawer/Drawer.tsx:1` — File has 304 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/editable-list/EditableList.tsx:1` — File has 690 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/editor-tabs/EditorTabs.tsx:1` — File has 444 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/editor-tabs/context/TabDragBroker.tsx:1` — File has 579 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/file-explorer/FileTree.tsx:1` — File has 301 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/file-table/FileTable.tsx:1` — File has 350 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/icon-picker/IconPicker.tsx:1` — File has 400 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/keyed-search/KeyedSearch.tsx:1` — File has 379 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/list/List.tsx:1` — File has 385 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/menu/Menu.tsx:1` — File has 388 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:1` — File has 400 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/query-authoring/QueryAuthoring.tsx:1` — File has 317 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/query-authoring/QueryBuilder.tsx:1` — File has 475 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/query-authoring/QueryInput.tsx:1` — File has 492 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/query-authoring/QueryValueInput.tsx:1` — File has 347 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/resource-inspector-controls/RelationshipRuleEditor.tsx:1` — File has 344 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/resource-inspector-controls/ResourceIndexManager.tsx:1` — File has 415 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/select/Select.tsx:1` — File has 438 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/selectable-list/SelectableList.tsx:1` — File has 479 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/toast/Toast.tsx:1` — File has 349 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/tree-list/TreeList.tsx:1` — File has 1252 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/visualization/ViewLayout.tsx:1` — File has 452 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/metrics/TimeSeriesChart.tsx:1` — File has 440 lines (threshold: 300) — consider splitting
- `packages/benchmarks/src/competitive/implementations/mui-theme/customizations/dataDisplay.tsx:1` — File has 424 lines (threshold: 300) — consider splitting
- `packages/benchmarks/src/competitive/implementations/mui-theme/customizations/inputs.tsx:1` — File has 586 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/code-editor/CodeEditor.tsx:1` — File has 602 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:1` — File has 430 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/terminal/Terminal.tsx:1` — File has 819 lines (threshold: 300) — consider splitting
