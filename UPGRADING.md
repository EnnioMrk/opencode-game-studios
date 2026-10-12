# Upgrading

This repository is the **OpenCode port** of Claude Code Game Studios. The
upstream `UPGRADING.md` described migrations between Claude Code releases of the
template and is kept in the original repository:

- Upstream upgrading guide:
  https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/UPGRADING.md
- Upstream changelog:
  https://github.com/Donchitos/Claude-Code-Game-Studios/blob/main/CHANGELOG.md

## If you used the Claude Code template before

Your game project's own files are portable: `project.yaml`, `design/`, `docs/`,
`production/`, `tests/`, the code root. The framework files changed layout:

| Old (Claude Code) | New (OpenCode port) |
|---|---|
| `CLAUDE.md` | `AGENTS.md` |
| `.claude/agents/` | `.opencode/agents/` |
| `.claude/skills/<name>/SKILL.md` | `.opencode/skills/<name>/SKILL.md` + `.opencode/commands/<name>.md` |
| `.claude/hooks/` | `.opencode/hooks/` (wired by `.opencode/plugins/ccgs.ts`) |
| `.claude/rules/` | `.opencode/rules/` (injected by the plugin) |
| `.claude/settings.json` | `opencode.jsonc` |
| `statusline.sh` | removed |
| `CLAUDE.local.md` personal overrides | global `~/.config/opencode/AGENTS.md` + `project.local.yaml` |

Steps:

1. Copy your project files into a fresh clone of this port (or copy the port's
   framework files over your project).
2. Keep `project.yaml` — its schema did not change. `project.local.yaml` stays
   gitignored and keeps working.
3. If you edited agents or skills, re-apply your edits. Agent frontmatter
   changed shape (`tools:` → `permissions:`); see `PORTING.md` for the mapping.
4. Start a session at the project root and run `/help` or `/start` to confirm
   the configuration resolves.

`CHANGELOG.md` is the upstream project's changelog, kept for history. This
port's own changes are described in `PORTING.md`.
