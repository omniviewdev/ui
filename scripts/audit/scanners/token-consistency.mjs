// scripts/audit/scanners/token-consistency.mjs
import { findFiles, readLines, finding } from '../utils.mjs';

// Patterns
const HEX_COLOR = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/;
const RGB_HSL = /\b(?:rgb|hsl)a?\s*\(/;
const PRIMITIVE_TOKEN = /--ov-primitive-/;
const RAW_SPACING = /(?:margin(?:-top|-right|-bottom|-left|-inline(?:-start|-end)?|-block(?:-start|-end)?)?|padding(?:-top|-right|-bottom|-left|-inline(?:-start|-end)?|-block(?:-start|-end)?)?|gap|row-gap|column-gap)\s*:\s*(?!.*var\(--ov).*?\d+(?:px|rem|em)/;
const RAW_RADIUS = /border-(?:radius|top-left-radius|top-right-radius|bottom-left-radius|bottom-right-radius)\s*:\s*(?!.*var\(--ov).*?\d+(?:px|rem|em)/;
const RAW_FONT_SIZE = /font-size\s*:\s*(?!.*var\(--ov).*?\d+(?:px|rem|em)/;
const RAW_Z_INDEX = /z-index\s*:\s*\d+(?!.*var\(--ov)/;
const RAW_TRANSITION_START = /(?:transition|animation)(?:-duration|-timing-function)?\s*:/;
const RAW_BOX_SHADOW = /box-shadow\s*:\s*(?!.*var\(--ov)(?!none)/;
const RAW_OPACITY = /(?<![a-z-])opacity\s*:\s*[\d.]+(?!.*var\(--ov)/;
const SYNTAX_COLOR_IN_EDITORS = /#(?:[0-9a-fA-F]{3,4}){1,2}|(?:rgb|hsl)a?\s*\(/;

export async function scanTokenConsistency() {
  const results = [];

  // Scan CSS Modules across all packages
  const cssFiles = await findFiles('packages/*/src/**/*.module.css');

  for (const file of cssFiles) {
    const lines = readLines(file);
    const isEditorsPkg = file.includes('packages/editors/');
    let inComment = false;

    for (let i = 0; i < lines.length; i++) {
      const { line, num } = lines[i];

      // Skip lines inside block comments (track state)
      if (inComment) {
        if (line.includes('*/')) inComment = false;
        continue;
      }
      if (line.trim().startsWith('/*')) {
        if (!line.includes('*/')) inComment = true;
        continue;
      }

      // Hardcoded colors (High)
      if (HEX_COLOR.test(line) && !line.includes('var(--ov')) {
        results.push(finding('High', 'Token/Styling', 'Hardcoded color', file, num, line,
          'Hex color found — use a semantic token (--ov-color-*)'));
      }
      if (RGB_HSL.test(line) && !line.includes('var(--ov')) {
        results.push(finding('High', 'Token/Styling', 'Hardcoded color', file, num, line,
          'rgb/hsl color found — use a semantic token (--ov-color-*)'));
      }

      // Primitive token leakage (High)
      if (PRIMITIVE_TOKEN.test(line)) {
        results.push(finding('High', 'Token/Styling', 'Primitive token leakage', file, num, line,
          'Primitive token used directly — use a semantic token instead'));
      }

      // Hardcoded spacing (Medium)
      if (RAW_SPACING.test(line)) {
        results.push(finding('Medium', 'Token/Styling', 'Hardcoded spacing', file, num, line,
          'Raw spacing value — use --ov-space-* token'));
      }

      // Hardcoded radii (Medium)
      if (RAW_RADIUS.test(line)) {
        results.push(finding('Medium', 'Token/Styling', 'Hardcoded radius', file, num, line,
          'Raw border-radius — use --ov-radius-* token'));
      }

      // Hardcoded font sizes (Low)
      if (RAW_FONT_SIZE.test(line)) {
        results.push(finding('Low', 'Token/Styling', 'Hardcoded font-size', file, num, line,
          'Raw font-size — use --ov-font-* token'));
      }

      // Hardcoded z-index (Low)
      if (RAW_Z_INDEX.test(line)) {
        results.push(finding('Low', 'Token/Styling', 'Hardcoded z-index', file, num, line,
          'Raw z-index — use --ov-z-* token'));
      }

      // Hardcoded transitions/animations (Medium)
      // Collect the full declaration (may span multiple lines) before checking for var(--ov)
      if (RAW_TRANSITION_START.test(line)) {
        let declSpan = line;
        let j = i + 1;
        // If the declaration doesn't end on this line (no ; or }), join subsequent lines
        while (!/[;}]/.test(declSpan) && j < lines.length) {
          declSpan += ' ' + lines[j].line;
          j++;
        }
        // Extract the value portion (everything after the colon)
        const colonIdx = declSpan.indexOf(':');
        const declValue = colonIdx !== -1 ? declSpan.slice(colonIdx + 1).replace(/[;{}]/g, '').trim() : '';
        // Skip `transition: none` / `animation: none` (with optional !important) — used intentionally in reduced-motion blocks
        if (/^none(\s*!important)?$/i.test(declValue)) continue;
        if (!declSpan.includes('var(--ov')) {
          results.push(finding('Medium', 'Token/Styling', 'Hardcoded transition', file, num, line,
            'Raw transition/animation — use --ov-duration-*/--ov-ease-* tokens (breaks reduced motion)'));
        }
      }

      // Hardcoded box-shadow (Medium)
      if (RAW_BOX_SHADOW.test(line)) {
        results.push(finding('Medium', 'Token/Styling', 'Hardcoded box-shadow', file, num, line,
          'Raw box-shadow — use --ov-shadow-* token'));
      }

      // Hardcoded opacity (Low)
      if (RAW_OPACITY.test(line)) {
        results.push(finding('Low', 'Token/Styling', 'Hardcoded opacity', file, num, line,
          'Raw opacity — use --ov-opacity-* token if applicable'));
      }

      // Missing syntax tokens in editors (High)
      if (isEditorsPkg && SYNTAX_COLOR_IN_EDITORS.test(line) && !line.includes('var(--ov-syntax')) {
        // Only flag if this looks like it's styling syntax/code highlighting
        if (/syntax|highlight|token|keyword|string|comment|literal/i.test(line)) {
          results.push(finding('High', 'Token/Styling', 'Missing syntax token', file, num, line,
            'Color in editors CSS not using --ov-syntax-* token'));
        }
      }
    }
  }

  return results;
}
