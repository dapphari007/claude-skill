import { describe, expect, it } from 'vitest';
import { githubFromRemote, lookupRegistry, type RegistryIndex } from '../src/core/registry.js';

const INDEX: RegistryIndex = {
  skills: {
    'escalate-smart': { source: 'github:acme/skills/escalate-smart', description: 'x' },
  },
};

describe('lookupRegistry', () => {
  it('returns the entry for a known name', () => {
    expect(lookupRegistry(INDEX, 'escalate-smart')?.source).toBe('github:acme/skills/escalate-smart');
  });

  it('returns undefined for an unknown name', () => {
    expect(lookupRegistry(INDEX, 'nope')).toBeUndefined();
  });
});

describe('githubFromRemote', () => {
  it('parses https remotes (with and without .git)', () => {
    expect(githubFromRemote('https://github.com/dapphari007/claude-skill.git')).toBe('dapphari007/claude-skill');
    expect(githubFromRemote('https://github.com/dapphari007/claude-skill')).toBe('dapphari007/claude-skill');
  });

  it('parses ssh remotes', () => {
    expect(githubFromRemote('git@github.com:dapphari007/claude-skill.git')).toBe('dapphari007/claude-skill');
  });

  it('returns null for non-github remotes', () => {
    expect(githubFromRemote('https://gitlab.com/x/y.git')).toBeNull();
  });
});
