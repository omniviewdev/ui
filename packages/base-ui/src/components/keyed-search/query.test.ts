import { describe, expect, it } from 'vitest';
import {
  applyKeyedSearchCompletion,
  createKeyedSearchIndex,
  getKeyedSearchActiveToken,
  getKeyedSearchCompletions,
  parseKeyedSearch,
  quoteKeyedSearchValue,
  tokenizeKeyedSearch,
} from './query';

const fields = [
  { name: 'region', label: 'Location', values: ['us-east-1', 'eu-west-1', 'North America'] },
  { name: 'status', values: ['healthy', 'pending'] },
];
const index = createKeyedSearchIndex(fields);

describe('keyed search query grammar', () => {
  it('preserves UTF-16 source boundaries, whitespace, mixed text and case-insensitive keys', () => {
    const source = '😀  REGION:"North America"\tapi status:healthy';
    const parsed = parseKeyedSearch(source, index);
    expect(parsed.diagnostics).toEqual([]);
    expect(parsed.filters.map(({ key, value }) => ({ key, value }))).toEqual([
      { key: 'region', value: 'North America' },
      { key: 'status', value: 'healthy' },
    ]);
    expect(parsed.text.map(({ value }) => value)).toEqual(['😀', 'api']);
    expect(parsed.tokens.every((token) => source.slice(token.start, token.end) === token.raw)).toBe(
      true,
    );
    expect(parsed.tokens[1]?.start).toBe(4);
  });

  it('retains unknown fields and unterminated quoted suffixes with visible diagnostics', () => {
    const parsed = parseKeyedSearch('mystery:x region:"North America status:healthy', index);
    expect(parsed.filters.map((token) => token.value)).toEqual([
      'x',
      'North America status:healthy',
    ]);
    expect(parsed.diagnostics.map((item) => item.code)).toEqual(['unknown-key', 'unclosed-quote']);
    expect(parsed.tokens[1]?.raw).toBe('region:"North America status:healthy');
    expect(parsed.source).toBe('mystery:x region:"North America status:healthy');
  });

  it('decodes escaped quotes and backslashes without losing literal backslashes or colons', () => {
    const value = 'a "quoted" path\\name:8443';
    const quoted = quoteKeyedSearchValue(value);
    expect(parseKeyedSearch(`region:${quoted}`, index).filters[0]?.value).toBe(value);
    expect(parseKeyedSearch('region:"x\\n"', index).filters[0]?.value).toBe('x\\n');
    expect(tokenizeKeyedSearch('"region:us east"')[0]).toMatchObject({
      value: 'region:us east',
      key: undefined,
    });
    expect(tokenizeKeyedSearch("region:'North America'")[0]?.value).toBe('North America');
  });

  it('supports empty and repeated values without silently merging tokens', () => {
    const parsed = parseKeyedSearch('region: region:"" region:eu-west-1', index);
    expect(parsed.filters.map((item) => item.value)).toEqual(['', '', 'eu-west-1']);
    expect(quoteKeyedSearchValue('')).toBe('""');
    expect(parseKeyedSearch('  \t ', index).tokens).toEqual([]);
  });
});

describe('caret-aware keyed search edits', () => {
  it('matches field names and labels while typing, then values immediately after the colon', () => {
    expect(getKeyedSearchCompletions(parseKeyedSearch('loc', index), 3, index)[0]?.text).toBe(
      'region:',
    );
    expect(
      getKeyedSearchCompletions(parseKeyedSearch('REGION:', index), 7, index).map(
        (item) => item.label,
      ),
    ).toEqual(['us-east-1', 'eu-west-1', 'North America']);
    expect(getKeyedSearchCompletions(parseKeyedSearch('unknown:', index), 8, index)).toEqual([]);
  });

  it('replaces only the active old token, preserving emoji, spaces and suffix tokens', () => {
    const source = '😀  region:us status:healthy  tail';
    const caret = source.indexOf('us') + 1;
    const parsed = parseKeyedSearch(source, index);
    const completion = getKeyedSearchCompletions(parsed, caret, index)[0]!;
    expect(applyKeyedSearchCompletion(source, completion)).toEqual({
      query: '😀  region:us-east-1 status:healthy  tail',
      caret: 20,
    });
    expect(getKeyedSearchActiveToken(parsed, caret)).toMatchObject({ start: 4, end: 13 });
  });

  it('switches key/value context when caret moves within an existing token', () => {
    const source = 'region:us-east-1  status:pending';
    const parsed = parseKeyedSearch(source, index);
    expect(getKeyedSearchCompletions(parsed, 3, index)[0]).toMatchObject({
      kind: 'field',
      text: 'region:us-east-1',
    });
    expect(
      getKeyedSearchCompletions(parsed, source.indexOf('pending'), index).map((item) => item.label),
    ).toEqual(['healthy', 'pending']);
    expect(getKeyedSearchActiveToken(parsed, 17)).toMatchObject({ start: 17, end: 17 });
  });

  it('quotes long values and replaces complete malformed tokens, not only the typed prefix', () => {
    const source = 'api region:"North America tail';
    const parsed = parseKeyedSearch(source, index);
    const completion = getKeyedSearchCompletions(parsed, 15, index)[0]!;
    expect(applyKeyedSearchCompletion(source, completion).query).toBe('api region:"North America"');
  });

  it('bounds a 10k index and preserves insertion text distinct from display labels', () => {
    const large = createKeyedSearchIndex([
      {
        name: 'name',
        values: Array.from({ length: 10_000 }, (_, value) => ({
          value: `resource-${value}`,
          label: `Resource ${value}`,
        })),
      },
    ]);
    const parsed = parseKeyedSearch('name:', large);
    expect(getKeyedSearchCompletions(parsed, 5, large, 7)).toHaveLength(7);
    expect(getKeyedSearchCompletions(parsed, 5, large, 1000)).toHaveLength(100);
    expect(getKeyedSearchCompletions(parsed, 5, large, 0)).toEqual([]);
    const narrowed = parseKeyedSearch('name:resource-9999', large);
    expect(getKeyedSearchCompletions(narrowed, narrowed.source.length, large)[0]).toMatchObject({
      label: 'Resource 9999',
      text: 'name:resource-9999',
    });
  });

  it('rejects invalid edit ranges instead of corrupting other query text', () => {
    expect(() =>
      applyKeyedSearchCompletion('hello', {
        kind: 'field',
        label: 'x:',
        text: 'x:',
        start: -1,
        end: 3,
      }),
    ).toThrow(RangeError);
  });
});
