---
'@omniviewdev/base-ui': minor
---

Let `EditorTabs` move tabs between separate documents such as native windows. `TabDragBrokerProvider` accepts a `transport` that streams a drag to other documents and receives remote hovers and drops, and the broker now resolves exactly one outcome per drag: attached elsewhere (`onTabTransferred` on the source strip), torn off (`onDetachCommit`), or cancelled (Escape or revert, `onCancel`). Strips and drop zones only exchange tabs of the same `dragType`, drop zones can set `expandY`, and a tab can opt out of detaching with `detachable: false`.

The transport and `onDetachCommit` receive the pointer in both client and screen coordinates. Screen coordinates are not global in every webview (WebKitGTK reports them relative to the native window), so a host that places native windows should map the client point with its own window bounds.

Breaking for direct broker users: `beginSession(session, pointer)` takes a pointer with client and screen coordinates, and in broker mode `onDetachCommit` fires only for a tear-off.
