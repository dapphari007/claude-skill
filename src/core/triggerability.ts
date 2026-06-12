/**
 * Triggerability score — skillkit's headline feature.
 *
 * Skills auto-fire based on their `description`. Most authors write descriptions that are too
 * vague ("helps with code") to ever match a user's request, and nothing tells them why their
 * skill never runs. This module scores how reliably a description will trigger and returns
 * concrete suggestions to sharpen it.
 *
 * SKELETON: a deliberately simple heuristic so the SHAPE is clear and reviewable. v0.1 refines
 * the weights against a corpus of real skills (and optionally an offline embedding check).
 */

export interface TriggerScore {
  /** 0–100; higher = more likely to auto-trigger on a relevant request. */
  score: number;
  suggestions: string[];
}

// Signals that a description names concrete trigger conditions (good for matching).
const ACTION_CUES = ['use when', 'when the user', 'when you', 'for', 'to ', 'if '];
const VAGUE_WORDS = ['helps', 'helper', 'utility', 'various', 'stuff', 'things', 'general'];

export function scoreTriggerability(description: string): TriggerScore {
  const text = (description ?? '').trim();
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const suggestions: string[] = [];
  let score = 50;

  // Length: too short can't carry trigger conditions; too long dilutes the match.
  if (words.length < 8) {
    score -= 25;
    suggestions.push('Add specific trigger conditions — what task/keywords should activate this?');
  } else if (words.length > 60) {
    score -= 10;
    suggestions.push('Trim to the essential “what + when”; move detail into the body/resources.');
  } else {
    score += 10;
  }

  // Does it state WHEN to use it?
  if (ACTION_CUES.some((c) => lower.includes(c))) score += 20;
  else suggestions.push('State WHEN to use it (e.g. “Use when …”, “… when the user asks to …”).');

  // Concrete trigger keywords a user might actually type?
  const distinctKeywords = new Set(words.filter((w) => w.length > 4 && !VAGUE_WORDS.includes(w)));
  if (distinctKeywords.size >= 6) score += 15;
  else suggestions.push('Name concrete keywords/verbs a user would actually type for this task.');

  // Penalise vague filler.
  if (VAGUE_WORDS.some((v) => lower.includes(v))) {
    score -= 15;
    suggestions.push('Replace vague words (helper/utility/various) with the precise capability.');
  }

  return { score: Math.max(0, Math.min(100, score)), suggestions };
}
