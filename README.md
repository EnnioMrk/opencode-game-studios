# OpenCode Game Studios

Turn an OpenCode session into a full game development studio.
**49 agents. 74 skills. One coordinated AI team.**

This is the OpenCode port of [Claude Code Game
Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) by Donchitos
(MIT). The studio design, agents, skills, rules and templates are his; this port
rewires them to OpenCode V2 — agents as OpenCode subagents, skills plus command
wrappers, hooks as one plugin, and path-scoped rules through that plugin.

See [`PORTING.md`](PORTING.md) for the full mapping and what changed.

## Branches

- **`main`** — the published port, with the full engine dimension: the Godot,
  Unity and Unreal agent sets, `/setup-engine`, and `docs/engine-reference/`.
- **`engineless`** — the same toolkit with the whole engine dimension removed,
  for a project that has no game engine: no engine agents, no `/setup-engine`,
  no engine reference docs, no `engine.*` config keys, and no per-engine
  branches in the skills or in the QA specs. Use it for browser, web and
  desktop games that bring their own runtime.

---

## Why This Exists

Building a game solo with AI is powerful — but a single chat session has no
structure. No one stops you from hardcoding magic numbers, skipping design docs,
or writing spaghetti code. There is no QA pass, no design review.

OpenCode Game Studios gives your session the structure of a real studio: 49
specialized agents organized into a hierarchy — directors who guard the vision,
department leads who own their domains, and specialists who do the hands-on
work. Each agent has defined responsibilities, escalation paths, and quality
gates. You still make every decision; the studio asks the right questions and
keeps the project organized from first brainstorm to launch.

---

## What's Included

| Category | Count | Description |
| --- | --- | --- |
| **Agents** | 49 | OpenCode subagents across design, programming, art, audio, narrative, QA, and production |
| **Skills** | 74 | Workflow definitions, loaded by the model (`.opencode/skills/`) |
| **Commands** | 74 | One slash command per skill (`/start`, `/design-system`, `/create-epics`, `/dev-story`, `/story-done`, …) |
| **Hooks** | 12 | Validation and session scripts, wired to OpenCode by one plugin (`.opencode/plugins/ccgs.ts`) |
| **Rules** | 13 | Path-scoped coding standards, injected when an edit matches their globs |
| **Templates** | 39 | Document templates for GDDs, UX specs, ADRs, sprint plans, HUD design, accessibility, and more |

### Studio Hierarchy

```
Tier 1 — Directors
  creative-director    technical-director    producer

Tier 2 — Department Leads
  game-designer        lead-programmer       art-director
  audio-director       narrative-director    qa-lead
  release-manager      localization-lead

Tier 3 — Specialists
  gameplay-programmer  engine-programmer     ai-programmer
  network-programmer   tools-programmer      ui-programmer
  systems-designer     level-designer        economy-designer
  technical-artist     sound-designer        writer
  world-builder        ux-designer           prototyper
  performance-analyst  devops-engineer       analytics-engineer
  security-engineer    qa-tester             accessibility-specialist
  live-ops-designer    community-manager
```

Engine sets for **Godot 4**, **Unity**, and **Unreal Engine 5** are included.
Use the set matching your project. The original template pinned some agents to
Opus and Sonnet; the port sets no model, so every agent inherits your session
model. Add `model: <provider>/<modelID>` to an agent file to pin one —
`PORTING.md` lists the original tiers.

