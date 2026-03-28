import { describe } from 'vitest';
import { benchRender, benchRerender } from '../utils/bench-render';
import { TIER_2_OPTIONS } from '../utils/bench-options';
import { CodeBlock } from '@omniviewdev/base-ui';

const codeA = 'const x = 1;\nconsole.log(x);';
const codeB = 'const y = 2;\nconsole.log(y);';

describe('CodeBlock', () => {
  benchRender(
    'mount',
    () => <CodeBlock language="typescript">{codeA}</CodeBlock>,
    TIER_2_OPTIONS,
  );

  benchRerender(
    'code change',
    {
      initialProps: { children: codeA },
      updatedProps: { children: codeB },
    },
    (props) => <CodeBlock language="typescript" {...props} />,
    TIER_2_OPTIONS,
  );
});
