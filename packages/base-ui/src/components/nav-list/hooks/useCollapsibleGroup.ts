import { useControllableState } from '../../list/hooks/useControllableState';

interface UseCollapsibleGroupOptions {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function useCollapsibleGroup({
  expanded: expandedProp,
  defaultExpanded = true,
  onExpandedChange,
}: UseCollapsibleGroupOptions) {
  const [expanded, setExpanded] = useControllableState(
    expandedProp,
    defaultExpanded,
    onExpandedChange,
  );

  const toggle = () => setExpanded((prev) => !prev);

  return { expanded, toggle };
}
