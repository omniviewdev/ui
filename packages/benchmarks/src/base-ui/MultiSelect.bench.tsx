import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { makeOptions, type Option } from '../utils/factories';
import { MultiSelect } from '@omniview/base-ui';

const options100 = makeOptions(100);
const noSelection: Option[] = [];
const selected20 = options100.slice(0, 20);

function MultiSelectBench({ options, value }: { options: Option[]; value?: Option[] }) {
  return (
    <MultiSelect<Option>
      items={options}
      value={value}
      getItemLabel={(item) => item.label}
      getItemValue={(item) => item.value}
      placeholder="Select options"
    />
  );
}

describe('MultiSelect', () => {
  benchRender(
    'mount with 100 options',
    () => <MultiSelectBench options={options100} />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'selection change (0 → 20 selected)',
    {
      initialProps: { options: options100, value: noSelection },
      updatedProps: { options: options100, value: selected20 },
    },
    (props) => <MultiSelectBench {...props} />,
    TIER_1_OPTIONS,
  );

});
