import { describe, expect, it, vi } from 'vitest';
import type * as Monaco from 'monaco-editor';
import { CEL_LANGUAGE_ID, registerCelLanguage } from './language';

describe('CEL lexical registration', () => {
  it('registers one shared CEL tokenizer and configuration per Monaco instance', () => {
    const languages = { register: vi.fn(), setLanguageConfiguration: vi.fn(), setMonarchTokensProvider: vi.fn() };
    const monaco = { languages } as unknown as typeof Monaco;
    registerCelLanguage(monaco);
    registerCelLanguage(monaco);
    expect(languages.register).toHaveBeenCalledExactlyOnceWith({
      id: CEL_LANGUAGE_ID, extensions: ['.cel'], aliases: ['CEL'],
    });
    expect(languages.setLanguageConfiguration).toHaveBeenCalledExactlyOnceWith(CEL_LANGUAGE_ID,
      expect.objectContaining({ comments: { lineComment: '//' },
        brackets: [['{', '}'], ['[', ']'], ['(', ')']] }));
    expect(languages.setMonarchTokensProvider).toHaveBeenCalledExactlyOnceWith(CEL_LANGUAGE_ID,
      expect.objectContaining({ keywords: ['true', 'false', 'null', 'in'], tokenizer: expect.objectContaining({
        root: expect.any(Array), single: expect.any(Array), double: expect.any(Array),
      }) }));
  });
});
