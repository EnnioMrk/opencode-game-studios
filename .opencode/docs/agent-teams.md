# Agent Teams (not ported)

> On-demand reference. Read this when considering how to run work in parallel.

The original Claude Code template offered an experimental **Agent Teams** mode:
multiple independent sessions coordinated via a shared task list, opt-in through
a `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` environment variable.

**That mode is not part of the OpenCode port.** OpenCode V2 has no equivalent
built-in feature, and this port does not emulate one.

## What to use instead

- **Subagents (always available).** Spawn them through the `subagent` tool. They
  run in fresh child sessions, in the foreground or in the background, and the
  result comes back to the parent. All `team-*` skills and orchestration skills
  use this pattern.
- **Parallel subagent calls.** If two subagents' inputs are independent, issue
  both `subagent` calls before waiting for either result. `/review-all-gdds`
  Phase 2 and Phase 3 are the canonical example.
- **Multiple sessions by hand.** You can run several OpenCode sessions (or a
  session per worktree) and coordinate them yourself. Nothing in this port
  automates that coordination.

## When parallelism helps

- Work spans multiple subsystems that will not touch the same files
- Each workstream would take >30 minutes and benefits from true parallelism
- A senior agent (technical-director, producer) coordinates 3+ specialists on
  different epics

## When it does not

- One workstream's output is required as input for another (run sequential
  subagents)
- The task fits in a single session's context (use subagents instead)
- Cost is a concern — each parallel subagent burns tokens independently
