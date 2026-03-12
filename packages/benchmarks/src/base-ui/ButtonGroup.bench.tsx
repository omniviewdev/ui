import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { ButtonGroup } from '@omniview/base-ui';

describe('ButtonGroup', () => {
  benchRender(
    'mount with 3 buttons',
    () => (
      <ButtonGroup>
        <ButtonGroup.Button>One</ButtonGroup.Button>
        <ButtonGroup.Button>Two</ButtonGroup.Button>
        <ButtonGroup.Button>Three</ButtonGroup.Button>
      </ButtonGroup>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'variant change',
    {
      initialProps: { variant: 'soft' as const },
      updatedProps: { variant: 'outline' as const },
    },
    (props) => (
      <ButtonGroup {...props}>
        <ButtonGroup.Button>One</ButtonGroup.Button>
        <ButtonGroup.Button>Two</ButtonGroup.Button>
        <ButtonGroup.Button>Three</ButtonGroup.Button>
      </ButtonGroup>
    ),
    TIER_2_OPTIONS,
  );
});
