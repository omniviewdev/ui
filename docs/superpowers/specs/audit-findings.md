# UI Audit Findings Report

**Date:** 2026-03-11
**Total findings:** 1027
**High:** 61 | **Medium:** 780 | **Low:** 186

---

## Summary by Check

| Severity | Category | Check | Count |
|----------|----------|-------|-------|
| High | Token/Styling | Hardcoded color | 37 |
| High | Token/Styling | Primitive token leakage | 6 |
| High | Convention | Inline style | 18 |
| Medium | Token/Styling | Hardcoded transition | 78 |
| Medium | Token/Styling | Hardcoded spacing | 143 |
| Medium | Token/Styling | Hardcoded radius | 19 |
| Medium | Token/Styling | Hardcoded box-shadow | 26 |
| Medium | Token/Styling | Missing theme coverage | 315 |
| Medium | Token/Styling | Missing IDE alias | 33 |
| Medium | Performance | Inline object prop | 24 |
| Medium | Performance | Inline function prop | 43 |
| Medium | Performance | Inline array prop | 3 |
| Medium | Performance | Missing memo | 86 |
| Medium | Accessibility | Missing keyboard handler | 9 |
| Medium | Accessibility | Missing ARIA | 1 |
| Low | Token/Styling | Hardcoded opacity | 114 |
| Low | Token/Styling | Hardcoded font-size | 21 |
| Low | Token/Styling | Hardcoded z-index | 32 |
| Low | Convention | Large component file | 19 |

---

## Detailed Findings

### High: Hardcoded color (Token/Styling)

**37 finding(s)**

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
- `packages/base-ui/src/components/card/Card.module.css:22` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_card-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.08), 0 1px 4px rgb(0 0 0 / 0.06);
  ```
- `packages/base-ui/src/components/card/Card.module.css:24` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_card-shadow-lg: 0 4px 12px rgb(0 0 0 / 0.14), 0 2px 6px rgb(0 0 0 / 0.10);
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:27` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_ov-dt-pinned-shadow: rgb(0 0 0 / 0.12);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:397` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:414` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.3);
  ```
- `packages/base-ui/src/components/sheet/Sheet.module.css:9` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_sheet-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.08), 0 1px 4px rgb(0 0 0 / 0.06); /* TODO: replace with --ov-shadow-surface-
  ```
- `packages/base-ui/src/components/sheet/Sheet.module.css:11` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_sheet-shadow-lg: 0 4px 12px rgb(0 0 0 / 0.14), 0 2px 6px rgb(0 0 0 / 0.10); /* TODO: replace with --ov-shadow-surface
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:193` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 0 0 1px rgb(0 0 0 / 0.08),
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:194` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 1px 3px rgb(0 0 0 / 0.24);
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:144` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 0 0 1px rgb(0 0 0 / 0.06),
  ```
- `packages/base-ui/src/components/switch/Switch.module.css:145` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  0 1px 2px rgb(0 0 0 / 0.28);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:57` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_toast-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.08), 0 1px 4px rgb(0 0 0 / 0.06);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:59` — rgb/hsl color found — use a semantic token (--ov-color-*)
  ```
  --_toast-shadow-lg: 0 4px 12px rgb(0 0 0 / 0.14), 0 2px 6px rgb(0 0 0 / 0.10);
  ```

### High: Primitive token leakage (Token/Styling)

**6 finding(s)**

- `packages/base-ui/src/components/grid/Grid.module.css:60` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-spacing: 4px; /* --ov-primitive-space-1; no --ov-space-stack-xs semantic token */
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:78` — Primitive token used directly — use a semantic token instead
  ```
  row-gap: 4px; /* --ov-primitive-space-1; no --ov-space-stack-xs semantic token */
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:96` — Primitive token used directly — use a semantic token instead
  ```
  column-gap: 4px; /* --ov-primitive-space-1; no --ov-space-stack-xs semantic token */
  ```
- `packages/base-ui/src/components/image-list/ImageList.module.css:57` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-primitive-space-1, 4px); /* TODO: replace with --ov-space-stack-xs when semantic token is available 
  ```
- `packages/base-ui/src/components/image/Image.module.css:36` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-radius: 4px; /* --ov-primitive-radius-sm; no --ov-radius-sm semantic token (closest: --ov-radius-control at 6px) *
  ```
- `packages/base-ui/src/components/tag-input/TagInput.module.css:4` — Primitive token used directly — use a semantic token instead
  ```
  --_ov-gap: var(--ov-space-stack-xs, var(--ov-primitive-space-1)); /* no --ov-space-stack-xs semantic token yet */
  ```

### High: Inline style (Convention)

**18 finding(s)**

- `packages/ai-ui/src/components/chat/ChatMessageList.tsx:130` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ height: \`${virtualizer.getTotalSize()}px\` }} // eslint-disable-line react/forbid-component-props -- required by
  ```
