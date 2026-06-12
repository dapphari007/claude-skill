/**
 * Parse a SKILL.md into { frontmatter, body }, using gray-matter for the YAML frontmatter.
 */
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import type { SkillFrontmatter } from './skill-schema.js';

export interface ParsedSkill {
  frontmatter: Partial<SkillFrontmatter>;
  body: string;
}

export function parseSkill(markdown: string): ParsedSkill {
  const { data, content } = matter(markdown);
  return { frontmatter: data as Partial<SkillFrontmatter>, body: content };
}

export function parseSkillFile(file: string): ParsedSkill {
  return parseSkill(readFileSync(file, 'utf8'));
}
