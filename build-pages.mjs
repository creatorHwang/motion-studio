import { cp, mkdir } from 'node:fs/promises';

const output = new URL('./.pages-dist/', import.meta.url);
const assets = ['index.html', 'styles.css', 'composer.css', 'app.js', 'handoff.js', 'motions.json'];

await mkdir(output, { recursive: true });
await Promise.all(assets.map(name => cp(new URL(name, import.meta.url), new URL(name, output))));
console.log(`Prepared ${assets.length} production assets.`);

