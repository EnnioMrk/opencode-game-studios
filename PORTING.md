# Porting Notes — Claude Code Game Studios → OpenCode Game Studios

This repository is a port of
[Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
(MIT, by Donchitos) to **OpenCode V2**. The studio design, the 49 agent prompts,
the 74 skills, the rules, the templates and the hook scripts come from upstream;
the wiring around them was rebuilt for OpenCode.

## Mapping

| Upstream (Claude Code) | Port (OpenCode V2) |
|---|---|
| `CLAUDE.md` + `@` imports | `AGENTS.md` (imports inlined; nested `AGENTS.md` in `docs/`, `design/` load automatically) |
| `.claude/` | `.opencode/` |
| `.claude/agents/<name>.md` (`tools:`, `maxTurns`, `memory`, `disallowedTools`) | `.opencode/agents/<name>.md` (`permissions:` rules, `steps`, `mode: subagent`) |
| `.claude/skills/<name>/SKILL.md` (slash invocation) | `.opencode/skills/<name>/SKILL.md` (model-loaded) + `.opencode/commands/<name>.md` (slash command) |
| `.claude/settings.json` hooks | `.opencode/plugins/ccgs.ts` |
| `.claude/settings.json` permissions | `opencode.jsonc` `permissions` |
| `.claude/rules/*.md` (native path scoping) | `.opencode/rules/*.md`, injected by the plugin |
| `statusline.sh` | Dropped — OpenCode V2 has no statusline (OpenChamber shows its own UI) |
| `CLAUDE_CODE_*` env vars | Dropped — model choice is per agent/command `model: provider/model` |
| Agent memory (`memory: project`, `.claude/agent-memory/`) | Dropped — no OpenCode equivalent; `.opencode/rules/agent-memory.md` still governs the convention |
| Agent Teams (experimental) | Not ported — use subagents (`.opencode/docs/agent-teams.md`) |
| `notify.sh` (Windows toast) | Kept as a script, not wired — no OpenCode notification hook |

## Agents

Each agent became an OpenCode subagent:

- `tools:` → `permissions:` rules. Actions the original tool list excluded are
  denied (`shell`, `edit`, `webfetch`, `websearch`, `question`, `subagent`);
  agents that could spawn only named sub-specialists keep an allow-list.
- `maxTurns:` → `steps:`.
- `disallowedTools:` → an extra deny rule.
- `model:` → removed. Every agent inherits the session model. To restore the
  original tier, add `model: <provider>/<modelID>` to the agent file. The table
  below records the original tier.
- `memory: project` → removed (see Mapping).
- `mode: subagent` is set on all 49: they run in child sessions through the
  `subagent` tool.

### Provenance table

| Agent | Original model | Original tools | Memory |
|---|---|---|---|
| `accessibility-specialist` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `ai-programmer` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `analytics-engineer` | inherit | Read, Glob, Grep, Write, Edit, Bash, WebSearch | — |
| `art-director` | inherit | Read, Glob, Grep, Write, Edit, WebSearch | project |
| `audio-director` | inherit | Read, Glob, Grep, Write, Edit, WebSearch | project |
| `community-manager` | sonnet | Read, Glob, Grep, Write, Edit | — |
| `creative-director` | opus | Read, Glob, Grep, Write, Edit, WebSearch | project |
| `devops-engineer` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `economy-designer` | inherit | Read, Glob, Grep, Write, Edit | project |
| `engine-programmer` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `game-designer` | inherit | Read, Glob, Grep, Write, Edit, WebSearch | project |
| `gameplay-programmer` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `godot-csharp-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `godot-gdextension-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `godot-gdscript-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `godot-shader-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `godot-specialist` | inherit | Read, Glob, Grep, Write, Edit, Bash, Agent(godot-gdscript-specialist, godot-csharp-specialist, godot-shader-specialist, godot-gdextension-specialist) | — |
| `lead-programmer` | sonnet | Read, Glob, Grep, Write, Edit, Bash | project |
| `level-designer` | inherit | Read, Glob, Grep, Write, Edit | project |
| `live-ops-designer` | inherit | Read, Glob, Grep, Write, Edit | — |
| `localization-lead` | inherit | Read, Glob, Grep, Write, Edit, Bash | project |
| `narrative-director` | inherit | Read, Glob, Grep, Write, Edit, WebSearch | project |
| `network-programmer` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `performance-analyst` | inherit | Read, Glob, Grep, Write, Edit, Bash | project |
| `producer` | opus | Read, Glob, Grep, Write, Edit, Bash, WebSearch | project |
| `prototyper` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `qa-lead` | inherit | Read, Glob, Grep, Write, Edit, Bash | project |
| `qa-tester` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `release-manager` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `security-engineer` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `sound-designer` | inherit | Read, Glob, Grep, Write, Edit | — |
| `systems-designer` | inherit | Read, Glob, Grep, Write, Edit | project |
| `technical-artist` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `technical-director` | opus | Read, Glob, Grep, Write, Edit, Bash, WebSearch | project |
| `tools-programmer` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `ue-blueprint-specialist` | sonnet | Read, Glob, Grep, Write, Edit | — |
| `ue-gas-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `ue-replication-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `ue-umg-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `ui-programmer` | inherit | Read, Glob, Grep, Write, Edit, Bash | — |
| `unity-addressables-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `unity-dots-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `unity-shader-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `unity-specialist` | inherit | Read, Glob, Grep, Write, Edit, Bash, Agent(unity-dots-specialist, unity-shader-specialist, unity-addressables-specialist, unity-ui-specialist) | — |
| `unity-ui-specialist` | sonnet | Read, Glob, Grep, Write, Edit, Bash | — |
| `unreal-specialist` | inherit | Read, Glob, Grep, Write, Edit, Bash, Agent(ue-gas-specialist, ue-blueprint-specialist, ue-replication-specialist, ue-umg-specialist) | — |
| `ux-designer` | inherit | Read, Glob, Grep, Write, Edit, WebSearch | project |
| `world-builder` | inherit | Read, Glob, Grep, Write, Edit | project |
| `writer` | inherit | Read, Glob, Grep, Write, Edit | project |

## Skills and Commands

- Frontmatter keeps `name`, `description`, and
  `disable-model-invocation: true` for the four skills that never auto-run.
  Dropped: `argument-hint`, `user-invocable`, `allowed-tools`, `model`,
  `context: fork`.
- Dynamic config injection (`` !`bash … yaml-helper.sh resolve_config …` ``)
  moved into the command wrapper, where OpenCode expands shell blocks. The
  skill body carries a note so a directly loaded skill can run the resolver
  itself.
- `${CLAUDE_SKILL_DIR}` paths were rewritten to project-relative
  `.opencode/...` paths.
- `AskUserQuestion` → `question`; `Agent`/`Task` → `subagent`; `Bash` → `shell`.
- The four skills with `references/` keep them; command wrappers do not read
  them, the skill does.

## Hooks → Plugin

The scripts in `.opencode/hooks/` are unchanged except for path and comment
updates. The plugin synthesizes the Claude Code payload each script parses:

| Script | OpenCode wiring |
|---|---|
| `validate-commit.sh`, `validate-push.sh` | `permission.hook("evaluate")` for shell commands; exit 2 becomes a `deny` with the message |
| `validate-assets.sh`, `validate-skill-change.sh` | `tool.hook("execute.after")` for edit/write; feedback is queued into the next model call |
| `session-start.sh`, `detect-gaps.sh` | `session.hook("context")`, first call of a root session |
| `pre-compact.sh` | `session.hook("compaction")` (log only) |
| `post-compact.sh` | `session.compaction.ended` event; output queued for the next model call |
| `session-stop.sh` | `session.idle` event |
| `log-agent.sh`, `log-agent-stop.sh` | `tool.hook("execute.before"/"execute.after")` for the `subagent` tool |
| `notify.sh` | not wired |

## Rules

OpenCode V2 has no path-scoped rules, so the plugin implements them: it reads
each rule's `paths:` frontmatter at load, watches completed edits, and injects
the matching rule text once per rule per session. Injections are logged to
`production/session-logs/instructions-loaded.log`.

## Tested here

- `bash -n` on every hook and script — syntax check.
- Frontmatter of all 49 agents, 74 skills, 74 commands — parse check; skills and
  commands are 1:1, no orphans.
- `tsc --noEmit` on the plugin against `@opencode/plugin` 2.x.
- A headless OpenCode session in the project (`opencode run --standalone`),
  verified end to end:
  - the plugin loads with no errors;
  - the session-start context is injected on the first call, and the model can
    read the resolved review mode from it;
  - editing `src/gameplay/…` injects the `gameplay-code` rule and logs it to
    `production/session-logs/instructions-loaded.log`;
  - the `gameplay-programmer` subagent launches, answers, and both subagent
    audit lines land in `production/session-logs/agent-audit.log`;
  - `git push origin main` produces the protected-branch warning, which reaches
    the model's context;
  - `git commit` with invalid staged data JSON is denied with the hook's own
    message;
  - `/help` expands its command wrapper, resolves config, and produces correct
    output.
