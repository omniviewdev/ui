import type { TabDescriptor, TabGroupDescriptor, TabSegments } from '../types';

export function computeTabSegments(
  tabs: TabDescriptor[],
  groups?: TabGroupDescriptor[],
): TabSegments {
  const pinned: TabDescriptor[] = [];
  const ungrouped: TabDescriptor[] = [];
  const groupMap = new Map<string, TabDescriptor[]>();

  for (const tab of tabs) {
    if (tab.pinned) {
      pinned.push(tab);
    } else if (tab.groupId && groups?.some((g) => g.id === tab.groupId)) {
      let bucket = groupMap.get(tab.groupId);
      if (!bucket) {
        bucket = [];
        groupMap.set(tab.groupId, bucket);
      }
      bucket.push(tab);
    } else {
      ungrouped.push(tab);
    }
  }

  const groupSegments: TabSegments['groups'] = [];
  if (groups) {
    for (const group of groups) {
      const bucket = groupMap.get(group.id);
      if (bucket && bucket.length > 0) {
        groupSegments.push({ group, tabs: bucket });
      }
    }
  }

  return { pinned, groups: groupSegments, ungrouped };
}
