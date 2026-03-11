// scripts/audit/report.mjs
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { ROOT } from './utils.mjs';

const EXT_LANG = { '.css': 'css', '.ts': 'tsx', '.tsx': 'tsx', '.js': 'js', '.jsx': 'jsx', '.mjs': 'js' };

function langFromFile(filePath) {
  const dot = filePath.lastIndexOf('.');
  if (dot === -1) return '';
  return EXT_LANG[filePath.slice(dot)] ?? '';
}

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

  // Summary — single-pass accumulation
  let highCount = 0, medCount = 0, lowCount = 0;
  for (const f of findings) {
    if (f.severity === 'High') highCount++;
    else if (f.severity === 'Medium') medCount++;
    else if (f.severity === 'Low') lowCount++;
  }

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
        const lang = item.language ?? langFromFile(item.file);
        md += `  \`\`\`${lang}\n  ${item.snippet}\n  \`\`\`\n`;
      }
    }
    md += `\n`;
  }

  const outPath = `${ROOT}/docs/superpowers/specs/audit-findings.md`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, md);
  return { outPath, total: findings.length, high: highCount, medium: medCount, low: lowCount };
}
