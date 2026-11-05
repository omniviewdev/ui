// scripts/audit/index.mjs
import { readFileSync, existsSync } from 'fs';
import { scanTokenConsistency } from './scanners/token-consistency.mjs';
import { scanThemeCoverage } from './scanners/theme-coverage.mjs';
import { scanConventionViolations } from './scanners/convention-violations.mjs';
import { scanReactPerformance } from './scanners/react-performance.mjs';
import { scanAccessibility } from './scanners/accessibility.mjs';
import { scanCustomPropertyCycles } from './scanners/custom-property-cycles.mjs';
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
  process.stdout.write('🔍 Running UI library audit...\n' + '\n');

  process.stdout.write('  Scanning token/styling consistency...' + '\n');
  const tokenFindings = await scanTokenConsistency();
  process.stdout.write(`  → ${tokenFindings.length} findings\n` + '\n');

  process.stdout.write('  Scanning theme coverage & IDE aliases...' + '\n');
  const themeFindings = await scanThemeCoverage();
  process.stdout.write(`  → ${themeFindings.length} findings\n` + '\n');

  process.stdout.write('  Scanning custom-property dependency cycles...' + '\n');
  const cycleFindings = await scanCustomPropertyCycles();
  process.stdout.write(`  → ${cycleFindings.length} findings\n` + '\n');

  process.stdout.write('  Scanning convention violations...' + '\n');
  const conventionFindings = await scanConventionViolations();
  process.stdout.write(`  → ${conventionFindings.length} findings\n` + '\n');

  process.stdout.write('  Scanning React performance...' + '\n');
  const perfFindings = await scanReactPerformance();
  process.stdout.write(`  → ${perfFindings.length} findings\n` + '\n');

  process.stdout.write('  Scanning accessibility...' + '\n');
  const a11yFindings = await scanAccessibility();
  process.stdout.write(`  → ${a11yFindings.length} findings\n` + '\n');

  const allFindings = [
    ...tokenFindings,
    ...themeFindings,
    ...cycleFindings,
    ...conventionFindings,
    ...perfFindings,
    ...a11yFindings,
  ];

  const { outPath, total, high, medium, low } = await generateReport(allFindings);

  process.stdout.write('━'.repeat(50) + '\n');
  process.stdout.write(`\n📊 Audit complete: ${total} findings` + '\n');
  process.stdout.write(`   🔴 High: ${high}` + '\n');
  process.stdout.write(`   🟡 Medium: ${medium}` + '\n');
  process.stdout.write(`   🔵 Low: ${low}` + '\n');
  process.stdout.write(`\n📄 Report written to: ${outPath}\n` + '\n');

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
    process.stdout.write(`ℹ️  ${high} High finding(s) in baseline (known/intentional).` + '\n');
  }
  process.stdout.write('✅ No new High severity findings. Audit passed.\n' + '\n');
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
