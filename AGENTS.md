# OpenCode Game Studios — Game Studio Agent Architecture

Indie game development managed through 34 coordinated OpenCode subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

This is the OpenCode port of **Claude Code Game Studios** by Donchitos (MIT).
See `PORTING.md` for what changed and `README.md` for how to use it.

## Technology Stack

- **Stack**: [CHOOSE: runtime, language and packaging]
- **Language**: [CHOOSE]
- **Version Control**: Git with trunk-based development
- **Build System**: [SPECIFY: build, test and run commands]
- **Asset Pipeline**: [SPECIFY]

## Tool Map (Claude Code → OpenCode)

| Claude Code | OpenCode | Notes |
|---|---|---|
| `Read` | `read` | |
| `Write`, `Edit` | `write`, `edit` |
| `Glob`, `Grep` | `glob`, `grep` |
| `Bash` | `shell` |
| `Agent` / `Task` | `subagent` |
| `AskUserQuestion` | `question` |
| `WebSearch` | `websearch` |
| Skills (`.claude/skills/<name>/SKILL.md`) | Skills (`.opencode/skills/<name>/SKILL.md`) + command wrapper (`.opencode/commands/<name>.md`) |
| Hooks (Claude Code `settings.json`) | `.opencode/plugins/ccgs.ts` |
| `CLAUDE.md` | `AGENTS.md` |
| Path-scoped rules | `.opencode/rules/*.md`, injected by the plugin |

## Project Structure

```text
/
├── AGENTS.md                    # Master configuration
├── project.yaml                 # Machine-readable project config — modes, stage, platform (source of truth)
├── opencode.json                # OpenCode configuration (permissions)
├── .opencode/                   # Agent definitions, skills, commands, hooks, rules, docs
├── src/                         # Game source code
├── assets/                      # Game assets (art, audio, vfx, shaders, data)
├── design/                      # Game design documents (gdd, narrative, levels, balance)
├── docs/                        # Technical documentation (architecture, api, postmortems)
├── tests/                       # Game test suites (unit, integration, performance, playtest)
├── tools/                       # Build and pipeline tools (ci, build, asset-pipeline)
├── prototypes/                  # Throwaway prototypes (outside the code root)
├── production/                  # Production management (sprints, milestones, releases)
│   ├── session-state/           # Ephemeral session state (active.md — gitignored)
│   └── session-logs/            # Session audit trail (gitignored)
└── CCGS Skill Testing Framework/ # QA for the skills/agents themselves — /skill-test, /skill-improve
```

### Code and test roots

The code root is `src/` and the test root is `tests/`. Layout:
`.opencode/docs/directory-structure.md`.

## Project Reference

The project's own truth lives in `docs/`. The studio's `design/gdd/`,
`production/` and `CCGS Skill Testing Framework/` trees start empty.

## Technical Preferences

`project.yaml` at the repo root is the primary config store — naming, platform,
performance, modes. Skills resolve it via `resolve_config`
(see `.opencode/docs/config-resolution.md`).

`.opencode/docs/technical-preferences.md` is the **legacy fallback**, read on demand
when a key is absent from `project.yaml`. It is no longer loaded at session start:
it is almost entirely placeholders, and `project.yaml` holds the real values.

## Coordination Rules

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

### Model Tier Assignment

Read `.opencode/docs/model-tiers.md` on demand. **Key point:** skills have no
`model:` in the port — a skill runs on the session model unless its command
wrapper pins one. Agent files may set `model: <provider>/<modelID>`; none is set
by default, so every agent inherits the session model.

### Subagents and Agent Teams

Subagents are spawned via the `subagent` tool: fresh child sessions,
independent context, results returned to the parent. All `team-*` skills use
them. If two subagents' inputs are independent, issue both calls before waiting
for either result. The original template's experimental "Agent Teams" mode is
**not ported** — see `.opencode/docs/agent-teams.md`.

### Parallel Task Protocol

When an orchestration skill spawns multiple independent agents:

1. Issue all independent `subagent` calls before waiting for any result
2. Collect all results before proceeding to dependent phases
3. If any agent is BLOCKED, surface it immediately — do not silently skip
4. Always produce a partial report if some agents complete and others block

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using write/edit tools
  (exempt: `active.md` appends, agent memory, a subagent's new file at the path
  its orchestrating skill named; see `.opencode/rules/agent-memory.md`)
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction
- A skipped or dismissed question is not an answer: act on nothing, re-ask in
  plain text and wait
- Started outside this file's folder? The project config (agents, skills, hooks,
  rules) loads only inside this project tree — start sessions at or under the
  project root

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** If the project has no game concept yet, run `/start` to
> begin the guided onboarding flow.

## Rules and Hooks

- **Path-scoped rules** live in `.opencode/rules/`. The plugin
  (`.opencode/plugins/ccgs.ts`) injects a rule's text when an edit matches its
  `paths:` glob; the log lands in `production/session-logs/instructions-loaded.log`.
  Full table: `.opencode/docs/rules-reference.md`.
- **Hooks** are wired by the same plugin: commit/push validation, asset checks,
  session start/stop, compaction, subagent audit trail. Full table:
  `.opencode/docs/hooks-reference.md`.

## Coding Standards

- All game code must include doc comments on public APIs
- Architecture decisions are recorded as ADRs in `docs/architecture/`. **How many is
  set by `modes.workflow`** — all ADRs at `full`, *critical* ADRs only at `standard`,
  and none required at `minimal`, where the decision log and `design/game-brief.md`
  carry the rationale instead. See `.opencode/docs/workflow-modes.md`.
- Gameplay values must be data-driven (external config), never hardcoded
- All public methods must be unit-testable (dependency injection over singletons)
- Commits must reference the relevant design document or task ID
- **Commit messages**: Use Conventional Commits format — `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. Reference the story or task ID in the body (e.g., `Story: EPIC-001-S02`).
- **Verification-driven development**: Write tests first when adding gameplay systems.
  For UI changes, verify with screenshots. Compare expected output to actual output
  before marking work complete.
- **A parse check is not a run.** Every story that changes something
  player-observable is launched and observed before it closes, and the
  observation is a retained screenshot in `production/qa/evidence/`. Procedure:
  `.opencode/docs/run-and-observe.md`.

### Design Document Standards

- All design docs use Markdown
- Each mechanic has a dedicated document in `design/gdd/`
- **How many of the 8 sections are required depends on `modes.workflow`** —
  all 8 at `full`, 5 at `standard`, and no GDD at all at `minimal`, where
  `design/game-brief.md` is the design record. The 8 sections: Overview, Player
  Fantasy, Detailed Rules, Formulas, Edge Cases, Dependencies, Tuning Knobs,
  Acceptance Criteria. Full text and testing standards:
  `.opencode/docs/coding-standards.md`.

## Context Management

Read `.opencode/docs/context-management.md` on demand — it is a reference, not
session context. Two conventions are load-bearing and are restated here:

- **`production/session-state/active.md` is the session checkpoint.** The file is
  the memory, not the conversation. Read it first after any compaction, crash, or
  restart.
- **Helpers in `.opencode/scripts/` emit observations, never verdicts.** A script
  that scores or judges will eventually contradict a mode or override it cannot
  see.
