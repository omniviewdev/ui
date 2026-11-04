# IconPicker

UI#102 adds a controlled icon chooser at `packages/base-ui/src/components/icon-picker`.

```tsx
import { IconPicker, type IconPickerItem } from '@omniviewdev/base-ui';

const items: IconPickerItem[] = [
  { id: 'folder', kind: 'preset', label: 'Folder', icon: <FolderIcon /> },
  { id: 'rocket', kind: 'emoji', label: 'Rocket', emoji: '🚀', keywords: ['launch'] },
  { id: asset.id, kind: 'image', label: asset.name, src: asset.dataUrl, removable: true },
];

<IconPicker
  items={items}
  value={iconId}
  onValueChange={setIconId}
  onUpload={handleUpload}
  uploadPending={uploadPending}
  uploadError={uploadError}
  onRemove={handleRemove}
  removePending={removePending}
  removeError={removeError}
/>;
```

## Public contract

- `value?: string` and `onValueChange(id: string | undefined)` are controlled. Clearing emits `undefined`. Selection does not mutate items.
- `items` is a readonly array. IDs must be unique. Every item has `id`, `label`, optional `keywords`, and optional `disabled`.
- The discriminated union contains `preset` with trusted application `icon: ReactNode`, `emoji` with `emoji: string`, or `image` with `src: string` and optional `removable: boolean`.
- `size` supports `xs`, `sm`, `md`, `lg`, and `xl`. Density, text scale, themes, and motion inherit the enclosing base-ui scope.
- The trigger is an icon-only square built on `IconButton`, without a visible name or chevron. Presets, emoji, and raster artwork share centered, tier-scaled bounds.
- `label` supplies the accessible trigger name and popup title; the selected item's name remains accessible without changing button geometry. `searchPlaceholder` changes search placeholder copy.
- `disabled` disables the trigger and prevents displaying a popup. Individual disabled items stay visible but cannot receive selection or keyboard focus.
- `open`, `defaultOpen`, and `onOpenChange` optionally control popup visibility. The default is internally managed.
- Standard div attributes, including `className`, `style`, and `id`, apply to the owning wrapper.
- `accept?: readonly IconPickerRasterMimeType[]` restricts the native upload picker to a safe raster MIME subset. The exported `ICON_PICKER_RASTER_TYPES` default contains `image/png`, `image/jpeg`, `image/gif`, and `image/webp`. An empty subset disables uploading. For a PNG/JPEG/WebP-only decoder, pass `accept={['image/png', 'image/jpeg', 'image/webp']}`. This hint does not narrow existing image previews or replace caller-side validation.

## File and asset ownership

The picker calls `onUpload(file)` once per file selection, including selecting the same file again. It does not upload, decode arbitrary files, create persistent assets, invent successful items, or change the selected value on upload. The caller must:

1. Set `uploadPending` and clear prior `uploadError` before starting asynchronous work.
2. Validate allowed raster MIME type, actual file signature, encoded size, successful decode, and decoded dimensions. A file-input `accept` hint is not validation.
3. Normalize to a safe raster if needed, persist the asset, update `items`, and explicitly set `value` on success.
4. Catch failures, set `uploadError`, and clear `uploadPending` in `finally`.

The callback returns `void` intentionally: pending and error props, not an ignored promise or optimistic local asset, represent the caller's operation. Async handlers must catch their own errors. While either operation is pending, choices, clear, upload, and removal are disabled. Search and Escape remain usable.

Removal appears only for a selected `image` with `removable: true` when `onRemove` exists. `onRemove(id)` does not clear selection or remove items. The caller owns confirmation, in-use policy, persistence, `removePending`, `removeError`, and resulting value/items. Applications can preserve an inline raster fallback before deleting a reusable asset. Mark protected images non-removable.

The `UploadAndLibrary` story is a working caller example. It accepts real local files, checks MIME/signature/size, decodes the image, checks dimensions, converts it to a bounded PNG, adds a named item, selects it, and removes caller-owned assets. Its in-memory library intentionally resets when the story reloads; persistence belongs to the application.

## Image safety

Only base64 PNG, JPEG, GIF, or WebP data URLs with matching raster signatures render. Same-origin blob URLs are resolved locally and checked for both MIME and raster signature before an image element receives the source. Remote, relative, protocol-relative, foreign-origin blob, raw SVG, HTML, and mislabeled non-raster sources stay on a fallback. Failed decode or revoked blob previews also show a fallback. No user HTML or SVG is injected, and rejected sources never cause arbitrary remote image requests.

Header checks are a preview boundary, not a replacement for caller-side full decode, dimensions, upload-size limits, or content policy. The caller owns blob URL lifetime and must keep a selected/visible blob alive, then revoke it when no longer used. Preset React nodes must come from trusted application code, not parsed user markup.

The popup portal stays inside the owning wrapper, including an initially open popup. Native themes and custom token overrides therefore remain scoped. Avoid placing the wrapper in an ancestor that clips overlays; the positioner uses fixed positioning.

## Keyboard and assistive technology

Choices use native `button type="button"` controls and expose persistent selection through `aria-pressed`. Focus and selection are separate. A single roving tab stop avoids tabbing through the whole library. Arrow keys browse the six-column grid, respecting right-to-left horizontal direction; Home and End reach the first and last enabled choice. Enter or Space selects a focused choice. From search, ArrowDown/ArrowUp enters the first/last enabled choice and Enter selects the first enabled search result. Input-method composition does not commit a choice. Escape dismisses the popover and returns focus to its trigger.

Search matches labels, keywords, and emoji without changing the selected icon. Result counts are announced politely. Caller errors use alerts. Pending operations expose status and `aria-busy`. Clear and upload controls remain outside the choice group. CommandList was inspected but not reused: its active-descendant command options conflate active results with selection, while this chooser needs native focusable controls and persistent selection.

## Story routes

- `components-iconpicker--playground`
- `components-iconpicker--search-and-keyboard`
- `components-iconpicker--selected-and-disabled`
- `components-iconpicker--upload-and-library`
- `components-iconpicker--empty-and-errors`
- `components-iconpicker--theme-size-matrix`: built-in catalog × both densities × all five sizes.
- `components-iconpicker--nested-custom-reduced-motion`

Regression files cover keyboard selection/focus, disabled and pending controls, controlled selection/clear/removal, upload retries and caller errors, all sizes, local theme containment, unsafe source rejection, raster signatures, local blob verification, source changes, aborts, and revoked blobs. Integration owns execution and visual capture.
