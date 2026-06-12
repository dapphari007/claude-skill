/**
 * Resolve a skill source for `skillkit add`.
 *  - `github:user/repo[/path]`  → fetch from GitHub
 *  - `./local/path`             → copy from disk
 *  - `name`                     → look up in the community registry index
 *
 * SKELETON: source classification only. v0.2 implements fetching + the registry.json index.
 */
export type SkillSource =
  | { kind: 'github'; repo: string; path?: string }
  | { kind: 'local'; path: string }
  | { kind: 'registry'; name: string };

export function resolveSource(src: string): SkillSource {
  if (src.startsWith('github:')) {
    const [repo, ...rest] = src.slice('github:'.length).split('/').reduce<[string, string[]]>(
      (acc, part, i) => (i < 2 ? [acc[0] ? `${acc[0]}/${part}` : part, acc[1]] : [acc[0], [...acc[1], part]]),
      ['', []],
    );
    return { kind: 'github', repo, ...(rest.length ? { path: rest.join('/') } : {}) };
  }
  if (src.startsWith('.') || src.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(src)) {
    return { kind: 'local', path: src };
  }
  return { kind: 'registry', name: src };
}
