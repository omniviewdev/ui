# Reasoning Components — Refactor Notes

## Pending refactors to align with base-ui

These should be done when implementing the new components, to bring existing code into alignment.

### 1. Use base-ui `Collapsible` instead of hand-rolled CSS Grid collapse

**Files:**
- `ThinkingBlock.tsx` — replace `.CollapseWrapper` / `.CollapseInner` divs with `<Collapsible>` / `<CollapsibleContent>`
- `ChainOfThought.tsx` — same pattern
- `ThinkingBlock.module.css` — remove `.CollapseWrapper`, `.CollapseInner` rules
- `ChainOfThought.module.css` — remove `.CollapseWrapper`, `.CollapseInner`, `.CollapseContent` rules

**Current pattern (duplicated in both):**
```tsx
<div className={styles.CollapseWrapper} aria-hidden={!isOpen}>
  <div className={styles.CollapseInner}>
    {content}
  </div>
</div>
```

**Target pattern:**
```tsx
<Collapsible open={isOpen} onOpenChange={toggle}>
  <CollapsibleContent>
    {content}
  </CollapsibleContent>
</Collapsible>
```

### 2. Use base-ui `Chip` for search result tags

**Files:**
- `ChainOfThought.tsx` — `ChainOfThoughtSearchResult` currently renders `<span className={styles.StepTag}>`
- `ChainOfThought.module.css` — `.StepTag` styles duplicate Chip styling

**Current:**
```tsx
<span className={cn(styles.StepTag, className)} {...rest}>
  {children ?? label}
</span>
```

**Target:**
```tsx
<Chip size="sm" variant="soft" className={cn(styles.StepTag, className)} {...rest}>
  {children ?? label}
</Chip>
```

This aligns with how `AIFollowUp`, `AIContextIndicator`, `AICostIndicator`, and `PermissionBadge` already use `Chip`.

### 3. Deduplicate BrainIcon

**Files:**
- `ThinkingBlock.tsx` — defines `BrainIcon` (lines 20-44)
- `ChainOfThought.tsx` — defines identical `BrainIcon` (lines 21-45)

**Target:** Move to `../../system/icons.ts` as a shared export, or keep in ThinkingBlock and import from there in ChainOfThought. ThinkingBlock already exports it as `ThinkingBrainIcon`.

### 4. Deduplicate DefaultStepDot

**File:** `ChainOfThought.tsx` — inline SVG `DefaultStepDot` component (lines 328-351)

**Target:** Move to `../../system/icons.ts` or keep as internal to ChainOfThought (it's only used there). No action needed unless reused elsewhere.
