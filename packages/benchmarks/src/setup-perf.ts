import { configure } from 'reassure';
import fs from 'node:fs';
import path from 'node:path';

// Ensure .reassure directory exists
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

