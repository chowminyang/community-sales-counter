import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
// Only committed source is packaged. Ignored credentials, local databases and builds stay out.
if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim())
  throw Error('Commit reviewed source before packaging.');
mkdirSync('release', { recursive: true });
execFileSync('git', [
  'archive',
  '--format=zip',
  '--prefix=community-sales-counter/',
  '--output=release/community-sales-counter.zip',
  'HEAD',
]);
console.log('release/community-sales-counter.zip');