- `packages/ai-ui/src/components/chat/ChatMessageList.tsx:138` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ // eslint-disable-line react/forbid-component-props -- required by virtualizer
  ```
- `packages/base-ui/src/components/aspect-ratio/AspectRatio.tsx:17` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ '--_aspect-ratio': ratio, ...style } as CSSProperties}
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
- `packages/base-ui/src/components/data-table/DataTableHeader.tsx:40` — style={{}} found — use CSS Modules + data attributes
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
- `packages/base-ui/src/components/drawer/Drawer.tsx:276` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ '--_ov-size': \`${clampedDefaultSize}px\`, ...style } as React.CSSProperties}
  ```
- `packages/base-ui/src/components/editor-tabs/context/TabDragBroker.tsx:236` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```
- `packages/base-ui/src/components/text-area/TextArea.tsx:107` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{ '--_textarea-resize': resize, ...style } as CSSProperties}
  ```
- `packages/base-ui/src/components/tree-list/TreeList.tsx:307` — style={{}} found — use CSS Modules + data attributes
  ```
  <div style={{ height: virtualizer.totalSize, position: 'relative' }}>
  ```
- `packages/base-ui/src/components/tree-list/TreeList.tsx:318` — style={{}} found — use CSS Modules + data attributes
  ```
  style={{
  ```

### Medium: Hardcoded transition (Token/Styling)

**78 finding(s)**

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
- `packages/base-ui/src/components/app-shell/AppShell.module.css:184` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
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
- `packages/base-ui/src/components/card/Card.module.css:205` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/card/Card.module.css:210` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/card/Card.module.css:349` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: indicator-pulse 2s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/card/Card.module.css:364` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:69` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
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
- `packages/base-ui/src/components/data-table/DataTable.module.css:229` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: opacity 0.15s ease;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:325` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition:
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:336` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: transform 0.15s ease;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:494` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
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
- `packages/base-ui/src/components/drawer/Drawer.module.css:281` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:459` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/image/Image.module.css:69` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/meter/Meter.module.css:87` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/progress/Progress.module.css:96` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/resizable-split-pane/ResizableSplitPane.module.css:101` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:89` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:47` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-skeleton-pulse 1.5s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:75` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-skeleton-wave 1.6s linear infinite;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:90` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:94` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:108` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:117` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:59` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-spinner-fade 0.8s linear infinite;
  ```
- `packages/base-ui/src/components/spinner/Spinner.module.css:106` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
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
- `packages/base-ui/src/components/timeline/Timeline.module.css:234` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:238` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  transition: none;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:191` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: ov-toast-pulse 2s ease-in-out infinite;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:384` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:390` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: none;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:270` — Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)
  ```
  animation: spin 0.8s linear infinite;
  ```

### Medium: Hardcoded spacing (Token/Styling)

**143 finding(s)**

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
- `packages/ai-ui/src/components/artifact/AIArtifact.module.css:83` — Raw spacing value — use --ov-space-* token
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
- `packages/ai-ui/src/components/chat/ChatBubble.module.css:18` — Raw spacing value — use --ov-space-* token
  ```
  padding-top: 2px;
  ```
- `packages/ai-ui/src/components/content/AIMarkdown.module.css:22` — Raw spacing value — use --ov-space-* token
  ```
  margin-left: 1px;
  ```
- `packages/ai-ui/src/components/reasoning/ChainOfThought.module.css:89` — Raw spacing value — use --ov-space-* token
  ```
  padding-top: 1px;
  ```
- `packages/ai-ui/src/components/streaming/StreamingText.module.css:11` — Raw spacing value — use --ov-space-* token
  ```
  margin-left: 1px;
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
- `packages/base-ui/src/components/action-list/ActionList.module.css:116` — Raw spacing value — use --ov-space-* token
  ```
  margin-block: 2px;
  ```
- `packages/base-ui/src/components/app-shell/AppShell.module.css:136` — Raw spacing value — use --ov-space-* token
  ```
  padding-top: env(titlebar-area-height, 52px);
  ```
- `packages/base-ui/src/components/banner/Banner.module.css:119` — Raw spacing value — use --ov-space-* token
  ```
  margin-top: 1px;
  ```
- `packages/base-ui/src/components/banner/Banner.module.css:133` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/banner/Banner.module.css:158` — Raw spacing value — use --ov-space-* token
  ```
  margin-top: 1px;
  ```
