---
'@omniviewdev/base-ui': patch
---

Start the delayed pulse of loading metric cells from one shared timer instead of one timer per cell, so a scrolling table no longer sets and clears a native timer for every row it mounts and unmounts.

Paint row divider lines behind the unrendered part of a fixed-row-height `DataTable.VirtualBody`, so a region the virtualizer has not rendered yet reads as empty rows instead of a void.
