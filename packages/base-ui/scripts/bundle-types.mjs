import { rm } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';

// Workspace-managed output keeps its unbundled declarations beside the snapshot.
if (!process.env.OMNIVIEW_BUILD_OUTPUT_DIRECTORY) {
  const root = resolve(import.meta.dirname, '..');
  const output = resolve(root, 'dist');
  const intermediate = resolve(output, '.types');
  const bundle = await rollup({
    input: {
      index: resolve(intermediate, 'index.d.ts'),
      metrics: resolve(intermediate, 'metrics/index.d.ts'),
    },
    external: (id) => !id.startsWith('.') && !isAbsolute(id) && !id.startsWith('@dnd-kit/'),
    plugins: [
      dts({
        tsconfig: resolve(root, 'tsconfig.build.json'),
        sourcemap: true,
        // Embed DnD's complete declaration graph, including relative barrel imports.
        // Other packages retain their normal external type identity.
        respectExternal: true,
      }),
    ],
  });
  try {
    await bundle.write({
      dir: output,
      format: 'es',
      entryFileNames: '[name].d.ts',
      chunkFileNames: 'types/[name]-[hash].d.ts',
      sourcemap: true,
    });
  } finally {
    await bundle.close();
  }
  await rm(intermediate, { recursive: true, force: true });
  process.stdout.write('Built portable root and metrics declarations.\n');
}
