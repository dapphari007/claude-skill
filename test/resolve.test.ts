import { describe, expect, it } from 'vitest';
import { resolveSource } from '../src/core/registry.js';

describe('resolveSource', () => {
  it('parses github:user/repo', () => {
    expect(resolveSource('github:acme/skills')).toEqual({ kind: 'github', repo: 'acme/skills' });
  });

  it('parses github:user/repo/sub/path', () => {
    expect(resolveSource('github:acme/skills/packs/escalate')).toEqual({
      kind: 'github',
      repo: 'acme/skills',
      path: 'packs/escalate',
    });
  });

  it('treats ./ and absolute paths as local', () => {
    expect(resolveSource('./my-skill').kind).toBe('local');
    expect(resolveSource('C:/x/y').kind).toBe('local');
  });

  it('treats a bare name as a registry lookup', () => {
    expect(resolveSource('escalate-smart')).toEqual({ kind: 'registry', name: 'escalate-smart' });
  });
});
