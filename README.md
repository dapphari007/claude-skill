# create-claude-skill

> **create-react-app, but for Claude Code skills.** Scaffold, validate, and share agent skills — one `npx` away.

[![npm version](https://img.shields.io/npm/v/create-claude-skill.svg)](https://www.npmjs.com/package/create-claude-skill) [![CI](https://github.com/dapphari007/claude-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/dapphari007/claude-skill/actions/workflows/ci.yml) [![license: MIT](https://img.shields.io/npm/l/create-claude-skill.svg)](LICENSE)

## Demo

![create-claude-skill — catches a vague description (30/100) and rewards a sharp one (95/100)](demo.gif)

```console
$ create-claude-skill new payment-flow --description "a helper for various stuff"
✓ created payment-flow/SKILL.md
  triggerability 30/100
    → Add specific trigger conditions — what task/keywords should activate this?
    → Name concrete keywords/verbs a user would actually type for this task.
    → Replace vague words (helper/utility/various) with the precise capability.

$ create-claude-skill validate skills/escalate-smart
  ✓ frontmatter looks good
  Triggerability 95/100 ██████████  ✓ this description should auto-trigger reliably
```

> The triggerability score in action — vague vs. sharp. Regenerate with `node scripts/make-gif.mjs`.

Agent **skills** (a `SKILL.md` + optional bundled resources, loaded from `~/.claude/skills/` or a
project's `.claude/skills/`) are powerful — but today you author them by hand with **zero tooling**.
The #1 silent failure: a skill that never auto-triggers because its `description` is too vague, and
nothing tells you. **claude-skill** fixes that.

```bash
# scaffold a new skill (interactive)
npx create-claude-skill my-skill

# lint it — schema + the novel "triggerability" score
npx create-claude-skill validate

# diagnose your setup (duplicates, conflicts, what actually loaded)
npx create-claude-skill doctor
```

## Why claude-skill

- **`validate` scores _triggerability_** — skills fire from their `description`; most are written too
  vaguely to ever match. claude-skill scores specificity / keyword coverage / length and suggests fixes.
  *Nobody else catches why a skill silently never runs.*
- **`doctor`** surfaces the real-world papercuts: duplicate skills across user+project scope,
  name conflicts, and what's actually loaded.
- **Zero-friction sharing** — `claude-skill add github:user/repo`, `claude-skill pack` to bundle/publish.
- **Lean & fast** — tiny dependency footprint, ESM, `npx`-friendly. Works for any agent that uses the
  SKILL.md convention, not just Claude Code.

## Commands

| Command | What it does |
|---|---|
| `create-claude-skill <name>` / `claude-skill new <name>` | Scaffold a skill: valid frontmatter, template body, optional `resources/`. |
| `claude-skill validate [path]` | Lint frontmatter (schema), score **triggerability**, flag anti-patterns. |
| `claude-skill doctor` | Diagnose installed skills: duplicates, conflicts, load issues. |
| `claude-skill list` | List skills in `~/.claude/skills` + `./.claude/skills` with their triggers. |
| `claude-skill add <src>` | Install a skill from `github:user/repo`, a local path, or a registry `<name>`. |
| `claude-skill pack [path]` | Validate, write a portable tarball, and print the `registry.json` entry to PR. |

## What a skill looks like

```markdown
---
name: escalate-smart
description: Decide when an autonomous agent should pause and ask a human vs. proceed on its own. Use when building autonomous/overnight agents, designing escalation policies, or deciding which actions are high-impact enough to require approval.
---

# Escalate Smart
...instructions...
```

`claude-skill validate` checks the frontmatter, then scores how reliably that `description` will
auto-trigger — and tells you exactly how to sharpen it.

## Roadmap

- **v0.1** — `new` + `validate` + `list` (the authoring loop) ✓
- **v0.2** — `doctor` + `add` ✓
- **v0.3** — `pack` + a community `registry.json` (the flywheel) ✓
- **v1.0** — skill **evals** (`claude-skill test`) — prove a skill works

## Share a skill

Built something useful? Get it into the community registry so anyone can `add` it by name:

```bash
npx create-claude-skill pack path/to/your-skill   # validates + prints a registry entry
# paste the entry into registry.json, open a PR — then:
npx create-claude-skill add your-skill
```

## FAQ

**Why not just write `SKILL.md` by hand?** You can — but nothing tells you when a skill silently
won't auto-trigger because its `description` is too vague. `validate`'s triggerability score is the
missing feedback loop, and `new`/`doctor`/`add` remove the rest of the busywork.

**Does it work outside Claude Code?** Yes. It operates on the `SKILL.md` convention (frontmatter +
markdown body), so it works for any agent that loads skills that way — not just Claude Code.

**What's the "triggerability" score?** A 0–100 estimate of how reliably a skill's `description` will
match and fire: it rewards specific trigger conditions and concrete keywords, and penalizes vague
filler (`helper`, `utility`, `various`). It's a heuristic to catch the common failure, not a guarantee.

**Will it touch my existing skills?** Only when you ask. `validate`/`list`/`doctor` are read-only;
`new`/`add` write to `~/.claude/skills` (user scope) or `./.claude/skills` (project scope), and `add`
refuses to overwrite without `--force`.

**Is it safe to run?** It's a tiny, MIT, two-dependency CLI. `add github:…` does a shallow clone into a
temp dir, then validates before installing. No telemetry.

## Install

```bash
npm i -g create-claude-skill      # or just use npx
```

## Contributing

PRs welcome — add a skill to the registry or improve the CLI. See [CONTRIBUTING.md](CONTRIBUTING.md)
for the registry flow and dev setup; `skills/` has a worked example and `src/commands/` is the CLI.

## License

MIT © dapphari007
