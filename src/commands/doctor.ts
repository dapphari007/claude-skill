/**
 * `skillkit doctor` — diagnose the installed-skills setup.
 *
 * v0.1 plan:
 *  - resolve user (~/.claude/skills) + project (./.claude/skills) skill dirs (src/core/locations.ts);
 *  - flag DUPLICATES (same skill name in both scopes — a real papercut), name conflicts, and
 *    skills with invalid/empty frontmatter that silently won't load;
 *  - validate each and summarise a health report (ok / warnings / errors).
 */
export async function doctor(_args: string[]): Promise<void> {
  console.log(`[skillkit doctor] (stub) would report:`);
  console.log(`  - user vs project skills, and duplicates across scopes`);
  console.log(`  - name conflicts + skills that won't load (bad frontmatter)`);
  console.log(`  - per-skill validity, as a health summary`);
}
