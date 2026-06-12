/**
 * `skillkit list` — list installed skills (user + project scope) with their triggers.
 */
import pc from 'picocolors';
import { findSkills, skillsDir, type Scope } from '../core/locations.js';
import { parseSkillFile } from '../core/parse.js';

function printScope(scope: Scope): number {
  const root = skillsDir(scope);
  const skills = findSkills(root);
  console.log(pc.bold(`\n${scope} ${pc.dim(`(${root})`)}`));
  if (skills.length === 0) {
    console.log(pc.dim('  (none)'));
    return 0;
  }
  for (const s of skills) {
    let desc = '';
    try {
      desc = parseSkillFile(s.file).frontmatter.description ?? '';
    } catch {
      desc = pc.red('(unreadable frontmatter)');
    }
    const short = desc.length > 90 ? desc.slice(0, 87) + '…' : desc;
    console.log(`  ${pc.cyan(s.name)} ${pc.dim('—')} ${short}`);
  }
  return skills.length;
}

export async function list(_args: string[]): Promise<void> {
  const total = printScope('user') + printScope('project');
  console.log(pc.dim(`\n${total} skill${total === 1 ? '' : 's'} total`));
}
