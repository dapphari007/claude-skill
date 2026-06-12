#!/usr/bin/env node
/**
 * skillkit — create, validate, and share Claude Code (Agent) skills.
 *
 * SKELETON: the router is real; each command is a stub that prints its planned
 * behaviour. No external deps yet, so this runs with plain `node` for review.
 * v0.1 fills in the command logic (see src/commands/*).
 */
import { newSkill } from './commands/new.js';
import { validate } from './commands/validate.js';
import { doctor } from './commands/doctor.js';
import { list } from './commands/list.js';
import { add } from './commands/add.js';
import { pack } from './commands/pack.js';

type Command = (args: string[]) => Promise<void> | void;

const COMMANDS: Record<string, { run: Command; summary: string }> = {
  new: { run: newSkill, summary: 'Scaffold a new skill' },
  validate: { run: validate, summary: 'Lint a skill + score triggerability' },
  doctor: { run: doctor, summary: 'Diagnose installed skills (dupes/conflicts)' },
  list: { run: list, summary: 'List installed skills with their triggers' },
  add: { run: add, summary: 'Install a skill from github:/local/registry' },
  pack: { run: pack, summary: 'Bundle/publish a skill for sharing' },
};

function usage(): void {
  console.log(`skillkit — create-react-app for Claude Code skills\n`);
  console.log(`Usage: skillkit <command> [args]\n`);
  for (const [name, { summary }] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(10)} ${summary}`);
  }
  console.log(`\nAlias: \`npx create-claude-skill <name>\` === \`skillkit new <name>\``);
}

async function main(): Promise<void> {
  const [, , raw, ...args] = process.argv;
  // `create-claude-skill <name>` is sugar for `new <name>`.
  const invokedAs = process.argv[1] ?? '';
  if (invokedAs.includes('create-claude-skill') && raw && !(raw in COMMANDS)) {
    return void (await COMMANDS.new.run([raw, ...args]));
  }
  if (!raw || raw === '--help' || raw === '-h') return usage();
  const cmd = COMMANDS[raw];
  if (!cmd) {
    console.error(`Unknown command: ${raw}\n`);
    usage();
    process.exitCode = 1;
    return;
  }
  await cmd.run(args);
}

void main();