- `packages/base-ui/src/components/basic-list/BasicList.module.css:25` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline: 6px;
  ```
- `packages/base-ui/src/components/button-group/ButtonGroup.module.css:18` — Raw spacing value — use --ov-space-* token
  ```
  margin-inline-start: -1px;
  ```
- `packages/base-ui/src/components/button-group/ButtonGroup.module.css:23` — Raw spacing value — use --ov-space-* token
  ```
  margin-block-start: -1px;
  ```
- `packages/base-ui/src/components/card/Card.module.css:318` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/card/Card.module.css:466` — Raw spacing value — use --ov-space-* token
  ```
  padding-block: 2px;
  ```
- `packages/base-ui/src/components/card/Card.module.css:513` — Raw spacing value — use --ov-space-* token
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
- `packages/base-ui/src/components/chip/Chip.module.css:5` — Raw spacing value — use --ov-space-* token
  ```
  gap: var(--_ov-group-spacing, 4px); /* fallback: --ov-space-stack-xs; no semantic token for 4px */
  ```
- `packages/base-ui/src/components/clipboard-text/ClipboardText.module.css:4` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.module.css:163` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline-end: 10px;
  ```
- `packages/base-ui/src/components/command-list/CommandList.module.css:101` — Raw spacing value — use --ov-space-* token
  ```
  padding-block: 6px;
  ```
- `packages/base-ui/src/components/command-list/CommandList.module.css:108` — Raw spacing value — use --ov-space-* token
  ```
  margin-block-start: 2px;
  ```
- `packages/base-ui/src/components/command-list/CommandList.module.css:109` — Raw spacing value — use --ov-space-* token
  ```
  padding-block-start: 8px;
  ```
- `packages/base-ui/src/components/command-list/CommandList.module.css:192` — Raw spacing value — use --ov-space-* token
  ```
  gap: 3px;
  ```
- `packages/base-ui/src/components/command-list/CommandList.module.css:222` — Raw spacing value — use --ov-space-* token
  ```
  margin-block: 2px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:206` — Raw spacing value — use --ov-space-* token
  ```
  margin-inline-start: 4px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:382` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:384` — Raw spacing value — use --ov-space-* token
  ```
  padding-block: 6px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:409` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:410` — Raw spacing value — use --ov-space-* token
  ```
  padding-block: 4px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:419` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:421` — Raw spacing value — use --ov-space-* token
  ```
  padding-block: 6px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:432` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:438` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:448` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:449` — Raw spacing value — use --ov-space-* token
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
- `packages/base-ui/src/components/editable-list/EditableList.module.css:12` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline: 4px;
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
- `packages/base-ui/src/components/empty-state/EmptyState.module.css:68` — Raw spacing value — use --ov-space-* token
  ```
  margin-top: 4px;
  ```
- `packages/base-ui/src/components/find-bar/FindBar.module.css:4` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```
- `packages/base-ui/src/components/find-bar/FindBar.module.css:13` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```
- `packages/base-ui/src/components/form-field/FormField.module.css:47` — Raw spacing value — use --ov-space-* token
  ```
  gap: calc(var(--_space-stack-xs) - 1px); /* derived from local alias */
  ```
- `packages/base-ui/src/components/form-field/FormField.module.css:78` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing; not derived from --_space-stack-xs as .Section/.Sec
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:78` — Raw spacing value — use --ov-space-* token
  ```
  row-gap: 4px; /* --ov-primitive-space-1; no --ov-space-stack-xs semantic token */
  ```
- `packages/base-ui/src/components/grid/Grid.module.css:96` — Raw spacing value — use --ov-space-* token
  ```
  column-gap: 4px; /* --ov-primitive-space-1; no --ov-space-stack-xs semantic token */
  ```
- `packages/base-ui/src/components/list/List.module.css:238` — Raw spacing value — use --ov-space-* token
  ```
  margin-block: 2px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:17` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-control-padding-block: 3px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:32` — Raw spacing value — use --ov-space-* token
  ```
  padding: var(--_ov-control-padding-block) 4px var(--_ov-control-padding-block)
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:47` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-control-padding-block: 2px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:52` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-control-padding-block: 4px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:159` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-popup-padding: 4px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:215` — Raw spacing value — use --ov-space-* token
  ```
  margin-block-end: 2px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:220` — Raw spacing value — use --ov-space-* token
  ```
  margin-block-end: 1px;
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.module.css:225` — Raw spacing value — use --ov-space-* token
  ```
  margin-block-end: 3px;
  ```
- `packages/base-ui/src/components/nav-list/NavList.module.css:56` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/nav-list/NavList.module.css:97` — Raw spacing value — use --ov-space-* token
  ```
  gap: 6px;
  ```
- `packages/base-ui/src/components/pagination/Pagination.module.css:6` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-gap: 4px; /* local alias for xs gap; no --ov-space-stack-xs semantic token yet */
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
- `packages/base-ui/src/components/segmented-control/SegmentedControl.module.css:81` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
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
- `packages/base-ui/src/components/select/Select.module.css:225` — Raw spacing value — use --ov-space-* token
  ```
  scroll-padding-block: 18px;
  ```
