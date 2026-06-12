import { describe, expect, it } from 'vitest';
import { scoreTriggerability } from '../src/core/triggerability.js';
import { validateFrontmatter } from '../src/core/skill-schema.js';

describe('scoreTriggerability', () => {
  it('scores a vague description low and suggests fixes', () => {
    const r = scoreTriggerability('A helper utility for various stuff');
    expect(r.score).toBeLessThan(40);
    expect(r.suggestions.length).toBeGreaterThan(0);
  });

  it('scores a specific "use when …" description high', () => {
    const r = scoreTriggerability(
      'Decide when an autonomous agent should pause and ask a human versus proceed. Use when building overnight agents or designing escalation and approval policies for destructive or outward-facing actions.',
    );
    expect(r.score).toBeGreaterThan(70);
  });
});

describe('validateFrontmatter', () => {
  it('errors on a missing name and non-kebab name', () => {
    expect(validateFrontmatter({ description: 'x'.repeat(50) }).some((i) => i.field === 'name')).toBe(true);
    expect(validateFrontmatter({ name: 'NotKebab', description: 'x'.repeat(50) }).some((i) => i.level === 'error')).toBe(true);
  });

  it('accepts a valid skill', () => {
    const issues = validateFrontmatter({
      name: 'escalate-smart',
      description: 'A sufficiently long and specific description of when to use this skill in practice.',
    });
    expect(issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });
});
