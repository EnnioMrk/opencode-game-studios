# Model Tier Assignment

> ### How models are chosen in the port
>
> **Skills have no `model:` field in OpenCode.** A skill runs on the model active
> in the session. The matching command wrapper in `.opencode/commands/` may set
> one — command frontmatter accepts `model: <provider>/<modelID>[#variant]`, and
> that overrides the session model for that command. Nothing is set by default,
> so a command runs on the session model.
>
> **Agents may set `model:`** in `.opencode/agents/*.md`. A subagent uses its
> configured model, or inherits the parent session's model when none is set. The
> port sets none, so every agent inherits. To restore an original tier, add one
> line, for example `model: anthropic/claude-opus-4-5`, using a provider and
> modelID your OpenCode configuration has.
>
> The original Claude Code template pinned 19 agents and 8 skills. The lists
> below record those tiers. They are provenance, not active configuration.

Skills and agents are graded by task complexity:

| Tier | Original alias | When to use | Port equivalent |
|------|----------|-------------|-----------------|
| **Haiku** | `haiku` | Read-only status checks, formatting, simple lookups — no creative judgment needed | A small, fast `provider/model` — or leave the session model |
| **Sonnet** | `sonnet` | Implementation, design authoring, analysis of individual systems — default for most work | A mid-tier `provider/model` — or leave the session model |
| **Opus** | `opus` | Multi-document synthesis, high-stakes phase gate verdicts, cross-system holistic review | A top-tier `provider/model` — or leave the session model |
| **Session** | `inherit` | Agents only — runs on whatever model the session runs | The default: omit `model:` |

Skills with the original `haiku` tier (5): `/help`, `/onboard`,
`/project-stage-detect`, `/scope-check`, `/sprint-status`

> `/patch-notes` and `/changelog` were `sonnet`, not `haiku`: both produce
> **player-facing** copy and need judgement the cheapest tier is defined as not
> doing. Full reasoning in each skill's own header.
>
> `/settings` was moved off `haiku` for the same reason. It does not only read
> and format — it resolves every leaf with provenance and then compares the
> configured rigor against the project's observable working practice. That is
> synthesis, which is what the Haiku row is defined as excluding.

Skills with the original `opus` tier (3): `/architecture-review`, `/gate-check`,
`/review-all-gdds`

All other skills were Sonnet. When creating a new skill, grade it the same way:
small and read-only gets the cheap tier, 5+ documents synthesized into a
high-stakes verdict gets the top tier, everything else the middle one.

**Agent model tiers.** 30 agents used `inherit`, so they ran on the session's
model; the port keeps that. 19 were pinned in the original template; the port
keeps 7 of them:

- **opus (3):** `creative-director`, `producer`, `technical-director`
- **sonnet (4):** `lead-programmer`, `prototyper`, `devops-engineer`,
  `community-manager`. `/team-release` spawns
  `devops-engineer` and `community-manager`, and `/team-live-ops` spawns
  `community-manager`.
- **haiku (0):** no agent. The Haiku row above is for read-only lookups and
  formatting; every agent drafts, writes or judges. Building CI pipelines and
  writing player-facing text are Sonnet work, as they are for `/patch-notes`.

`PORTING.md` carries the full agent table with the original tier per agent.

A pinned agent gets that model's context window, whatever the session runs. A
subagent starts from the brief it is given, not the parent's conversation, so
this only matters when a brief is very large. To run every subagent on the
session's model in the port, do nothing — that is already the default. To pin
some agents, add `model:` to those agent files only.
