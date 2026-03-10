import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FindBar } from './FindBar';

const meta = {
  title: 'Inputs/FindBar',
  component: FindBar,
  tags: ['autodocs'],
  args: {
    open: true,
  },
  argTypes: {
    open: { control: 'boolean' },
    replaceEnabled: { control: 'boolean' },
  },
} satisfies Meta<typeof FindBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [query, setQuery] = useState('apiVersion');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [regex, setRegex] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [current, setCurrent] = useState(3);
    const total = query ? 12 : 0;

    const next = useCallback(() => setCurrent((c) => (c < total ? c + 1 : 1)), [total]);
    const prev = useCallback(() => setCurrent((c) => (c > 1 ? c - 1 : total)), [total]);

    return (
      <FindBar
        {...args}
        query={query}
        onQueryChange={(q) => { setQuery(q); setCurrent(1); }}
        matchCount={total}
        currentMatch={total ? current : undefined}
        onNext={next}
        onPrevious={prev}
        caseSensitive={caseSensitive}
        onCaseSensitiveChange={setCaseSensitive}
        wholeWord={wholeWord}
        onWholeWordChange={setWholeWord}
        regex={regex}
        onRegexChange={setRegex}
      />
    );
  },
};

export const WithReplace: Story = {
  name: 'With replace',
  render: (args) => {
    const [query, setQuery] = useState('v1beta1');
    const [replaceText, setReplaceText] = useState('v1');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [regex, setRegex] = useState(false);
    const [current, setCurrent] = useState(1);
    const total = query ? 4 : 0;

    const next = useCallback(() => setCurrent((c) => (c < total ? c + 1 : 1)), [total]);
    const prev = useCallback(() => setCurrent((c) => (c > 1 ? c - 1 : total)), [total]);

    return (
      <FindBar
        {...args}
        replaceEnabled
        query={query}
        onQueryChange={(q) => { setQuery(q); setCurrent(1); }}
        replaceText={replaceText}
        onReplaceTextChange={setReplaceText}
        matchCount={total}
        currentMatch={total ? current : undefined}
        onNext={next}
        onPrevious={prev}
        onReplace={() => next()}
        onReplaceAll={() => setCurrent(1)}
        caseSensitive={caseSensitive}
        onCaseSensitiveChange={setCaseSensitive}
        regex={regex}
        onRegexChange={setRegex}
      />
    );
  },
};

export const NoMatches: Story = {
  name: 'No matches',
  render: (args) => {
    const [query, setQuery] = useState('nonexistent');

    return (
      <FindBar
        {...args}
        query={query}
        onQueryChange={setQuery}
        matchCount={0}
        onNext={() => {}}
        onPrevious={() => {}}
      />
    );
  },
};

export const Closable: Story = {
  name: 'Open / Close',
  render: () => {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState('');

    return (
      <div>
        {!open && (
          <button type="button" onClick={() => setOpen(true)}>
            Open FindBar (Ctrl+F)
          </button>
        )}
        <FindBar
          open={open}
          onOpenChange={setOpen}
          query={query}
          onQueryChange={setQuery}
          matchCount={query ? 7 : 0}
          currentMatch={query ? 1 : undefined}
          onNext={() => {}}
          onPrevious={() => {}}
          caseSensitive={false}
          onCaseSensitiveChange={() => {}}
          regex={false}
          onRegexChange={() => {}}
          wholeWord={false}
          onWholeWordChange={() => {}}
        />
      </div>
    );
  },
};
