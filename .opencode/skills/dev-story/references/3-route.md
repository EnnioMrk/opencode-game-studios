# /dev-story — Phase 3: Route to the Right Programmer

> Part of `/dev-story`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 3: Route to the Right Programmer

Based on the story's **Layer**, **Type**, and **system name**, determine which
specialist to spawn via `Agent`.

**Config/Data stories — skip agent spawning entirely:**
If the story's Type is `Config/Data`, no programmer agent is needed. Jump directly to Phase 4 (Config/Data note). The implementation is a data file edit — no routing table evaluation.

### Primary agent routing table

| Story context | Primary agent |
|---|---|
| Foundation layer — any type | `engine-programmer` |
| Any layer — Type: UI | `ui-programmer` |
| Any layer — Type: Visual/Feel | `gameplay-programmer` (implements) |
| Core or Feature — gameplay mechanics | `gameplay-programmer` |
| Core or Feature — AI behaviour, pathfinding | `ai-programmer` |
| Core or Feature — networking, replication | `network-programmer` |
| Config/Data — no code | No agent needed (see Phase 4 Config note) |

### Secondary specialists

No secondary specialist exists for this project — the primary agent from the
table above is the whole routing for a code story.

---
