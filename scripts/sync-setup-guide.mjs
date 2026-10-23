import { mkdtempSync, mkdirSync, copyFileSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const targets = process.argv.slice(2).filter(arg => arg !== '--offline').map(path => resolve(path));
if (!targets.length) throw new Error('Usage: npm run guide:sync -- [--offline] /path/to/website /path/to/app');
for (const target of targets) JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'));
const temporary = mkdtempSync(join(tmpdir(), 'backlane-guide-'));
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || String(result.error));
  return result.stdout;
}
try {
  run('npm', ['run', 'docs:check'], root);
  const [pack] = JSON.parse(run('npm', ['pack', './packages/setup-guide', '--ignore-scripts', '--json', '--pack-destination', temporary], root));
  const bytes = readFileSync(join(temporary, pack.filename));
  for (const target of targets) {
    const vendor = join(target, 'vendor');
    mkdirSync(vendor, { recursive: true });
    const destination = join(vendor, pack.filename);
    // A published version is immutable. Bump the package version before changing it.
    let existing;
    try { existing = readFileSync(destination); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (existing && !existing.equals(bytes)) throw new Error(`Version already exists with different content in ${target}. Bump packages/setup-guide/package.json first.`);
    copyFileSync(join(temporary, pack.filename), destination);
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', ...(process.argv.includes('--offline') ? ['--offline'] : []), './' + relative(target, destination)], target);
    writeFileSync(join(vendor, 'setup-guide.json'), JSON.stringify({ package: pack.name, version: pack.version, source: 'https://github.com/pschlieker/getbacklane/tree/main/packages/setup-guide', sha256: createHash('sha256').update(bytes).digest('hex') }, null, 2) + '\n');
    console.log(`Installed ${pack.name}@${pack.version} in ${target}`);
  }
} finally { rmSync(temporary, { recursive: true, force: true }); }
