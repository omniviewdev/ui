#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsDir = join(__dirname, '..', 'results');

function loadJSON(filepath) {
  if (!existsSync(filepath)) return null;
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

function formatHz(hz) {
  if (hz >= 1000) return `${(hz / 1000).toFixed(1)}k`;
  return hz.toFixed(0);
}

/**
 * Extract flat benchmark list from Vitest 4.x benchmark JSON output.
 * Format: files[].groups[].benchmarks[] with { name, hz, mean, rme, sampleCount }
 * The group's fullName contains the suite (e.g., "src/base-ui/Button.bench.tsx > Button")
 */
function extractBenchmarks(data) {
  const results = [];
  for (const file of data.files ?? []) {
    for (const group of file.groups ?? []) {
      // Extract suite name from fullName (e.g., "src/base-ui/Button.bench.tsx > Button" → "Button")
      const parts = (group.fullName ?? '').split(' > ');
      const suite = parts[parts.length - 1] || group.fullName || 'unknown';

      for (const bench of group.benchmarks ?? []) {
        results.push({
          suite,
          name: bench.name,
          hz: bench.hz,
          mean: bench.mean,
          median: bench.median,
          p99: bench.p99,
          rme: bench.rme,
          sampleCount: bench.sampleCount,
        });
      }
    }
  }
  return results;
}

function generateComparison(baseline, current) {
  if (!baseline || !current) return null;

  const baselineBenchmarks = extractBenchmarks(baseline);
  const currentBenchmarks = extractBenchmarks(current);

  const baselineMap = new Map();
  for (const b of baselineBenchmarks) {
    baselineMap.set(`${b.suite}::${b.name}`, b);
  }

  const regressions = [];
  const improvements = [];
  const unchanged = [];

  for (const c of currentBenchmarks) {
    const key = `${c.suite}::${c.name}`;
    const b = baselineMap.get(key);
    if (!b) continue;

    const baseHz = b.hz;
    const currHz = c.hz;
    const changePct = ((currHz - baseHz) / baseHz) * 100;

    const entry = {
      suite: c.suite,
      name: c.name,
      baseline_hz: Math.round(baseHz),
      current_hz: Math.round(currHz),
      change_pct: Math.round(changePct * 10) / 10,
    };

    if (changePct < -5) regressions.push(entry);
    else if (changePct > 5) improvements.push(entry);
    else unchanged.push(entry);
  }

  return {
    baseline: 'baseline',
    current: new Date().toISOString(),
    regressions: regressions.sort((a, b) => a.change_pct - b.change_pct),
    improvements: improvements.sort((a, b) => b.change_pct - a.change_pct),
    unchanged,
  };
}

function generateMarkdown(comparison) {
  if (!comparison) return '# Benchmark Results\n\nNo baseline to compare against.\n';

  const lines = ['# Benchmark Comparison Report\n'];
  lines.push(`**Baseline:** ${comparison.baseline}`);
  lines.push(`**Current:** ${comparison.current}\n`);

  if (comparison.regressions.length > 0) {
    lines.push('## Regressions\n');
    lines.push('| Suite | Benchmark | Baseline (ops/s) | Current (ops/s) | Change |');
    lines.push('|-------|-----------|-------------------|-----------------|--------|');
    for (const r of comparison.regressions) {
      lines.push(`| ${r.suite} | ${r.name} | ${formatHz(r.baseline_hz)} | ${formatHz(r.current_hz)} | ${r.change_pct}% |`);
    }
    lines.push('');
  }

  if (comparison.improvements.length > 0) {
    lines.push('## Improvements\n');
    lines.push('| Suite | Benchmark | Baseline (ops/s) | Current (ops/s) | Change |');
    lines.push('|-------|-----------|-------------------|-----------------|--------|');
    for (const r of comparison.improvements) {
      lines.push(`| ${r.suite} | ${r.name} | ${formatHz(r.baseline_hz)} | ${formatHz(r.current_hz)} | +${r.change_pct}% |`);
    }
    lines.push('');
  }

  if (comparison.unchanged.length > 0) {
    lines.push('## Unchanged\n');
    lines.push(`${comparison.unchanged.length} benchmarks within ±5% of baseline.\n`);
  }

  return lines.join('\n');
}

// Main
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

const latest = loadJSON(join(resultsDir, 'latest.json'));
const baseline = loadJSON(join(resultsDir, 'baseline.json'));

if (!latest) {
  console.error('No results/latest.json found. Run `pnpm bench:json` first.');
  process.exit(1);
}

const comparison = generateComparison(baseline, latest);

if (comparison) {
  writeFileSync(join(resultsDir, 'comparison.json'), JSON.stringify(comparison, null, 2));
  console.log('Wrote results/comparison.json');
}

const markdown = generateMarkdown(comparison);
writeFileSync(join(resultsDir, 'report.md'), markdown);
console.log('Wrote results/report.md');
