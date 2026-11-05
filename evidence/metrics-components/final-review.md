# Final pre-PR review

Four independent read-only reviews covered declarations, virtualizer/table reactivity, audit policy, and the standalone metrics API. All five correctness findings were reproduced and fixed. No known blocking findings remain.

| Finding                                                | Fix and observed proof                                                                                                                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Managed output omitted the declared metrics type entry | Enable managed declaration entry insertion. Before: `metrics.d.ts` absent, nested declaration present. After: every package export target exists, including the metrics forwarding entry.           |
| Non-null assertions bypassed style policy              | Unwrap `TSNonNullExpression`. Before: classifier retained assertion wrapper. After: ordinary color style rejected, CSS-variable style accepted.                                                     |
| Narrowed table subscriptions kept stale body rows      | Read row/layout getters at the subscribed context boundary. Before: sorting/filtering left all three original rows visible. After: ascending Alpha/Bravo/Zulu, then only Bravo.                     |
| Pinning updates left virtual body cells sticky         | Derive column layout through an ordinary helper with immutable layout inputs. Before: body stayed pinned after header unpinned. After: unpin makes body cells static; repin restores start pinning. |
| Pagination count stayed stale after filtering          | Read totals at the subscribed context boundary. Before: one visible row but three total rows. After: one visible row and one total row.                                                             |

Fresh post-fix validation passes: zero lint warnings/errors, formatting, package typechecks, zero High audit findings, 2,266 package tests, all library builds, 19 tooling tests, showcase typecheck/build, static Storybook build, and strict packed-consumer checks without `skipLibCheck` or consumer patches. Regression browser tabs reported no application errors. Existing runtime test ASTs were compared across 72 modified tracked test files; no differences after normalizing formatting and parentheses. Test assertions/expectations were not revised. Temporary browser fixtures were removed.

## Release/API review

The editor registry previously exported a permanently disabled `debugState()` method. Its removal is now explicit in release notes and marked as an editor **minor**, not patch, release. Existing callers must remove that debug-only call. Metrics components ship independently; this package does not wire the IDE or change metrics providers.

## Review packaging

Use one release PR, with mechanical formatting isolated first. Splitting coupled build/metrics changes into separate PRs would create unverified intermediate package contracts.

1. `style: normalize repository formatting`: 442 tracked paths exactly match current Prettier output of their HEAD contents.
2. `feat(base-ui): ship standalone metrics components and clean development checks`: remaining 68 tracked paths, new metrics sources, declaration tooling, patch, changesets, and evidence. Mixed formatting/functional paths stay together.

[Exact split manifest](./review-split.json) · [Prepared PR description](./pr-body.md) · [All component links](./component-stories.md) · [Screenshots and interaction evidence](./review.md)

No files staged, commits created, branch pushed, PR opened, merge performed, or package published. PR-description image URLs point at the intended branch and become available after pushing it; local screenshots are already available here.

Related epic: https://github.com/omniviewdev/omniview/issues/388 (already closed; this is an independent component-release status update, not a claim of new IDE integration).

Remaining non-blocking advisories are documented in [clean development checks](./clean-development-checks.md); none were suppressed or re-baselined. Desktop Storybook stays running at http://127.0.0.1:48637/.

GitHub tracking status: [epic update](https://github.com/omniviewdev/omniview/issues/388#issuecomment-6670831780).