- `packages/base-ui/src/components/select/Select.module.css:240` — Raw spacing value — use --ov-space-* token
  ```
  margin: 2px 0;
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:112` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline: var(--_ov-item-padding-inline, 8px);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:140` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline: var(--_ov-item-padding-inline, 8px);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:153` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline: var(--_ov-item-padding-inline, 8px);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:160` — Raw spacing value — use --ov-space-* token
  ```
  margin-block-start: var(--_ov-group-label-gap-top, 8px);
  ```
- `packages/base-ui/src/components/selectable-list/SelectableList.module.css:161` — Raw spacing value — use --ov-space-* token
  ```
  margin-block-end: var(--_ov-group-label-gap-after, 4px);
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:102` — Raw spacing value — use --ov-space-* token
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
- `packages/base-ui/src/components/switch/Switch.module.css:184` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/tabs/Tabs.module.css:90` — Raw spacing value — use --ov-space-* token
  ```
  padding: 2px;
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:173` — Raw spacing value — use --ov-space-* token
  ```
  gap: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:224` — Raw spacing value — use --ov-space-* token
  ```
  padding-top: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:229` — Raw spacing value — use --ov-space-* token
  ```
  padding-top: 4px; /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```
- `packages/base-ui/src/components/timeline/Timeline.module.css:287` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline-start: calc(4.5rem + var(--_ov-timeline-gap) + var(--_ov-timeline-icon-size) + var(--_ov-timeline-gap));
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:10` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:12` — Raw spacing value — use --ov-space-* token
  ```
  padding: 16px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:63` — Raw spacing value — use --ov-space-* token
  ```
  gap: 8px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:66` — Raw spacing value — use --ov-space-* token
  ```
  padding: 12px 16px;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:153` — Raw spacing value — use --ov-space-* token
  ```
  gap: 2px;
  ```
- `packages/base-ui/src/components/toggle-button-group/ToggleButtonGroup.module.css:30` — Raw spacing value — use --ov-space-* token
  ```
  margin-left: -1px;
  ```
- `packages/base-ui/src/components/toggle-button-group/ToggleButtonGroup.module.css:45` — Raw spacing value — use --ov-space-* token
  ```
  margin-top: -1px;
  ```
- `packages/base-ui/src/components/toolbar/Toolbar.module.css:28` — Raw spacing value — use --ov-space-* token
  ```
  gap: var(--_ov-toolbar-group-gap, 4px); /* --ov-space-stack-xs; no semantic token for 4px spacing */
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:11` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-padding-inline: 4px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:12` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 4px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:35` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-padding-inline: 2px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:36` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 3px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:42` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-padding-inline: 6px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:43` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 6px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:51` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-padding-inline: 2px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:52` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 3px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:58` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-padding-inline: 6px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:59` — Raw spacing value — use --ov-space-* token
  ```
  --_ov-item-gap: 6px;
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:338` — Raw spacing value — use --ov-space-* token
  ```
  padding-inline: 4px;
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
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:438` — Raw border-radius — use --ov-radius-* token
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

**26 finding(s)**

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
- `packages/base-ui/src/components/card/Card.module.css:34` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: none;
  ```
- `packages/base-ui/src/components/card/Card.module.css:101` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: var(--_card-shadow-sm);
  ```
- `packages/base-ui/src/components/card/Card.module.css:104` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: var(--_card-shadow-md);
  ```
- `packages/base-ui/src/components/card/Card.module.css:107` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: var(--_card-shadow-lg);
  ```
- `packages/base-ui/src/components/card/Card.module.css:355` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--_ov-indicator-color) 40%, transparent 60%);
  ```
- `packages/base-ui/src/components/card/Card.module.css:358` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--_ov-indicator-color) 0%, transparent 100%);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:397` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:414` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.3);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:426` — Raw box-shadow — use --ov-shadow-* token
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
- `packages/base-ui/src/components/sheet/Sheet.module.css:18` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: var(--_ov-shadow);
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:166` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: inset 0 0 0 1px var(--_ov-track-border);
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:192` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow:
  ```
- `packages/base-ui/src/components/slider/Slider.module.css:209` — Raw box-shadow — use --ov-shadow-* token
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
- `packages/base-ui/src/components/switch/Switch.module.css:143` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow:
  ```
- `packages/base-ui/src/components/text-area/TextArea.module.css:116` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```
- `packages/base-ui/src/components/text-field/TextField.module.css:109` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: 0 0 0 1px var(--_ov-focus-ring);
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:71` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: var(--_ov-surface-shadow);
  ```
