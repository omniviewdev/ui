import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { BUILT_IN_THEMES } from '../../theme/registry/catalog';
import { Button } from '../button';
import { KeyedSearch, type KeyedSearchProps } from './KeyedSearch';
import { parseKeyedSearch, type KeyedSearchField } from './query';
import styles from './KeyedSearch.stories.module.css';

const resources = [
  { name: 'api-production', region: 'us-east-1', status: 'healthy', owner: 'Platform team' },
  { name: 'api-sandbox', region: 'eu-west-1', status: 'pending', owner: 'Product team' },
  { name: 'worker-production', region: 'us-east-1', status: 'healthy', owner: 'Platform team' },
  {
    name: 'analytics/archive/very-long-resource-name.example.com:8443/reports',
    region: 'North America',
    status: 'healthy',
    owner: 'Data "insights" team',
  },
];
const fields: readonly KeyedSearchField[] = [
  {
    name: 'name',
    label: 'Resource name',
    description: 'Indexed resource names',
    values: resources.map((item) => item.name),
  },
  { name: 'region', label: 'Location', values: ['us-east-1', 'eu-west-1', 'North America'] },
  { name: 'status', label: 'Health', values: ['healthy', 'pending'] },
  {
    name: 'owner',
    label: 'Owner',
    values: ['Platform team', 'Product team', 'Data "insights" team'],
  },
];
const largeFields: readonly KeyedSearchField[] = [
  {
    name: 'name',
    label: 'Resource name',
    description: '10,000 local candidates',
    values: Array.from({ length: 10_000 }, (_, index) => ({
      value: `resource-${String(index).padStart(5, '0')}`,
      label: `Resource ${index}`,
      description: index % 2 ? 'Application' : 'Background worker',
    })),
  },
];

function Controlled(args: KeyedSearchProps) {
  const [query, setQuery] = useState(args.query);
  return <KeyedSearch {...args} query={query} onQueryChange={setQuery} />;
}

const meta = {
  title: 'Components/KeyedSearch',
  component: KeyedSearch,
  tags: ['autodocs'],
  args: {
    fields,
    query: '',
    onQueryChange: () => {},
    placeholder: 'Search resources… region:us-east-1 owner:"Platform team"',
    size: 'md',
  },
  argTypes: {
    fields: { control: false },
    onQueryChange: { control: false },
    onParsedQueryChange: { control: false },
    onSubmit: { control: false },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline', 'ghost'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Controlled query/onQueryChange input with a stable, typed fields array. Field names match without case sensitivity; values are synchronous indexed data, never network requests. Free text and field:value tokens may mix. Double or single quotes group spaces; backslashes escape quotes and backslashes. Unknown fields and unclosed quotes remain in parsed output and produce visible diagnostics. Consumers should reject or explicitly handle diagnostic queries rather than ignore unknown filters. Completion replaces only the active token, preserving surrounding text. onKeyDown receives only keys not handled by suggestions; onSubmit receives the parsed query when Enter has no active completion. Native input selection, IME, clipboard and horizontal scroll remain intact. Exported pure helpers support independent filtering and edits. Use the theme, density and motion toolbar for every story.',
      },
    },
  },
  render: (args) => (
    <div className={styles.Layout}>
      <Controlled {...args} />
    </div>
  ),
} satisfies Meta<typeof KeyedSearch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllSizes: Story = {
  render: (args) => (
    <div className={styles.Grid}>
      {(['comfortable', 'compact'] as const).map((density) => (
        <section key={density} data-ov-density={density} className={styles.Panel}>
          <h3>{density}</h3>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <label key={size} className={styles.Label}>
              {size}
              <Controlled
                {...args}
                size={size}
                aria-label={`${density} ${size} search`}
                query={'api region:us-east-1 owner:"Platform team"'}
              />
            </label>
          ))}
        </section>
      ))}
    </div>
  ),
};

