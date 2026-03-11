// scripts/audit/report.mjs
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { ROOT } from './utils.mjs';

export function generateReport(findings) {
  const grouped = {};
  for (const f of findings) {
    const key = `${f.severity}|${f.category}|${f.check}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  }

  const severityOrder = { High: 0, Medium: 1, Low: 2 };
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const [sa] = a.split('|');
    const [sb] = b.split('|');
    return (severityOrder[sa] ?? 3) - (severityOrder[sb] ?? 3);
  });

  // Summary
  const highCount = findings.filter(f => f.severity === 'High').length;
  const medCount = findings.filter(f => f.severity === 'Medium').length;
  const lowCount = findings.filter(f => f.severity === 'Low').length;

  let md = `# UI Audit Findings Report\n\n`;
  md += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Total findings:** ${findings.length}\n`;
  md += `**High:** ${highCount} | **Medium:** ${medCount} | **Low:** ${lowCount}\n\n`;
  md += `---\n\n`;

  // Summary table
  md += `## Summary by Check\n\n`;
  md += `| Severity | Category | Check | Count |\n`;
  md += `|----------|----------|-------|-------|\n`;
  for (const key of sortedKeys) {
    const [severity, category, check] = key.split('|');
    md += `| ${severity} | ${category} | ${check} | ${grouped[key].length} |\n`;
  }
  md += `\n---\n\n`;

  // Detailed findings
  md += `## Detailed Findings\n\n`;
  for (const key of sortedKeys) {
    const [severity, category, check] = key.split('|');
    const items = grouped[key];
    md += `### ${severity}: ${check} (${category})\n\n`;
    md += `**${items.length} finding(s)**\n\n`;
    for (const item of items) {
      md += `- \`${item.file}:${item.line}\` — ${item.message}\n`;
      if (item.snippet) {
        const escapedSnippet = item.snippet.replace(/`/g, '\\`');
        md += `  \`\`\`\n  ${escapedSnippet}\n  \`\`\`\n`;
      }
    }
    md += `\n`;
  }

  const outPath = `${ROOT}/docs/superpowers/specs/audit-findings.md`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, md);
  return { outPath, total: findings.length, high: highCount, medium: medCount, low: lowCount };
}
