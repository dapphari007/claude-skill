# Contributing

Thanks for helping make `create-claude-skill` better. Two ways to contribute: **add a skill to the
registry** (no build needed) or **improve the CLI**.

## Add your skill to the community registry

The registry (`registry.json`) is what powers `npx create-claude-skill add <name>`. To list yours:

1. Make sure your skill validates and triggers well:
   ```bash
   npx create-claude-skill validate path/to/your-skill
   ```
   Aim for a triggerability score of **70+** — a vague `description` is the #1 reason a skill never
   fires.
2. Generate the registry entry (auto-fills the `github:` source from your repo's git remote):
   ```bash
   npx create-claude-skill pack path/to/your-skill
   ```
3. Paste the printed entry into the `skills` object in [`registry.json`](registry.json), keep the
   keys sorted, and open a PR. Once merged, anyone can run `npx create-claude-skill add <name>`.

Keep `description` specific (what it does **and** when to use it) and `source` pointing at a public
GitHub path that contains a `SKILL.md`.

## Work on the CLI

```bash
git clone https://github.com/dapphari007/claude-skill
cd claude-skill
npm install
npm run dev -- validate skills/escalate-smart   # run a command without building
npm run typecheck && npm test && npm run build   # must be green before a PR
```

- **TypeScript, ESM, NodeNext** — use `.js` extensions on relative imports.
- **Pure logic in `src/core/`, side effects in `src/commands/`.** New pure functions get a vitest test
  in `test/`.
- Keep the dependency footprint tiny (currently two runtime deps). Prefer Node built-ins.
- Conventional commit subjects (`feat:`, `fix:`, `docs:`, `test:`).

CI runs typecheck + tests + build on every push and PR — green is the bar.

## Regenerate the demo

`demo.gif` is generated, not hand-edited:

```bash
npm i -D @napi-rs/canvas gifenc
node scripts/make-gif.mjs
```

MIT-licensed; by contributing you agree your work ships under the same license.
