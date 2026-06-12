/**
 * `skillkit pack [path]` — bundle a skill for sharing.
 *
 * v0.3 plan: validate, then produce a portable tarball (SKILL.md + resources/), or publish to npm
 * as a scoped package / open a PR to the community registry index.
 */
export async function pack(args: string[]): Promise<void> {
  const path = args[0] ?? '.';
  console.log(`[skillkit pack] (stub) would validate ${path} and bundle it (tarball / npm / registry PR).`);
}
