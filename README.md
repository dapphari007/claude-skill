# create-claude-skill

> **create-react-app, but for Claude Code skills.** Scaffold, validate, and share agent skills — one `npx` away.

[![npm version](https://img.shields.io/npm/v/create-claude-skill.svg)](https://www.npmjs.com/package/create-claude-skill) [![CI](https://github.com/dapphari007/claude-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/dapphari007/claude-skill/actions/workflows/ci.yml) [![npm downloads](https://img.shields.io/npm/dm/create-claude-skill.svg)](https://www.npmjs.com/package/create-claude-skill) [![license: MIT](https://img.shields.io/npm/l/create-claude-skill.svg)](LICENSE)

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
| `claude-skill add <src>` | Install a skill from `github:user/repo`, a local path, or the registry. |
| `claude-skill pack [path]` | Bundle a skill (tarball) or publish for sharing. |

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
- **v0.3** — `pack`/publish + a community `registry.json` (the flywheel)
- **v1.0** — skill **evals** (`claude-skill test`) — prove a skill works

## Install

```bash
npm i -g create-claude-skill      # or just use npx
```

## Contributing

Skills and command improvements welcome — see `skills/` for examples and `src/commands/` for the CLI.
PRs add skills to the registry.

## License

MIT © dapphari007
