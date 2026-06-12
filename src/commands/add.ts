/**
 * `skillkit add <src>` — install a skill into the user (default) or project scope.
 *   github:user/repo[/path]   → shallow git clone, copy the skill dir
 *   ./local/path              → copy from disk
 *   name                      → community registry (v0.3)
 * Validates the skill after install.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import pc from 'picocolors';
import { skillsDir, type Scope } from '../core/locations.js';
import { resolveSource } from '../core/registry.js';
import { validate } from './validate.js';

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

export async function add(args: string[]): Promise<void> {
  const src = args[0];
  if (!src || src.startsWith('--')) {
    console.error('Usage: skillkit add <github:user/repo[/path] | ./path> [--scope user|project]');
    process.exitCode = 1;
    return;
  }
  const scope = (flag(args, 'scope') ?? 'user') as Scope;
  const dest = skillsDir(scope);
  const source = resolveSource(src);

  let cleanup: (() => void) | null = null;
  try {
    let srcDir: string;
    let name: string;

    if (source.kind === 'local') {
      srcDir = source.path;
      name = basename(source.path.replace(/[\\/]+$/, ''));
    } else if (source.kind === 'github') {
      const tmp = mkdtempSync(join(tmpdir(), 'ccs-'));
      cleanup = () => rmSync(tmp, { recursive: true, force: true });
      console.log(pc.dim(`cloning ${source.repo}…`));
      execFileSync('git', ['clone', '--depth', '1', `https://github.com/${source.repo}.git`, tmp], {
        stdio: 'ignore',
      });
      srcDir = source.path ? join(tmp, source.path) : tmp;
      name = source.path ? basename(source.path) : (source.repo.split('/').pop() ?? 'skill');
    } else {
      console.error(pc.red('Registry install lands in v0.3 — use github:user/repo or a local path for now.'));
      process.exitCode = 1;
      return;
    }

    if (!existsSync(join(srcDir, 'SKILL.md'))) {
      console.error(pc.red(`No SKILL.md found at the source (${src}).`));
      process.exitCode = 1;
      return;
    }

    const target = join(dest, name);
    if (existsSync(target) && !args.includes('--force')) {
      console.error(pc.red(`${target} already exists (use --force to overwrite).`));
      process.exitCode = 1;
      return;
    }
    mkdirSync(dest, { recursive: true });
    cpSync(srcDir, target, { recursive: true });
    console.log(`${pc.green('✓')} installed ${pc.cyan(name)} → ${target}`);
    await validate([target]);
  } catch (err) {
    console.error(pc.red(`add failed: ${err instanceof Error ? err.message : String(err)}`));
    process.exitCode = 1;
  } finally {
    cleanup?.();
  }
}
