/**
 * `skillkit pack [path]` — bundle a skill for sharing + emit its community-registry entry.
 *   1. Validates the skill (refuses to pack one with errors).
 *   2. Best-effort: writes a portable `<name>-skill.tgz` (via system `tar`, if present).
 *   3. Prints the registry.json entry to PR — auto-filling the `github:` source from git.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import pc from 'picocolors';
import { parseSkillFile } from '../core/parse.js';
import { validateFrontmatter } from '../core/skill-schema.js';
import { scoreTriggerability } from '../core/triggerability.js';
import { githubFromRemote } from '../core/registry.js';

function resolveSkillFile(path: string): string | null {
  const candidate = join(path, 'SKILL.md');
  if (existsSync(candidate)) return candidate;
  return existsSync(path) && statSync(path).isFile() ? path : null;
}

/** Best-effort `github:user/repo/relpath` from the skill dir's git origin. */
function detectGithubSource(dir: string, name: string): string {
  try {
    const remote = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    const top = execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
    const slug = githubFromRemote(remote);
    if (slug) {
      const rel = relative(top, dir).replace(/\\/g, '/');
      return rel ? `github:${slug}/${rel}` : `github:${slug}`;
    }
  } catch {
    /* not a git repo / no origin — fall through to a placeholder */
  }
  return `github:<your-user>/<your-repo>/${name}`;
}

export async function pack(args: string[]): Promise<void> {
  const path = args[0] ?? '.';
  const file = resolveSkillFile(path);
  if (!file) {
    console.error(pc.red(`No SKILL.md found at "${path}".`));
    process.exitCode = 1;
    return;
  }

  const dir = dirname(resolve(file));
  const name = basename(dir);
  const { frontmatter } = parseSkillFile(file);

  const errors = validateFrontmatter(frontmatter).filter((i) => i.level === 'error');
  if (errors.length) {
    console.error(pc.red(`✖ ${name} has ${errors.length} error(s) — run \`skillkit validate ${path}\` and fix them before packing.`));
    process.exitCode = 1;
    return;
  }
  const { score } = scoreTriggerability(frontmatter.description ?? '');

  console.log(pc.bold(`\nPacking ${pc.cyan(name)}`) + pc.dim(`  (triggerability ${score}/100)`));

  // 1) Portable tarball — best effort; `tar` ships on Windows 10+, macOS, and Linux.
  const out = `${name}-skill.tgz`;
  try {
    execFileSync('tar', ['-czf', out, '-C', dirname(dir), name], { stdio: 'ignore' });
    console.log(`  ${pc.green('✓')} wrote ${pc.cyan(out)}`);
  } catch {
    console.log(`  ${pc.yellow('⚠')} ${pc.dim('skipped tarball (system `tar` not found) — the registry entry below is all you need to share it.')}`);
  }

  // 2) Registry entry to PR into registry.json.
  const source = detectGithubSource(dir, name);
  const entry: Record<string, { source: string; description: string }> = {
    [name]: { source, description: frontmatter.description ?? '' },
  };

  console.log(pc.bold('\nShare it — add this to registry.json and open a PR:\n'));
  console.log(
    JSON.stringify(entry, null, 2)
      .split('\n')
      .map((l) => '  ' + l)
      .join('\n'),
  );
  console.log(pc.dim(`\nOnce merged, anyone can install it with:`));
  console.log(`  ${pc.cyan(`npx create-claude-skill add ${name}`)}\n`);
  if (source.includes('<your-user>')) {
    console.log(pc.yellow(`  Note: couldn't detect a GitHub origin — replace the placeholder in "source" with your repo.\n`));
  }
}