function ResourceResults(args: KeyedSearchProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [opened, setOpened] = useState<string>();
  const matches = useMemo(() => {
    const parsed = parseKeyedSearch(query, fields);
    if (parsed.diagnostics.length) return [];
    return resources.filter((resource) =>
      parsed.tokens.every((token) => {
        const value = token.value.toLowerCase();
        if (token.key !== undefined)
          return resource[token.key as keyof typeof resource].toLowerCase().includes(value);
        return Object.values(resource).join(' ').toLowerCase().includes(value);
      }),
    );
  }, [query]);
  return (
    <div className={styles.Layout}>
      <p>
        First result stays preselected. Type “api”, then Enter to open it. Suggestions consume keys
        before result navigation.
      </p>
      <KeyedSearch
        {...args}
        query={query}
        fields={fields}
        onQueryChange={(next) => {
          setQuery(next);
          setSelected(0);
          setOpened(undefined);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected((value) =>
              Math.max(
                0,
                Math.min(matches.length - 1, value + (event.key === 'ArrowDown' ? 1 : -1)),
              ),
            );
          }
        }}
        onSubmit={() => setOpened(matches[selected]?.name)}
      />
      <div className={styles.Results} aria-label="Resource results">
        {matches.map((resource, index) => (
          <Button
            key={resource.name}
            variant={selected === index ? 'soft' : 'ghost'}
            color={selected === index ? 'brand' : 'neutral'}
            onClick={() => setOpened(resource.name)}
            aria-current={selected === index ? 'true' : undefined}
            className={styles.Resource}
          >
            <strong>{resource.name}</strong>
            <span>
              {resource.region} · {resource.status} · {resource.owner}
            </span>
          </Button>
        ))}
        {!matches.length ? <p>No matching resources.</p> : null}
      </div>
      <output aria-live="polite">
        {opened ? `Opened resource: ${opened}` : `${matches.length} resources`}
      </output>
    </div>
  );
}

export const InteractiveResources: Story = { render: (args) => <ResourceResults {...args} /> };

export const LongQuotedValues: Story = {
  args: {
    query:
      'api owner:"Data \\"insights\\" team" region:"North America" name:"analytics/archive/very-long-resource-name.example.com:8443/reports"',
  },
  render: (args) => (
    <div className={styles.Layout}>
      <p>
        Move caret into any old token to see its own values. Select all or scroll horizontally;
        highlighting follows native input.
      </p>
      <Controlled {...args} />
    </div>
  ),
};

export const TenThousandValues: Story = {
  args: {
    fields: largeFields,
    query: 'name:',
    maxSuggestions: 12,
    placeholder: 'Try name:09999 or name:resource-05000',
  },
  render: (args) => (
    <div className={styles.Layout}>
      <p>
        10,000 pre-indexed values; at most 12 mounted suggestions. Type to narrow names or display
        labels.
      </p>
      <Controlled {...args} />
    </div>
  ),
};

export const Diagnostics: Story = {
  args: { query: 'unrecognized:example owner:"unfinished value' },
};

export const NarrowPane: Story = {
  render: (args) => (
    <div className={styles.Narrow} data-ov-motion="reduced">
      <p>Narrow pane · reduced motion</p>
      <Controlled {...args} query={'owner:"Platform team" region:us-east-1'} />
    </div>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: (args) => (
    <div className={styles.Layout}>
      <Controlled {...args} disabled query="region:us-east-1" aria-label="Disabled search" />
      <Controlled
        {...args}
        readOnly
        query={'owner:"Platform team"'}
        aria-label="Read-only search"
      />
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: (args) => (
    <div className={styles.Grid}>
      {BUILT_IN_THEMES.map((theme) => (
        <section key={theme.id} data-ov-theme={theme.id} className={styles.Panel}>
          <h3>{theme.name}</h3>
          <Controlled
            {...args}
            aria-label={`${theme.name} search`}
            query={'region:"North America" status:healthy'}
          />
        </section>
      ))}
    </div>
  ),
};

export const NestedAndCustomTheme: Story = {
  render: (args) => (
    <section data-ov-theme="dark" className={styles.Panel}>
      <h3>Dark parent</h3>
      <Controlled {...args} aria-label="Dark parent search" query="status:healthy" />
      <section data-ov-theme="light" className={styles.Panel}>
        <h3>Nested light theme</h3>
        <Controlled {...args} aria-label="Nested light search" query="region:us-east-1" />
        <section
          className={`${styles.Panel} ${styles.CustomScope}`}
          data-ov-keyed-search-custom-scope=""
        >
          <h3>Custom syntax and overlay token overrides</h3>
          <Controlled {...args} aria-label="Custom token search" query={'owner:"Platform team"'} />
        </section>
      </section>
    </section>
  ),
};
