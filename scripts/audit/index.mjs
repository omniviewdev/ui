// scripts/audit/index.mjs
import { scanTokenConsistency } from './scanners/token-consistency.mjs';
import { scanThemeCoverage } from './scanners/theme-coverage.mjs';
import { scanConventionViolations } from './scanners/convention-violations.mjs';
import { scanReactPerformance } from './scanners/react-performance.mjs';
import { scanAccessibility } from './scanners/accessibility.mjs';
import { generateReport } from './report.mjs';

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
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
