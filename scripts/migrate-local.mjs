import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const built = 'dist/server/wrangler.json';
if (!existsSync(built)) throw Error('Run npm run build first.');
const source = JSON.parse(readFileSync(built, 'utf8'));
const binding = source.d1_databases?.find((d) => d.binding === 'DB');
if (!binding) throw Error('Build has no DB binding.');
mkdirSync('.wrangler', { recursive: true });
const config = resolve('.wrangler/local-migrations.json');
writeFileSync(
  config,
  JSON.stringify({
    name: 'community-sales-counter-local',
    compatibility_date: source.compatibility_date,
    d1_databases: [{ ...binding, migrations_dir: resolve('drizzle') }],
  }),
);
const result = spawnSync(
  process.execPath,
  [
    'node_modules/wrangler/bin/wrangler.js',
    'd1',
    'migrations',
    'apply',
    'DB',
    '--local',
    '--persist-to',
    resolve('.wrangler/state'),
    '--config',
    config,
  ],
  { stdio: 'inherit' },
);
process.exit(result.status ?? 1);
