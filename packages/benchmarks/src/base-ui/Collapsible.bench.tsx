import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@omniview/base-ui';

describe('Collapsible', () => {
  benchRender(
    'mount',
    () => (
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Collapsible content here</CollapsibleContent>
      </Collapsible>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'open toggle',
    {
      initialProps: { open: false as boolean },
      updatedProps: { open: true as boolean },
    },
    (props) => (
      <Collapsible open={props.open}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Collapsible content here</CollapsibleContent>
      </Collapsible>
    ),
    TIER_2_OPTIONS,
  );
});
