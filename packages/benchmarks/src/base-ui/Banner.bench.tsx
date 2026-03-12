import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Banner } from '@omniview/base-ui';

describe('Banner', () => {
  benchRender(
    'mount',
    () => (
      <Banner>
        <Banner.Title>Notice</Banner.Title>
        <Banner.Content>This is a banner message.</Banner.Content>
      </Banner>
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
      <Banner {...props}>
        <Banner.Title>Notice</Banner.Title>
        <Banner.Content>This is a banner message.</Banner.Content>
      </Banner>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 50', 50, (i) => (
    <Banner key={i}>
      <Banner.Title>Notice {i}</Banner.Title>
      <Banner.Content>Message {i}</Banner.Content>
    </Banner>
  ), TIER_2_OPTIONS);
});
