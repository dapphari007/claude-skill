/**
 * Resolve and enumerate where skills live, cross-platform.
 *  - user scope:    ~/.claude/skills
 *  - project scope: <cwd>/.claude/skills
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export type Scope = 'user' | 'project';

export function skillsDir(scope: Scope, cwd: string = process.cwd()): string {
  const base = scope === 'user' ? homedir() : cwd;
  return join(base, '.claude', 'skills');
}

export interface FoundSkill {
  name: string;
  dir: string;
  file: string;
}

/** List skill directories (those containing a SKILL.md) directly under `root`. */
export function findSkills(root: string): FoundSkill[] {
  if (!existsSync(root)) return [];
  const out: FoundSkill[] = [];
  for (const entry of readdirSync(root)) {
    const dir = join(root, entry);
    let isDir = false;
    try {
      isDir = statSync(dir).isDirectory();
    } catch {
      continue;
    }
    if (!isDir) continue;
    const file = join(dir, 'SKILL.md');
    if (existsSync(file)) out.push({ name: entry, dir, file });
  }
  return out;
}
