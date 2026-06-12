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
    const parts = src.slice('github:'.length).split('/').filter(Boolean);
    const repo = parts.slice(0, 2).join('/');
    const path = parts.slice(2).join('/');
    return path ? { kind: 'github', repo, path } : { kind: 'github', repo };
  }
  if (src.startsWith('.') || src.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(src)) {
    return { kind: 'local', path: src };
  }
  return { kind: 'registry', name: src };
}