---

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [OpenCode](https://opencode.ai) V2 — or use it through **OpenChamber**
- [Python 3](https://www.python.org/) — reads `project.yaml` for every skill and hook
- Bash — runs the hook scripts (on Windows, install [Git for Windows](https://git-scm.com/downloads/win))
- **Recommended**: [jq](https://jqlang.github.io/jq/)

### Setup

1. **Clone or copy this template**:

```
git clone <this-repo> my-game
cd my-game
```

2. **Open a session in the project root** (the folder with `AGENTS.md` and
   `project.yaml`) — through OpenChamber or with the OpenCode CLI.

3. **Run `/start`** — it asks where you are (no idea, vague concept, clear
   design, existing work) and guides you to the right workflow. Or jump directly
   to a skill:

   - `/brainstorm` — explore game ideas from scratch
   - `/setup-engine godot 4.6` — configure your engine if you already know
   - `/project-stage-detect` — analyze an existing project

---

## Configuration

`project.yaml` at the repo root is the single source of truth for how the studio
behaves on your project — engine, naming conventions, and a `modes` block that
controls how much process every skill enforces. `/start` writes it for you.

The one question that matters most is **`modes.rigor`** — `minimal`, `standard`,
or `full`. It is a single front door over six separate knobs (`workflow`,
`docs.density`, `qa.level`, `story_granularity`, `review_mode`, `team.size`):

- **`minimal`** (default) — jam-game speed. No GDDs required, terse docs,
  minimal QA evidence, solo review. `/start` → `/setup-engine` → `/brainstorm`
  (a one-page brief) → `/create-stories` → `/dev-story` ↔ `/story-done`.
- **`standard`** — 5 required GDD sections, balanced doc depth, lean review.
- **`full`** — all 8 GDD sections, thorough docs, full QA evidence, full
  director review.

View or change any setting with `/settings`:

```
/settings                              # view effective config
/settings modes.review_mode            # view one setting
/settings modes.rigor=full             # write to project.yaml (team-wide)
/settings --local modes.review_mode=solo   # write to project.local.yaml (just you)
```

Full schema: `.opencode/docs/effects-map.md`. Resolution order:
`.opencode/docs/config-resolution.md`.

**OpenCode configuration** lives in `opencode.jsonc`: permission rules (test
runner allowlist, deny rules for `rm -rf`, force pushes, `.env` reads) and
nothing else — plugins, agents, skills and commands are discovered from
`.opencode/` automatically.

---

## How It Works

### Skills and Commands

Each skill has a matching slash command. Typing `/dev-story` runs the command
wrapper, which resolves `project.yaml` settings, then loads the skill. The model
can also load a skill on its own (except the four marked
`disable-model-invocation: true`).

### Hooks

The plugin `.opencode/plugins/ccgs.ts` wires the 12 scripts in
`.opencode/hooks/` to OpenCode:

| Hook | Trigger | What It Does |
| --- | --- | --- |
| `validate-commit.sh` | `git commit` commands | Checks hardcoded values, TODO format, JSON validity, design doc sections |
| `validate-push.sh` | `git push` commands | Warns on pushes to protected branches |
| `validate-assets.sh` | Asset file edits | Checks data-file JSON and asset naming |
| `validate-skill-change.sh` | Skill file edits | Advises running `/skill-test` |
| `session-start.sh` | First model call of a session | Shows branch, recent commits, review mode, session checkpoint |
| `detect-gaps.sh` | First model call of a session | Detects fresh projects and missing design docs |
| `pre-compact.sh` | Before compaction | Logs the compaction |
| `post-compact.sh` | After compaction | Queues a context-restore reminder for the next call |
| `session-stop.sh` | Every turn ends | Archives `active.md` (on change), records git activity, tallies subagent spawns |
| `log-agent.sh` | Subagent spawned | Audit trail |
| `log-agent-stop.sh` | Subagent stops | Audit trail |
| `notify.sh` | — | Kept for manual use; no OpenCode notification hook |

### Path-Scoped Rules

`rules/*.md` carry `paths:` globs (full path: `.opencode/rules/`). When an edit matches one, the plugin injects
the rule text into the model's next call — gameplay code, engine code, AI,
network, UI, data files, shaders, tests, prototypes, design docs, narrative.
Table: `.opencode/docs/rules-reference.md`.

### Collaborative, Not Autonomous

Every agent follows a strict collaboration protocol:

1. **Ask** — agents ask questions before proposing solutions
2. **Present options** — 2–4 options with pros/cons
3. **You decide** — the user always makes the call
4. **Draft** — agents show work before finalizing
5. **Approve** — nothing is written without your sign-off

You stay in control. The agents provide structure and expertise, not autonomy.
The `guided` and `autonomous` automation settings trade some prompts for speed —
see `.opencode/docs/automation-modes.md` and
`.opencode/docs/setup-requirements.md`.

---

## Testing Your Customizations

`CCGS Skill Testing Framework/` is QA for the skills and agents themselves — a
catalog of all 74 skills and 49 agents, per-category rubrics, behavioral specs,
and templates.

```
/skill-test static [name]     # structural linter — 7 compliance checks
/skill-test category [name]   # category-specific quality rubric
/skill-test spec [name]       # behavioral spec assertions
/skill-test audit             # coverage report across skills and agents
/skill-improve [name]         # test-fix-retest loop
```

It tests the *framework*, never your game — game tests live in `tests/`.

---

## About the Original

Claude Code Game Studios is maintained by Donchitos. The studio design,
74 skills, 49 agent definitions, hooks, rules and templates come from that
project; upstream issues and discussion belong there:

- Upstream: https://github.com/Donchitos/Claude-Code-Game-Studios
- License: MIT (see `LICENSE`)
