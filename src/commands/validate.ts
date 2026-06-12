/**
 * `skillkit validate [path]` — lint a skill: frontmatter schema + triggerability score.
 * Exits non-zero on errors so it can gate CI.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import pc from 'picocolors';
import { parseSkillFile } from '../core/parse.js';
import { validateFrontmatter } from '../core/skill-schema.js';
import { scoreTriggerability } from '../core/triggerability.js';

function resolveSkillFile(path: string): string | null {
  if (existsSync(path) && statSync(path).isFile()) return path;
  const candidate = join(path, 'SKILL.md');
  return existsSync(candidate) ? candidate : null;
}

function scoreColor(score: number): (s: string) => string {
  if (score >= 70) return pc.green;
  if (score >= 45) return pc.yellow;
  return pc.red;
}

export async function validate(args: string[]): Promise<void> {
  const file = resolveSkillFile(args[0] ?? '.');
  if (!file) {
    console.error(pc.red(`No SKILL.md found at "${args[0] ?? '.'}"`));
    process.exitCode = 1;
    return;
  }

  const { frontmatter } = parseSkillFile(file);
  const issues = validateFrontmatter(frontmatter);
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');

  console.log(pc.bold(`\n${file}`));

  for (const e of errors) console.log(`  ${pc.red('✖')} ${pc.bold(e.field)}: ${e.message}`);
  for (const w of warns) console.log(`  ${pc.yellow('⚠')} ${pc.bold(w.field)}: ${w.message}`);
  if (issues.length === 0) console.log(`  ${pc.green('✓')} frontmatter looks good`);

  // Triggerability — the headline check.
  const desc = frontmatter.description ?? '';
  const { score, suggestions } = scoreTriggerability(desc);
  const col = scoreColor(score);
  console.log(`\n  ${pc.bold('Triggerability')} ${col(`${score}/100`)} ${col('█'.repeat(Math.round(score / 10)))}`);
  if (suggestions.length) {
    for (const s of suggestions) console.log(`    ${pc.dim('→')} ${s}`);
  } else {
    console.log(`    ${pc.green('✓')} this description should auto-trigger reliably`);
  }

  console.log('');
  if (errors.length) process.exitCode = 1;
}
