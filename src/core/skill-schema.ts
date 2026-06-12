/**
 * The contract for a Claude Code / Agent skill's `SKILL.md` frontmatter.
 *
 * SKELETON: a plain TS type + a dependency-free validator so the schema reads clearly.
 * v0.1 hardens this with zod (declared in package.json) for precise error messages.
 */

export interface SkillFrontmatter {
  /** kebab-case identifier, used to invoke the skill as `/name`. Required. */
  name: string;
  /**
   * What the skill does AND when to use it — this string is the auto-trigger surface,
   * so it must be specific. Required.
   */
  description: string;
  /** Optional hint shown for skills that take arguments. */
  'argument-hint'?: string;
  /** Optional tool allow-list the skill is permitted to use. */
  'allowed-tools'?: string[];
}

export interface ValidationIssue {
  level: 'error' | 'warn';
  field: string;
  message: string;
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Structural validation of frontmatter (separate from the triggerability score). */
export function validateFrontmatter(fm: Partial<SkillFrontmatter>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!fm.name) {
    issues.push({ level: 'error', field: 'name', message: 'name is required' });
  } else if (!KEBAB.test(fm.name)) {
    issues.push({ level: 'error', field: 'name', message: 'name must be kebab-case' });
  }
  if (!fm.description) {
    issues.push({ level: 'error', field: 'description', message: 'description is required' });
  } else if (fm.description.length < 40) {
    issues.push({
      level: 'warn',
      field: 'description',
      message: 'description is short — it likely won’t auto-trigger reliably (see `validate`)',
    });
  }
  if (fm['allowed-tools'] && !Array.isArray(fm['allowed-tools'])) {
    issues.push({ level: 'error', field: 'allowed-tools', message: 'allowed-tools must be a list' });
  }
  return issues;
}
