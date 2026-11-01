---
'@omniviewdev/base-ui': minor
'@omniviewdev/editors': patch
---

Add provider-neutral FileTree, FileExplorer, FilePreview, and optional useFileSystem integration with typed metadata, ancestor-preserving filtering, cancellable paging/search/preview, batched live changes, bounded paused queues, and capability-driven actions. Add reusable ShortcutSummary and KeyChord components with accessible platform-aware keycaps.

Correct TreeList virtualized keyboard reveal, sibling ARIA metadata, responsive row estimates, active-descendant retention, and caller overscan. Preserve compact explorer density across desktop and phone surfaces, retain manual scroll across sizing-only and append-only updates, and preserve mainline keyboard activation and independent drag-source pinning.

Fix DiffViewer model ownership and deferred StrictMode resource acquisition. Resolve bundled Monaco workers relative to the editor package instead of the consuming application's root.
