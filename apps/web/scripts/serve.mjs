// Configurable Next.js launcher — reads PORT/HOST from env + .env files.
// Usage: node scripts/serve.mjs [dev|start]  (default: dev)
// Change the port in apps/web/.env.local (PORT=7089), no code edit needed.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseEnvFile(path) {
  const out = {};
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return out;
  }
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// Precedence (lowest → highest): .env, .env.local, real environment
const fileEnv = {
  ...parseEnvFile(join(root, '.env')),
  ...parseEnvFile(join(root, '.env.local')),
};
const port = process.env.PORT ?? fileEnv.PORT ?? '7089';
const host = process.env.HOST ?? fileEnv.HOST ?? '0.0.0.0';
const mode = process.argv[2] === 'start' ? 'start' : 'dev';

console.log(`[web] next ${mode} on http://${host}:${port} (PORT/HOST from env or .env.local)`);

const result = spawnSync('npx', ['next', mode, '-H', host, '-p', String(port)], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 1);
