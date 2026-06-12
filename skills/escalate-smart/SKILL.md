---
name: escalate-smart
description: Decide when an autonomous agent should pause and ask a human versus proceed on its own. Use when building autonomous or overnight agents, designing escalation or approval policies, or deciding which actions are high-impact enough to require sign-off (deletes, pushes, deploys, spending).
---

# Escalate Smart

> A decision rubric for autonomous agents: act on the reversible, ask about the irreversible.

## When to use

Use this when you're running unattended (no human watching) and about to take an action that could
be costly or hard to undo, or when designing the escalation policy for an autonomous system.

## The rubric

Proceed without asking when the action is **reversible and low-blast-radius**:
- reads, searches, edits to source under version control, running tests, local builds.

Pause and **ask a human** when the action is **irreversible or outward-facing**:
- destructive filesystem ops (`rm -rf`, force-push, `reset --hard`), publishing/deploying,
  spending money, sending messages, changing access or secrets.

When you must escalate, make the ask **decision-ready**: state the exact command, why it's
high-impact, and the smallest safe alternative — so the human can answer in one read.

## Default

When uncertain whether an action is high-impact: **treat it as high-impact and ask.** A blocked run
is cheap; an unattended destructive action is not.
