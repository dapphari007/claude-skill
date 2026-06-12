/**
 * Resolve a skill source for `skillkit add`, and read the community registry index.
 *  - `github:user/repo[/path]`  → fetch from GitHub
 *  - `./local/path`             → copy from disk
 *  - `name`                     → look up in the community registry (registry.json)
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

/** The canonical community registry index (raw on the default branch). */
export const REGISTRY_URL =
  'https://raw.githubusercontent.com/dapphari007/claude-skill/main/registry.json';

export interface RegistryEntry {
  /** A `resolveSource`-compatible spec, e.g. `github:user/repo/path`. */
  source: string;
  description?: string;
  author?: string;
}

export interface RegistryIndex {
  skills: Record<string, RegistryEntry>;
}

/** Pure lookup: find a skill entry in a registry index by name. */
export function lookupRegistry(index: RegistryIndex, name: string): RegistryEntry | undefined {
  return index.skills?.[name];
}

/** Fetch + shape-check the community registry index (network). */
export async function fetchRegistry(url: string = REGISTRY_URL): Promise<RegistryIndex> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`registry fetch failed (HTTP ${res.status})`);
  const json = (await res.json()) as RegistryIndex;
  if (!json || typeof json !== 'object' || typeof json.skills !== 'object') {
    throw new Error('malformed registry index (expected { skills: {...} })');
  }
  return json;
}

/** Extract `user/repo` from an https or ssh GitHub remote URL, else null. */
export function githubFromRemote(remote: string): string | null {
  const m = remote.trim().match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  return m ? `${m[1]}/${m[2]}` : null;
}
