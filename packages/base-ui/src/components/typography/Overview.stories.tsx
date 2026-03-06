import type { Meta, StoryObj } from '@storybook/react';
import { Blockquote } from './Blockquote';
import { Caption } from './Caption';
import { Code } from './Code';
import { Em } from './Em';
import { Heading } from './Heading';
import { Hotkey } from './Hotkey';
import { Link } from './Link';
import { Overline } from './Overline';
import { Quote } from './Quote';
import { Strong } from './Strong';
import { Text } from './Text';
import { Underline } from './Underline';

const meta = {
  title: 'Typography/Overview',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 700 }}>
      <Overline>Workspace Settings</Overline>
      <Heading level={2}>Runtime Policies</Heading>
      <Text as="p" tone="muted">
        Use <Code>/settings/runtime</Code> to configure defaults. Press <Hotkey>CMD+K</Hotkey> to
        open command search.
      </Text>
      <Blockquote variant="emphasis">
        Changes apply immediately to active sessions and persisted workspace settings.
      </Blockquote>
      <Blockquote variant="plain">
        Perfect typography is certainly the most elusive of all arts. Sculpture in stone alone comes
        near it in obstinacy.
      </Blockquote>
      <Caption>Last updated 2m ago</Caption>
      <Text as="p">
        <Link href="https://example.com/docs/runtime" onClick={(event) => event.preventDefault()}>
          Open runtime documentation
        </Link>{' '}
        and <Underline>review required fields</Underline>.
      </Text>
      <Text as="p" truncate style={{ maxWidth: 340 }}>
        Long namespace names or file paths can be truncated consistently across typography
        primitives.
      </Text>
      <Text as="p">
        <Em>Emphasis</Em> · <Strong>strong importance</Strong> · <Quote>quoted guidance</Quote>
      </Text>
    </div>
  ),
};