- `packages/base-ui/src/components/toggle-button/ToggleButton.module.css:7` — Raw box-shadow — use --ov-shadow-* token
  ```
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--_ov-accent-border) 64%, transparent 36%);
  ```

### Medium: Missing theme coverage (Token/Styling)

**315 finding(s)**

- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-fg-inverse missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-whitespace missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-indent-guide missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-indent-guide-active missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-ruler missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-match-bg missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-match-border missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-find-range-bg missing from mode(s): high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-color-editor-link missing from mode(s): high-contrast-dark, high-contrast-light
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
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-comment missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-keyword missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-function missing from mode(s): light, high-contrast-dark, high-contrast-light
- `packages/base-ui/src/theme/styles.css:0` — Token --ov-syntax-style-type missing from mode(s): light, high-contrast-dark, high-contrast-light

### Medium: Missing IDE alias (Token/Styling)

**33 finding(s)**

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
- `packages/ai-ui/src/components/chat/ChatAvatar.module.css:16` — Component in "chat" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-chat-*)
  ```
  background: var(--ov-color-bg-surface-raised);
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
- `packages/ai-ui/src/components/chat/ChatMessageList.module.css:32` — Component in "chat" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-chat-*)
  ```
  background: var(--ov-color-bg-surface-raised);
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
- `packages/ai-ui/src/components/chat/ChatSuggestions.module.css:12` — Component in "chat" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-chat-*)
  ```
  background: var(--ov-color-bg-surface-raised);
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
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:12` — Component in "editor-tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-divider: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:36` — Component in "editor-tabs" uses --ov-color-bg-surface — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-active-bg: var(--ov-color-bg-surface);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:38` — Component in "editor-tabs" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-group-header-bg: var(--ov-color-bg-surface-raised);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:49` — Component in "editor-tabs" uses --ov-color-bg-surface-raised — consider IDE alias (--ov-color-editor-*)
  ```
  var(--ov-color-bg-surface-raised) 92%,
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:58` — Component in "editor-tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-divider: var(--ov-color-border-strong);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:61` — Component in "editor-tabs" uses --ov-color-border-default — consider IDE alias (--ov-color-editor-*)
  ```
  border-bottom-color: var(--ov-color-border-default);
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:79` — Component in "editor-tabs" uses --ov-color-border-strong — consider IDE alias (--ov-color-editor-*)
  ```
  --_ov-tab-active-border: var(--ov-color-border-strong);
  ```
- `packages/editors/src/components/code-editor/CodeEditor.module.css:23` — Component in "code-editor" uses --ov-color-fg-muted — consider IDE alias (--ov-color-editor-*)
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

### Medium: Inline function prop (Performance)

**43 finding(s)**

- `packages/ai-ui/src/components/chat/AIMessageActions.tsx:69` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => onFeedback('positive')}
  ```
- `packages/ai-ui/src/components/chat/AIMessageActions.tsx:80` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => onFeedback('negative')}
  ```
- `packages/ai-ui/src/components/chat/AIMessageEditor.tsx:65` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onChange={(e) => setValue(e.target.value)}
  ```
- `packages/ai-ui/src/components/chat/AIMessageEditor.tsx:85` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => onSave(value)}
  ```
- `packages/ai-ui/src/components/chat/AIModelSelector.tsx:40` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onValueChange={(val) => { if (val != null && onChange) onChange(val); }}
  ```
- `packages/ai-ui/src/components/content/AIImageGeneration.tsx:58` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onLoad={() => setImageLoaded(true)}
  ```
- `packages/ai-ui/src/components/content/AISources.tsx:29` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  <List.Item key={source.id} itemKey={source.id} onClick={() => onNavigate?.(source)}>
  ```
- `packages/ai-ui/src/components/permissions/PermissionRequest.tsx:70` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => setExpanded((v) => !v)}
  ```
- `packages/base-ui/src/components/breadcrumbs/Breadcrumbs.tsx:126` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => {
  ```
- `packages/base-ui/src/components/data-table/DataTableColumnVisibility.tsx:43` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
  ```
- `packages/base-ui/src/components/data-table/DataTablePagination.tsx:32` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => table.firstPage()}
  ```
- `packages/base-ui/src/components/data-table/DataTablePagination.tsx:43` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => table.previousPage()}
  ```
- `packages/base-ui/src/components/data-table/DataTablePagination.tsx:54` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => table.nextPage()}
  ```
- `packages/base-ui/src/components/data-table/DataTablePagination.tsx:65` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => table.lastPage()}
  ```
- `packages/base-ui/src/components/data-table/DataTableToolbar.tsx:24` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onValueChange={(value) => table.setGlobalFilter(value)}
  ```
- `packages/base-ui/src/components/data-table/DataTableVirtualBody.tsx:74` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  ref={(node) => {
  ```
