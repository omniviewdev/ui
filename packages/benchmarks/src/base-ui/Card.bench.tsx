import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { Card } from '@omniviewdev/base-ui';

describe('Card', () => {
  benchRender(
    'mount with Header/Title/Body',
    () => (
      <Card>
        <Card.Header>
          <Card.Title>Title</Card.Title>
        </Card.Header>
        <Card.Body>Body content</Card.Body>
      </Card>
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
      <Card {...props}>
        <Card.Header>
          <Card.Title>Title</Card.Title>
        </Card.Header>
        <Card.Body>Body content</Card.Body>
      </Card>
    ),
    TIER_2_OPTIONS,
  );

  benchMountMany('mount 100', 100, (i) => (
    <Card key={i}>
      <Card.Header><Card.Title>Card {i}</Card.Title></Card.Header>
      <Card.Body>Content {i}</Card.Body>
    </Card>
  ), TIER_2_OPTIONS);
});
