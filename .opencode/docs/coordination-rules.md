# Agent Coordination Rules

1. **Vertical Delegation**: Leadership agents delegate to department leads, who
   delegate to specialists. Never skip a tier for complex decisions.
2. **Horizontal Consultation**: Agents at the same tier may consult each other
   but must not make binding decisions outside their domain.
3. **Conflict Resolution**: When two agents disagree, escalate to the shared
   parent. If no shared parent, escalate to `creative-director` for design
   conflicts or `technical-director` for technical conflicts.
4. **Change Propagation**: When a design change affects multiple domains, the
   `producer` agent coordinates the propagation.
5. **No Unilateral Cross-Domain Changes**: An agent must never modify files
   outside its designated directories without explicit delegation.

## Model Tier Assignment

Read `.opencode/docs/model-tiers.md` on demand. It carries the tier table, the
per-skill assignments and the authoring rule.

**Key point:** skills have no `model:` in the port — a skill runs on the session
model unless its command wrapper pins one. Whether a pin applies therefore
depends on how the skill is started: typing `/skill-name` runs the wrapper (and
its `model:` if set); loading the skill through the skill tool does not. The
agent-side `model:` is a different mechanism, and is applied when set.

## Subagents vs Agent Teams

This project uses two distinct multi-agent patterns:

### Subagents (current, always active)
Spawned via the `subagent` tool within a single OpenCode session. Used by all
`team-*` skills and orchestration skills. Subagents run in fresh child sessions
(foreground or background), use their own configured permissions, and return
results to the parent.

**When to spawn in parallel**: If two subagents' inputs are independent (neither
needs the other's output to begin), spawn both `Agent` calls simultaneously
rather than waiting. Example: `/review-all-gdds` **Phase 2** (consistency) and
**Phase 3** (design theory) are independent — spawn both at the same time.
Phase 1 loads the GDDs and both depend on it, so it is the one phase here that
must NOT be parallelised.

### Agent Teams (not ported)
The original Claude Code template offered an experimental multi-session mode.
OpenCode V2 has no equivalent; the port uses subagents only. Read
`.opencode/docs/agent-teams.md` before proposing parallel sessions by hand.

## Parallel Task Protocol

When an orchestration skill spawns multiple independent agents:

1. Issue all independent `subagent` calls before waiting for any result
2. Collect all results before proceeding to dependent phases
3. If any agent is BLOCKED, surface it immediately — do not silently skip
4. Always produce a partial report if some agents complete and others block