- `packages/base-ui/src/components/dock-layout/DockLayout.tsx:280` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={(e) => {
  ```
- `packages/base-ui/src/components/dock-layout/DockLayout.tsx:313` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onTabClick={(tabId) => onTabClick(leaf.id, tabId)}
  ```
- `packages/base-ui/src/components/drawer/Drawer.tsx:262` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => onOpenChange?.(false)}
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabsViewport.tsx:39` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  ref={(node) => {
  ```
- `packages/base-ui/src/components/find-bar/FindBar.tsx:114` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onChange={(e) => onQueryChange?.(e.target.value)}
  ```
- `packages/base-ui/src/components/find-bar/FindBar.tsx:131` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onPressedChange={() => onCaseSensitiveChange(!caseSensitive)}
  ```
- `packages/base-ui/src/components/find-bar/FindBar.tsx:145` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onPressedChange={() => onWholeWordChange(!wholeWord)}
  ```
- `packages/base-ui/src/components/find-bar/FindBar.tsx:159` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onPressedChange={() => onRegexChange(!regex)}
  ```
- `packages/base-ui/src/components/find-bar/FindBar.tsx:193` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => onOpenChange?.(false)}
  ```
- `packages/base-ui/src/components/find-bar/FindBar.tsx:208` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onChange={(e) => onReplaceTextChange?.(e.target.value)}
  ```
