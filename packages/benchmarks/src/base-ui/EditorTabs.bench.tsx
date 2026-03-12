import { describe } from 'vitest';
import { benchRender, benchRerender, benchMountMany } from '../utils/bench-render';
import { TIER_1_OPTIONS } from '../utils/bench-options';
import { EditorTabs, type TabDescriptor } from '@omniview/base-ui';

function makeTabs(count: number, prefix = ''): TabDescriptor[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}tab-${i}`,
    title: `File ${prefix}${i}.ts`,
    closable: true,
  }));
}

const tabs20 = makeTabs(20);
const tabs40 = makeTabs(40);

describe('EditorTabs', () => {
  benchRender(
    'mount 20 tabs',
    () => <EditorTabs tabs={tabs20} activeId="tab-0" />,
    TIER_1_OPTIONS,
  );

  benchRerender(
    'tabs change (20 → 40)',
    {
      initialProps: { tabs: tabs20 },
      updatedProps: { tabs: tabs40 },
    },
    (props) => <EditorTabs tabs={props.tabs} activeId="tab-0" />,
    TIER_1_OPTIONS,
  );

  benchMountMany(
    'mount 30 tab bars (5 tabs each)',
    30,
    (i) => {
      const tabs = makeTabs(5, `bar${i}-`);
      return <EditorTabs key={i} tabs={tabs} activeId={tabs[0]!.id} />;
    },
    TIER_1_OPTIONS,
  );
});
