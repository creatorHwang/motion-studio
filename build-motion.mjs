import { cp, mkdir } from 'node:fs/promises';

const output = new URL('./dist/motion/', import.meta.url);
const assets = [
  'index.html',
  'styles.css',
  'composer.css',
  'app.js',
  'handoff.js',
  'motion-handoff.js',
  'motion-handoff-ui.js',
  'motions.json'
];

await mkdir(output, { recursive: true });
await Promise.all(assets.map(name => cp(new URL(name, import.meta.url), new URL(name, output))));
console.log(`Prepared ${assets.length} assets in dist/motion/.`);
