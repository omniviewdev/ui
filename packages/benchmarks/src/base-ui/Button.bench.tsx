import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { Button } from '@omniview/base-ui';

describe('Button', () => {
  benchRender('mount', () => <Button>Click</Button>);

  benchRender('mount with decorators', () => (
    <Button startDecorator={<span>+</span>} endDecorator={<span>→</span>}>
      Action
    </Button>
  ));

  benchRerender(
    'variant change',
    { initialProps: { variant: 'solid' as const }, updatedProps: { variant: 'outline' as const } },
    (props) => <Button {...props}>Click</Button>,
  );

  benchMountMany('mount 1000', 1000, (i) => <Button key={i}>Item {i}</Button>);
});
