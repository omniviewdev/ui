import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeTags } from '../utils/factories';
import { FilterBar } from '@omniview/base-ui';

const filters10 = makeTags(10);
const filters20 = makeTags(20);
const filters5 = makeTags(5);

function FilterBarBench({ filters }: { filters: string[] }) {
  return (
    <FilterBar>
      {filters.map((filter) => (
        <FilterBar.Chip key={filter} onRemove={() => {}}>
          {filter}
        </FilterBar.Chip>
      ))}
      <FilterBar.Add />
    </FilterBar>
  );
}

describe('FilterBar', () => {
  benchRender(
    'mount with 10 filters',
    () => <FilterBarBench filters={filters10} />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'filters change (10 → 20)',
    { initialProps: { filters: filters10 }, updatedProps: { filters: filters20 } },
    (props) => <FilterBarBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 100 instances (5 filters each)',
    100,
    (i) => <FilterBarBench key={i} filters={filters5} />,
    TIER_1_OPTIONS,
  );
});
