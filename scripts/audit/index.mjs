// scripts/audit/index.mjs
import { readFileSync, existsSync } from 'fs';
import { scanTokenConsistency } from './scanners/token-consistency.mjs';
import { scanThemeCoverage } from './scanners/theme-coverage.mjs';
import { scanConventionViolations } from './scanners/convention-violations.mjs';
import { scanReactPerformance } from './scanners/react-performance.mjs';
import { scanAccessibility } from './scanners/accessibility.mjs';
import { generateReport } from './report.mjs';
import { ROOT } from './utils.mjs';

/** Generate a stable ID for a finding so we can diff against a baseline. */
function findingId(f) {
  return `${f.severity}|${f.category}|${f.check}|${f.file}:${f.line}`;
}

const BASELINE_PATH = `${ROOT}/scripts/audit/high-baseline.json`;

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return new Set();
  try {
    const data = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
    return new Set(data);
  } catch {
    return new Set();
  }
}

async function main() {
  console.log('🔍 Running UI library audit...\n');

  console.log('  Scanning token/styling consistency...');
  const tokenFindings = await scanTokenConsistency();
  console.log(`  → ${tokenFindings.length} findings\n`);

  console.log('  Scanning theme coverage & IDE aliases...');
  const themeFindings = await scanThemeCoverage();
  console.log(`  → ${themeFindings.length} findings\n`);

  console.log('  Scanning convention violations...');
  const conventionFindings = await scanConventionViolations();
  console.log(`  → ${conventionFindings.length} findings\n`);

  console.log('  Scanning React performance...');
  const perfFindings = await scanReactPerformance();
  console.log(`  → ${perfFindings.length} findings\n`);

  console.log('  Scanning accessibility...');
  const a11yFindings = await scanAccessibility();
  console.log(`  → ${a11yFindings.length} findings\n`);

  const allFindings = [
    ...tokenFindings,
    ...themeFindings,
    ...conventionFindings,
    ...perfFindings,
    ...a11yFindings,
  ];

  const { outPath, total, high, medium, low } = generateReport(allFindings);

  console.log('━'.repeat(50));
  console.log(`\n📊 Audit complete: ${total} findings`);
  console.log(`   🔴 High: ${high}`);
  console.log(`   🟡 Medium: ${medium}`);
  console.log(`   🔵 Low: ${low}`);
  console.log(`\n📄 Report written to: ${outPath}\n`);

  // Strict mode: fail only on NEW High findings not in the baseline
  const baseline = loadBaseline();
  const highFindings = allFindings.filter((f) => f.severity === 'High');
  const newHigh = highFindings.filter((f) => !baseline.has(findingId(f)));

  if (newHigh.length > 0) {
    console.error(`❌ ${newHigh.length} new High severity finding(s) — failing audit.\n`);
    for (const f of newHigh) {
      console.error(`   ${f.file}:${f.line} — ${f.message}`);
    }
    process.exit(1);
  }

  if (high > 0) {
    console.log(`ℹ️  ${high} High finding(s) in baseline (known/intentional).`);
  }
  console.log('✅ No new High severity findings. Audit passed.\n');
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
