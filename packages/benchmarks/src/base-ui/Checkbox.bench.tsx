import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { Checkbox } from '@omniview/base-ui';

describe('Checkbox', () => {
  benchRender('mount', () => <Checkbox />);

  benchRerender(
    'checked toggle',
    { initialProps: { checked: false }, updatedProps: { checked: true } },
    (props) => <Checkbox {...props} />,
  );

  benchMountMany('mount 1000', 1000, (i) => <Checkbox key={i} />);
});
