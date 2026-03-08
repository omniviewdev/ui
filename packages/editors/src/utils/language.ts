const EXTENSION_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  go: 'go',
  java: 'java',
  kt: 'kotlin',
  kts: 'kotlin',
  cs: 'csharp',
  fs: 'fsharp',
  swift: 'swift',
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'c',
  hpp: 'cpp',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  mdx: 'markdown',
  sql: 'sql',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  ps1: 'powershell',
  dockerfile: 'dockerfile',
  tf: 'hcl',
  hcl: 'hcl',
  toml: 'ini',
  ini: 'ini',
  lua: 'lua',
  r: 'r',
  dart: 'dart',
  php: 'php',
  pl: 'perl',
  ex: 'elixir',
  exs: 'elixir',
  erl: 'erlang',
  hs: 'haskell',
  scala: 'scala',
  clj: 'clojure',
  graphql: 'graphql',
  gql: 'graphql',
  proto: 'protobuf',
  vue: 'html',
  svelte: 'html',
};

export function detectLanguage(filename: string): string | undefined {
  const lower = filename.toLowerCase();
  // Handle dotfiles like "Dockerfile"
  const base = lower.split('/').pop() ?? lower;
  if (base === 'dockerfile') return 'dockerfile';
  if (base === 'makefile') return 'makefile';

  const ext = base.split('.').pop();
  if (!ext) return undefined;
  return EXTENSION_MAP[ext];
}
