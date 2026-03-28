import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Button } from '@omniviewdev/base-ui';

describe('Button', () => {
  benchRender('mount', () => <Button>Click</Button>, TIER_2_OPTIONS);
  benchRender('mount with decorators', () => (
    <Button startDecorator={<span>+</span>} endDecorator={<span>→</span>}>
      Action
    </Button>
  ), TIER_2_OPTIONS);
  benchRerender(
    'variant change',
    { initialProps: { variant: 'solid' as const }, updatedProps: { variant: 'outline' as const } },
    (props) => <Button {...props}>Click</Button>,
    TIER_2_OPTIONS,
  );
  benchMountMany('mount 1000', 1000, (i) => <Button key={i}>Item {i}</Button>, TIER_2_OPTIONS);
});
