import { DiagnosticCategory, type Diagnostic } from 'typescript';

export const outputDirectory = process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY || 'dist';

export const declarationOutputOptions = {
  outDir: outputDirectory,
  entryRoot: 'src',
  // API Extractor follows package.json's fixed dist entry. A staged build
  // emits the complete declaration tree without reading or writing active dist.
  rollupTypes: !process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY,
  afterDiagnostic(diagnostics: readonly Diagnostic[]) {
    for (const diagnostic of diagnostics) {
      if (diagnostic.category === DiagnosticCategory.Error) {
        throw new Error('TypeScript declaration generation failed; see compiler diagnostics');
      }
    }
  },
};
