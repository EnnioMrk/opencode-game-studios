# Active Hooks

The 12 ported hook scripts are wired to OpenCode by one plugin:
`.opencode/plugins/ccgs.ts`. The plugin translates OpenCode's hooks and events
into the JSON shape each script expects, then passes results back:

- a **denial** becomes a permission `deny` message, so the command is blocked
  with the reason;
- a **warning** is appended to the tool result, so the model sees it.

| Hook script | OpenCode wiring | Trigger | Action |
| ---- | ----- | ------- | ------ |
| `validate-commit.sh` | `permission.hook("evaluate")` + `tool.hook("execute.after")` | `git commit` commands | Validates design doc sections, JSON data files, hardcoded values, TODO format; blocks on a must-fix problem and warns otherwise |
| `validate-push.sh` | `permission.hook("evaluate")` + `tool.hook("execute.after")` | `git push` commands | Warns on pushes to protected branches (`main`, `master` and `release/*`) |
| `validate-assets.sh` | `tool.hook("execute.after")` | `edit`/`write` on asset files | Checks data-file JSON under `assets/`, `Assets/` or `Content/`, and asset naming in Godot's `assets/` only |
| `validate-skill-change.sh` | `tool.hook("execute.after")` | Skill file changes | Advises running `/skill-test` after any `.opencode/skills/` file is written or edited |
| `session-start.sh` | `session.hook("context")` | First model call of a root session | Loads sprint context, milestone, git activity; detects and previews active session state file for recovery |
| `detect-gaps.sh` | `session.hook("context")` | First model call of a root session | Detects fresh projects (suggests /start) and missing documentation when code/prototypes exist, suggests /reverse-document or /project-stage-detect |
| `pre-compact.sh` | `session.hook("compaction")` | Context compression | Logs the compaction to `production/session-logs/compaction-log.txt` |
| `post-compact.sh` | `session.compaction.ended` event | After compaction | The plugin queues its reminder and adds it to the next model call, so the skill sees the recovered session state |
| `notify.sh` | *not wired* | — | The Windows toast helper stays in `.opencode/hooks/` for manual use; OpenCode V2 has no notification hook to attach it to |
| `session-stop.sh` | `session.idle` event | **Every turn ends** — not once per session | Summarizes accomplishments, updates session log, and writes the subagent spawn tally to `production/session-logs/session-cost.md`. Archives `active.md` only when its content hash changed; without that guard a long session appended the whole file on every turn. |
| `log-agent.sh` | `tool.hook("execute.before")` on the `subagent` tool | Subagent spawned | Audit trail start — logs subagent invocation with timestamp and session id |
| `log-agent-stop.sh` | `tool.hook("execute.after")` on the `subagent` tool | Subagent stops | Audit trail stop — completes the subagent record |

Warnings from the four `validate-*` hooks are passed to the model as text on the
tool result (`hook_warn` in `yaml-helper.sh`); only a problem that must be fixed
now is delivered as a blocked call. See `hooks-reference/hook-input-schemas.md`
for the payload the plugin synthesizes for each script.

`session-start.sh` and `detect-gaps.sh` run **once per root session**, on the
first model call. Child sessions (subagents) do not run them.

### Subagent cost visibility

`log-agent.sh` writes a record per spawn to `production/session-logs/agent-audit.log`
in a fixed three-field shape:

```
YYYYMMDD_HHMMSS | <session_id> | Agent invoked: <agent_type>
```

`session-stop.sh` greps the literal string `" | $SESSION_ID | Agent invoked: "`
to tally the current session, then writes a count plus a per-agent breakdown to
`production/session-logs/session-cost.md` and echoes a one-line total.

The field order of that record is fixed. `session-stop.sh` matches it literally,
so a different order silently zeroes the spawn count instead of raising an error.

When the hook input has no session id, `session-stop.sh` prints no total. A
total spanning every session in the log would look plausible and be wrong, which
is worse than none.

`agent_type` — not `agent_name` — is the field carrying the agent name. See
`hooks-reference/hook-input-schemas.md`.

## Events considered and deliberately not added

OpenCode V2 offers many more events and hooks than the plugin uses. These were
evaluated and not adopted, for the reasons given.

| Event / hook | Why not |
| ---- | ---- |
| `session.hook("prompt")` | Would re-inject session state on **every prompt**. `.opencode/docs/config-resolution.md` already rejects the weaker version of this — injecting config at session start — because it "would cost tokens on every session whether or not any skill needs config, and it would go stale mid-session as `/settings` writes land". Firing per prompt is the same argument, multiplied. |
| `session.instructions.updated` | Useful for debugging which `AGENTS.md` files loaded, but it is a diagnostic, not a project requirement. Watch it in your own plugin when you need it rather than paying for it on every change. |
| `file.edited` / `filesystem.changed` on `project.yaml` | Config is resolved per skill invocation, in the command wrapper, precisely so each run reads fresh values. The only staleness left is text already injected into an earlier invocation, which is the accepted trade in `config-resolution.md`. |
| `tool.hook("execute.before")` input rewriting | Could rewrite a non-conventional commit message instead of blocking it. Silently editing the user's input contradicts the collaboration protocol: this project blocks and explains rather than acting unasked. |
| `session.tool.failed` | Would add another log with no reader. Failures already reach the model and the session log. |
| `session.deleted` | `session-stop.sh` stays on `session.idle`. Session deletion fires on explicit removal, which a crash may never reach, and the content-hash guard already makes the per-turn firing cheap. |
| `permission.asked` / `permission.replied` | Would duplicate the permission `evaluate` hook's own correlation, and adds no project rule. |

Hook reference documentation: `.opencode/docs/hooks-reference/`
Hook input schema documentation: `.opencode/docs/hooks-reference/hook-input-schemas.md`
