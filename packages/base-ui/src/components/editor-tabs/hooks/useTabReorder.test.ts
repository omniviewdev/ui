import { describe, expect, it } from 'vitest';
import type { TabDescriptor } from '../types';

/**
 * Extract the lane logic from useTabReorder so we can unit-test constraints
 * without rendering hooks. This mirrors the getTabLane function in the hook.
 */
function getTabLane(tab: TabDescriptor): string {
  if (tab.pinned) return 'pinned';
  if (tab.groupId) return tab.groupId;
  return 'ungrouped';
}

function canReorder(
  activeTab: TabDescriptor,
  overTab: TabDescriptor,
  options: { allowReorderAcrossPinnedBoundary: boolean; allowReorderAcrossGroups: boolean },
): boolean {
  const activeLane = getTabLane(activeTab);
  const overLane = getTabLane(overTab);

  if (activeLane === overLane) return true;

  const crossesPinned = activeLane === 'pinned' || overLane === 'pinned';
  if (crossesPinned) return options.allowReorderAcrossPinnedBoundary;
  return options.allowReorderAcrossGroups;
}

const pinnedTab: TabDescriptor = { id: 'p1', title: 'pinned.ts', pinned: true };
const ungroupedTab: TabDescriptor = { id: 'u1', title: 'ungrouped.ts' };
const groupATab: TabDescriptor = { id: 'a1', title: 'a.ts', groupId: 'groupA' };
const groupBTab: TabDescriptor = { id: 'b1', title: 'b.ts', groupId: 'groupB' };

describe('useTabReorder constraints', () => {
  describe('getTabLane', () => {
    it('returns "pinned" for pinned tabs', () => {
      expect(getTabLane(pinnedTab)).toBe('pinned');
    });

    it('returns groupId for grouped tabs', () => {
      expect(getTabLane(groupATab)).toBe('groupA');
    });

    it('returns "ungrouped" for ungrouped tabs', () => {
      expect(getTabLane(ungroupedTab)).toBe('ungrouped');
    });
  });

  describe('canReorder', () => {
    const defaultOptions = { allowReorderAcrossPinnedBoundary: false, allowReorderAcrossGroups: false };

    it('allows reorder within the same lane', () => {
      const tab2: TabDescriptor = { id: 'u2', title: 'other.ts' };
      expect(canReorder(ungroupedTab, tab2, defaultOptions)).toBe(true);
    });

    it('rejects pinned → ungrouped by default', () => {
      expect(canReorder(pinnedTab, ungroupedTab, defaultOptions)).toBe(false);
    });

    it('rejects ungrouped → pinned by default', () => {
      expect(canReorder(ungroupedTab, pinnedTab, defaultOptions)).toBe(false);
    });

    it('allows pinned → ungrouped when allowReorderAcrossPinnedBoundary is true', () => {
      expect(canReorder(pinnedTab, ungroupedTab, { ...defaultOptions, allowReorderAcrossPinnedBoundary: true })).toBe(true);
    });

    it('rejects group A → group B by default', () => {
      expect(canReorder(groupATab, groupBTab, defaultOptions)).toBe(false);
    });

    it('allows group A → group B when allowReorderAcrossGroups is true', () => {
      expect(canReorder(groupATab, groupBTab, { ...defaultOptions, allowReorderAcrossGroups: true })).toBe(true);
    });

    it('allows reorder within same group', () => {
      const groupATab2: TabDescriptor = { id: 'a2', title: 'a2.ts', groupId: 'groupA' };
      expect(canReorder(groupATab, groupATab2, defaultOptions)).toBe(true);
    });

    it('rejects pinned → group by default', () => {
      expect(canReorder(pinnedTab, groupATab, defaultOptions)).toBe(false);
    });
  });
});
