import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Accordion } from '@omniview/base-ui';

describe('Accordion', () => {
  benchRender(
    'mount with 3 items',
    () => (
      <Accordion>
        <Accordion.Item id="a" title="Section A">Content A</Accordion.Item>
        <Accordion.Item id="b" title="Section B">Content B</Accordion.Item>
        <Accordion.Item id="c" title="Section C">Content C</Accordion.Item>
      </Accordion>
    ),
    TIER_2_OPTIONS,
  );

  benchRerender(
    'expand toggle',
    {
      initialProps: { expanded: [] as string[] },
      updatedProps: { expanded: ['a'] as string[] },
    },
    (props) => (
      <Accordion defaultExpanded={props.expanded}>
        <Accordion.Item id="a" title="Section A">Content A</Accordion.Item>
        <Accordion.Item id="b" title="Section B">Content B</Accordion.Item>
        <Accordion.Item id="c" title="Section C">Content C</Accordion.Item>
      </Accordion>
    ),
    TIER_2_OPTIONS,
  );
});
