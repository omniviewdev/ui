import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeTags } from '../utils/factories';
import { TagInput } from '@omniview/base-ui';

const tags10 = makeTags(10);
const tags20 = makeTags(20);
const tags5 = makeTags(5);

const noop = () => {};

function TagInputBench({ tags }: { tags: string[] }) {
  return <TagInput value={tags} onChange={noop} placeholder="Add tags..." />;
}

describe('TagInput', () => {
  benchRender(
    'mount with 10 tags',
    () => <TagInputBench tags={tags10} />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'tags change (10 → 20)',
    { initialProps: { tags: tags10 }, updatedProps: { tags: tags20 } },
    (props) => <TagInputBench {...props} />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 100 instances (5 tags each)',
    100,
    (i) => <TagInputBench key={i} tags={tags5} />,
    TIER_1_OPTIONS,
  );
});
