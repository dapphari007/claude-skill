/**
 * `skillkit doctor` — diagnose installed skills: duplicates across scopes, skills that
 * won't load (bad frontmatter), and weak triggerability. Exits non-zero if problems.
 */
import pc from 'picocolors';
import { findSkills, skillsDir, type Scope } from '../core/locations.js';
import { parseSkillFile } from '../core/parse.js';
import { validateFrontmatter } from '../core/skill-schema.js';
import { scoreTriggerability } from '../core/triggerability.js';

export async function doctor(_args: string[]): Promise<void> {
  const scopes: Scope[] = ['user', 'project'];
  const seenIn = new Map<string, Scope[]>();
  let total = 0;
  let problems = 0;

  for (const scope of scopes) {
    const root = skillsDir(scope);
    const skills = findSkills(root);
    console.log(pc.bold(`\n${scope} ${pc.dim(`(${root})`)}`));
    if (skills.length === 0) {
      console.log(pc.dim('  (none)'));
      continue;
    }
    for (const s of skills) {
      total += 1;
      seenIn.set(s.name, [...(seenIn.get(s.name) ?? []), scope]);
      try {
        const { frontmatter } = parseSkillFile(s.file);
        const errs = validateFrontmatter(frontmatter).filter((i) => i.level === 'error');
        const score = scoreTriggerability(frontmatter.description ?? '').score;
        if (errs.length) {
          console.log(`  ${pc.red('✖')} ${pc.cyan(s.name)} ${pc.dim('—')} ${errs.length} error(s) (won't load reliably)`);
          problems += 1;
        } else if (score < 45) {
          console.log(`  ${pc.yellow('⚠')} ${pc.cyan(s.name)} ${pc.dim('—')} low triggerability (${score}/100)`);
          problems += 1;
        } else {
          console.log(`  ${pc.green('✓')} ${pc.cyan(s.name)}`);
        }
      } catch {
        console.log(`  ${pc.red('✖')} ${pc.cyan(s.name)} ${pc.dim('—')} unreadable frontmatter (won't load)`);
        problems += 1;
      }
    }
  }

  const dupes = [...seenIn.entries()].filter(([, where]) => where.length > 1);
  console.log(pc.bold('\nduplicates'));
  if (dupes.length === 0) {
    console.log(pc.dim('  none'));
  } else {
    for (const [name, where] of dupes) {
      console.log(`  ${pc.yellow('⚠')} ${pc.cyan(name)} in ${where.join(' + ')} — one shadows the other`);
      problems += 1;
    }
  }

  console.log(pc.dim(`\n${total} skill${total === 1 ? '' : 's'} checked · ${problems} issue${problems === 1 ? '' : 's'}`));
  if (problems) process.exitCode = 1;
}
