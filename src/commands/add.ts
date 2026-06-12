/**
 * `skillkit add <src>` — install a skill into the user or project scope.
 *
 * v0.2 plan: resolve <src> (src/core/registry.ts) from `github:user/repo[/path]`, a local path,
 * or the community registry; copy the skill dir into the chosen scope; run validate after install.
 */
export async function add(args: string[]): Promise<void> {
  const src = args[0];
  if (!src) {
    console.error('Usage: skillkit add <github:user/repo | ./path | registry-name>');
    process.exitCode = 1;
    return;
  }
  console.log(`[skillkit add] (stub) would install "${src}" into the chosen scope and validate it.`);
}
