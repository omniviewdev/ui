import { test } from 'vitest';
import { measureRenders } from 'reassure';
import { fireEvent, screen } from '@testing-library/react';
import { Accordion } from '@omniview/base-ui';
import { ThemeWrapper } from '../utils/theme-wrapper';

function FiveItemAccordion() {
  return (
    <Accordion animation="none">
      {Array.from({ length: 5 }, (_, i) => (
        <Accordion.Item key={i} id={`item-${i}`} title={`Section ${i}`}>
          Content for section {i}
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

test('Accordion: mount 5 items', async () => {
  await measureRenders(<FiveItemAccordion />, { wrapper: ThemeWrapper });
});

/**
 * Expanding one section should NOT re-render sibling sections.
 * This catches shared-context over-notification patterns.
 */
test('Accordion: expand one section', async () => {
  await measureRenders(<FiveItemAccordion />, {
    wrapper: ThemeWrapper,
    scenario: async () => {
      fireEvent.click(screen.getByText('Section 2'));
    },
  });
});

/**
 * Expanding then collapsing — tests the full toggle cycle.
 * Render count should be similar to a single expand.
 */
test('Accordion: expand then collapse', async () => {
  await measureRenders(<FiveItemAccordion />, {
    wrapper: ThemeWrapper,
    scenario: async () => {
      const trigger = screen.getByText('Section 2');
      fireEvent.click(trigger);
      fireEvent.click(trigger);
    },
  });
});
