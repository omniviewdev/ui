import { configure } from 'reassure';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ensure .reassure directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reassureDir = path.resolve(__dirname, '../.reassure');
if (!fs.existsSync(reassureDir)) {
  fs.mkdirSync(reassureDir, { recursive: true });
}

// Tell Reassure to use @testing-library/react explicitly
configure({
  testingLibrary: 'react',
  runs: 20,
  warmupRuns: 3,
});

