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

type TypographyCompound = typeof Text & {
  Heading: typeof Heading;
  Blockquote: typeof Blockquote;
  Caption: typeof Caption;
  Code: typeof Code;
  Em: typeof Em;
  Link: typeof Link;
  Overline: typeof Overline;
  Quote: typeof Quote;
  Strong: typeof Strong;
  Underline: typeof Underline;
  Hotkey: typeof Hotkey;
};

export const Typography = Object.assign(Text, {
  Heading,
  Blockquote,
  Caption,
  Code,
  Em,
  Link,
  Overline,
  Quote,
  Strong,
  Underline,
  Hotkey,
}) as TypographyCompound;
