/**
 * `skillkit new <name>` / `create-claude-skill <name>` — scaffold a skill.
 * Flags: --description "...", --scope user|project|here (default here), --force
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import pc from 'picocolors';
import { skillsDir, type Scope } from '../core/locations.js';
import { validateFrontmatter } from '../core/skill-schema.js';
import { scoreTriggerability } from '../core/triggerability.js';

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

function titleCase(name: string): string {
  return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function render(name: string, description: string): string {
  return `---
name: ${name}
description: ${description}
---

# ${titleCase(name)}

> One line on what this skill does.

## When to use

${description}

## Instructions

1. Step one.
2. Step two.

<!-- Keep SKILL.md short; put long reference material in resources/ and link to it. -->
`;
}

export async function newSkill(args: string[]): Promise<void> {
  const name = args[0];
  if (!name || name.startsWith('--')) {
    console.error('Usage: skillkit new <name> [--description "..."] [--scope user|project|here]');
    process.exitCode = 1;
    return;
  }
  if (!KEBAB.test(name)) {
    console.error(pc.red(`Name must be kebab-case (e.g. escalate-smart), got "${name}"`));
    process.exitCode = 1;
    return;
  }

  let description = flag(args, 'description');
  if (!description && process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    description = (
      await rl.question(pc.bold(`Description (what it does AND when to use it):\n› `))
    ).trim();
    rl.close();
  }
  description ||= `TODO: describe what ${name} does and when to use it.`;

  const scopeFlag = (flag(args, 'scope') ?? 'here') as Scope | 'here';
  const baseDir =
    scopeFlag === 'user' ? skillsDir('user') : scopeFlag === 'project' ? skillsDir('project') : process.cwd();
  const targetDir = join(baseDir, name);
  const file = join(targetDir, 'SKILL.md');

  if (existsSync(file) && !args.includes('--force')) {
    console.error(pc.red(`${file} already exists (use --force to overwrite)`));
    process.exitCode = 1;
    return;
  }

  mkdirSync(targetDir, { recursive: true });
  writeFileSync(file, render(name, description), 'utf8');

  console.log(`${pc.green('✓')} created ${pc.bold(file)}`);

  // Immediate triggerability feedback so authors fix weak descriptions up front.
  const errs = validateFrontmatter({ name, description });
  const { score, suggestions } = scoreTriggerability(description);
  const col = score >= 70 ? pc.green : score >= 45 ? pc.yellow : pc.red;
  console.log(`  triggerability ${col(`${score}/100`)}`);
  for (const s of suggestions) console.log(`    ${pc.dim('→')} ${s}`);
  for (const e of errs) console.log(`    ${pc.yellow('⚠')} ${e.field}: ${e.message}`);
  console.log(pc.dim(`\nNext: edit the body, then \`skillkit validate ${scopeFlag === 'here' ? name : file}\``));
}
