import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
if (!existsSync('.dev.vars')) throw Error('Copy .dev.vars.example to .dev.vars and set SHOP_PASSWORD first.');
const child = spawn(process.execPath, [
  'node_modules/wrangler/bin/wrangler.js', 'dev',
  '--config', 'dist/server/wrangler.json', '--local',
  '--persist-to', resolve('.wrangler/state'),
  '--env-file', resolve('.dev.vars'), ...process.argv.slice(2),
], { stdio: 'inherit' });
child.on('error', (error) => { console.error(error.message); process.exit(1); });
child.on('exit', (code) => process.exit(code ?? 1));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
