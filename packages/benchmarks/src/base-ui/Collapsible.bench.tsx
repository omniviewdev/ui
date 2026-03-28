import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@omniviewdev/base-ui';

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
      initialProps: { open: false },
      updatedProps: { open: true },
    },
    (props) => (
      <Collapsible open={props.open}>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Collapsible content here</CollapsibleContent>
      </Collapsible>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 100', 100, (i) => (
    <Collapsible key={i}>
      <CollapsibleTrigger>Section {i}</CollapsibleTrigger>
      <CollapsibleContent>Content {i}</CollapsibleContent>
    </Collapsible>
  ), TIER_2_OPTIONS);
});