- `packages/base-ui/src/components/list/List.tsx:170` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  ref={(node) => {
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:244` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  render={(removeProps) => (
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:290` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  render={(clearProps) => (
  ```
- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:311` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  render={(triggerProps) => (
  ```
- `packages/base-ui/src/components/nav-list/NavList.tsx:134` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={(event) => {
  ```
- `packages/base-ui/src/components/search-input/SearchInput.tsx:136` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  ref={(node) => {
  ```
- `packages/base-ui/src/components/tag-input/TagInput.tsx:193` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={(e) => {
  ```
- `packages/base-ui/src/components/toast/Toast.tsx:152` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => {
  ```
- `packages/base-ui/src/components/toast/Toast.tsx:166` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={() => startExit()}
  ```
- `packages/base-ui/src/theme/ThemeSwitcher.tsx:22` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onChange={(event) => setTheme(event.target.value as typeof theme)}
  ```
- `packages/base-ui/src/theme/ThemeSwitcher.tsx:36` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onChange={(event) => setDensity(event.target.value as typeof density)}
  ```
- `packages/base-ui/src/theme/ThemeSwitcher.tsx:48` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onChange={(event) => setMotion(event.target.value as typeof motion)}
  ```
- `packages/editors/src/components/command-palette/CommandPalette.tsx:50` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onKeyDown={(e) => {
  ```
- `packages/editors/src/components/command-palette/CommandPalette.tsx:58` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onClick={(e) => e.stopPropagation()}
  ```
- `packages/editors/src/components/command-palette/CommandPalette.tsx:68` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  itemKey={(cmd) => cmd.id}
  ```
- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:188` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onKeyDown={(e) => {
  ```
- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:288` — Arrow function as prop — causes child re-renders, use useCallback
  ```
  onChange={(e) => setSearchQuery(e.target.value)}
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

### Medium: Missing memo (Performance)

**86 finding(s)**

- `packages/ai-ui/src/components/reasoning/BrainIcon.tsx:1` — Exported leaf component "BrainIcon" without React.memo — consider wrapping
- `packages/ai-ui/src/components/reasoning/ChainOfThought.tsx:1` — Exported leaf component "ChainOfThoughtFile" without React.memo — consider wrapping
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
- `packages/base-ui/src/components/description-list/DescriptionList.tsx:1` — Exported leaf component "DescriptionList" without React.memo — consider wrapping
- `packages/base-ui/src/components/dialog/Dialog.tsx:1` — Exported leaf component "Dialog" without React.memo — consider wrapping
- `packages/base-ui/src/components/dock-layout/DockLayout.tsx:1` — Exported leaf component "DockLayout" without React.memo — consider wrapping
- `packages/base-ui/src/components/drawer/Drawer.tsx:1` — Exported leaf component "Drawer" without React.memo — consider wrapping
- `packages/base-ui/src/components/editable-list/EditableList.tsx:1` — Exported leaf component "EditableList" without React.memo — consider wrapping
- `packages/base-ui/src/components/editor-tabs/DetachGhostTab.tsx:1` — Exported leaf component "DetachGhostTab" without React.memo — consider wrapping
- `packages/base-ui/src/components/editor-tabs/EditorTabs.tsx:1` — Exported leaf component "EditorTabs" without React.memo — consider wrapping
- `packages/base-ui/src/components/filter-bar/FilterBar.tsx:1` — Exported leaf component "FilterBar" without React.memo — consider wrapping
- `packages/base-ui/src/components/grid/Grid.tsx:1` — Exported leaf component "Grid" without React.memo — consider wrapping
- `packages/base-ui/src/components/image-list/ImageList.tsx:1` — Exported leaf component "ImageList" without React.memo — consider wrapping
- `packages/base-ui/src/components/image/Image.tsx:1` — Exported leaf component "Image" without React.memo — consider wrapping
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
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:1` — Exported leaf component "RadioGroupRoot" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:1` — Exported leaf component "RadioGroupItem" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio-group/RadioGroup.tsx:1` — Exported leaf component "RadioGroup" without React.memo — consider wrapping
- `packages/base-ui/src/components/radio/Radio.tsx:1` — Exported leaf component "Radio" without React.memo — consider wrapping
- `packages/base-ui/src/components/resizable-split-pane/ResizableSplitPane.tsx:1` — Exported leaf component "ResizableSplitPane" without React.memo — consider wrapping
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
- `packages/base-ui/src/components/timeline/Timeline.tsx:1` — Exported leaf component "Timeline" without React.memo — consider wrapping
- `packages/base-ui/src/components/toggle-button-group/ToggleButtonGroup.tsx:1` — Exported leaf component "ToggleButtonGroup" without React.memo — consider wrapping
- `packages/base-ui/src/components/toolbar/Toolbar.tsx:1` — Exported leaf component "Toolbar" without React.memo — consider wrapping
- `packages/base-ui/src/components/tooltip/Tooltip.tsx:1` — Exported leaf component "Tooltip" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/TreeList.tsx:1` — Exported leaf component "TreeList" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeContext.tsx:1` — Exported leaf component "TreeConfigContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeContext.tsx:1` — Exported leaf component "TreeStoreContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/tree-list/context/TreeContext.tsx:1` — Exported leaf component "TreeActionsContext" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Caption.tsx:1` — Exported leaf component "Caption" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Code.tsx:1` — Exported leaf component "Code" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Em.tsx:1` — Exported leaf component "Em" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Hotkey.tsx:1` — Exported leaf component "Hotkey" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Overline.tsx:1` — Exported leaf component "Overline" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Quote.tsx:1` — Exported leaf component "Quote" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Strong.tsx:1` — Exported leaf component "Strong" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Typography.tsx:1` — Exported leaf component "Typography" without React.memo — consider wrapping
- `packages/base-ui/src/components/typography/Underline.tsx:1` — Exported leaf component "Underline" without React.memo — consider wrapping
- `packages/base-ui/src/theme/ThemeSwitcher.tsx:1` — Exported leaf component "ThemeSwitcher" without React.memo — consider wrapping

### Medium: Missing keyboard handler (Accessibility)

**9 finding(s)**

- `packages/ai-ui/src/components/chat/AIAttachment.tsx:50` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  {size != null && <span className={styles.Size}>{formatSize(size)}</span>}
  ```
- `packages/base-ui/src/components/command-list/CommandList.tsx:442` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```
- `packages/base-ui/src/components/dialog/Dialog.tsx:73` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```
- `packages/base-ui/src/components/drawer/Drawer.tsx:258` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```
- `packages/base-ui/src/components/list/List.tsx:227` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```
- `packages/base-ui/src/components/nav-list/NavList.tsx:148` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```
- `packages/base-ui/src/components/row-list/RowList.tsx:101` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```
- `packages/base-ui/src/components/tag-input/TagInput.tsx:170` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```
- `packages/base-ui/src/components/tree-list/TreeList.tsx:398` — Clickable non-button element without onKeyDown/onKeyUp or role="button"+tabIndex
  ```
  <div
  ```

### Medium: Missing ARIA (Accessibility)

**1 finding(s)**

- `packages/base-ui/src/components/drawer/Drawer.tsx:258` — Interactive div/span without role or aria-* attribute
  ```
  <div
  ```

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
- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:43` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:48` — Raw opacity — use --ov-opacity-* token if applicable
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
- `packages/base-ui/src/components/card/Card.module.css:199` — Raw opacity — use --ov-opacity-* token if applicable
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
- `packages/base-ui/src/components/chip/Chip.module.css:202` — Raw opacity — use --ov-opacity-* token if applicable
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
- `packages/base-ui/src/components/data-table/DataTable.module.css:227` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:234` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:500` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.4;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:503` — Raw opacity — use --ov-opacity-* token if applicable
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
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:413` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.85;
  ```
- `packages/base-ui/src/components/image/Image.module.css:59` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/image/Image.module.css:63` — Raw opacity — use --ov-opacity-* token if applicable
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
- `packages/base-ui/src/components/pagination/Pagination.module.css:78` — Raw opacity — use --ov-opacity-* token if applicable
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
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:52` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:55` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.4;
  ```
- `packages/base-ui/src/components/skeleton/Skeleton.module.css:58` — Raw opacity — use --ov-opacity-* token if applicable
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
- `packages/base-ui/src/components/text-area/TextArea.module.css:124` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/text-field/TextField.module.css:118` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.45;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:183` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:186` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.6;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:214` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.8;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:239` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0.5;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:245` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:259` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:263` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:275` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:279` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:297` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:301` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:308` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:312` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:336` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:340` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:347` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:351` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:358` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 0;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:362` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:369` — Raw opacity — use --ov-opacity-* token if applicable
  ```
  opacity: 1;
  ```
- `packages/base-ui/src/components/toast/Toast.module.css:373` — Raw opacity — use --ov-opacity-* token if applicable
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

**21 finding(s)**

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
- `packages/base-ui/src/components/checkbox/Checkbox.module.css:247` — Raw font-size — use --ov-font-* token
  ```
  font-size: 1rem; /* restores original 16px — body token resolves to 14px which removes the size progression */
  ```
- `packages/base-ui/src/components/code-block/CodeBlock.module.css:33` — Raw font-size — use --ov-font-* token
  ```
  --_ov-font-size: 1rem; /* restores original 16px — body token resolves to 14px which removes the size progression */
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:208` — Raw font-size — use --ov-font-* token
  ```
  font-size: 10px;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:455` — Raw font-size — use --ov-font-* token
  ```
  font-size: 32px;
  ```
- `packages/base-ui/src/components/dialog/Dialog.module.css:85` — Raw font-size — use --ov-font-* token
  ```
  font-size: 1.25em;
  ```
- `packages/base-ui/src/components/radio/Radio.module.css:206` — Raw font-size — use --ov-font-* token
  ```
  font-size: 1rem; /* restores original 16px — body token resolves to 14px which removes the size progression */
  ```
- `packages/base-ui/src/components/select/Select.module.css:297` — Raw font-size — use --ov-font-* token
  ```
  font-size: calc(var(--_ov-decorator-size) - 2px);
  ```
- `packages/base-ui/src/components/tooltip/Tooltip.module.css:124` — Raw font-size — use --ov-font-* token
  ```
  --_ov-font-size: 0.6875rem; /* restores original 11px — caption token resolves to 12px which removes the size progressio
  ```
- `packages/base-ui/src/components/tree-list/TreeList.module.css:340` — Raw font-size — use --ov-font-* token
  ```
  font-size: 10px;
  ```
- `packages/editors/src/components/object-inspector/ObjectInspector.module.css:87` — Raw font-size — use --ov-font-* token
  ```
  font-size: 10px;
  ```

### Low: Hardcoded z-index (Token/Styling)

**32 finding(s)**

- `packages/ai-ui/src/components/content/AIImageGeneration.module.css:18` — Raw z-index — use --ov-z-* token
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
- `packages/base-ui/src/components/card/Card.module.css:217` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/card/Card.module.css:401` — Raw z-index — use --ov-z-* token
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
- `packages/base-ui/src/components/data-table/DataTable.module.css:159` — Raw z-index — use --ov-z-* token
  ```
  z-index: 2;
  ```
- `packages/base-ui/src/components/data-table/DataTable.module.css:514` — Raw z-index — use --ov-z-* token
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
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:396` — Raw z-index — use --ov-z-* token
  ```
  z-index: 1;
  ```
- `packages/base-ui/src/components/editor-tabs/EditorTabs.module.css:440` — Raw z-index — use --ov-z-* token
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
- `packages/base-ui/src/components/drawer/Drawer.tsx:1` — File has 304 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/editable-list/EditableList.tsx:1` — File has 689 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/editor-tabs/EditorTabs.tsx:1` — File has 381 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/list/List.tsx:1` — File has 385 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/menu/Menu.tsx:1` — File has 382 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/multi-select/MultiSelect.tsx:1` — File has 395 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/select/Select.tsx:1` — File has 431 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/selectable-list/SelectableList.tsx:1` — File has 477 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/toast/Toast.tsx:1` — File has 326 lines (threshold: 300) — consider splitting
- `packages/base-ui/src/components/tree-list/TreeList.tsx:1` — File has 705 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/code-editor/CodeEditor.tsx:1` — File has 617 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/object-inspector/ObjectInspector.tsx:1` — File has 421 lines (threshold: 300) — consider splitting
- `packages/editors/src/components/terminal/Terminal.tsx:1` — File has 771 lines (threshold: 300) — consider splitting

