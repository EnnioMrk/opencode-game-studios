# Hook Input/Output Schemas

The ported hook scripts keep their original Claude Code input format. The
OpenCode plugin (`.opencode/plugins/ccgs.ts`) **synthesizes** that format from
OpenCode's own hooks and events, runs the script, and applies its result — a
denial blocks the call, a warning reaches the model. This document describes the
payloads the scripts receive, so they stay testable and replaceable.

Every synthesized payload also carries the common fields `session_id`,
`transcript_path`, `cwd` and `hook_event_name`; the examples below show the
event-specific ones. The upstream reference for the original format is the
Claude Code hooks documentation (https://code.claude.com/docs/en/hooks).

## PreToolUse

Fired before a tool is executed. Exit 2 **blocks** the call. Exit 0 lets it
continue through the normal permission flow — it does not approve it, and the
user can still be asked. To warn without blocking, exit 0 and print hook JSON —
see [Output](#output-warnings-someone-sees) below.

### PreToolUse: Bash

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "git commit -m 'feat: add player health system'",
    "description": "Commit changes with message",
    "timeout": 120000
  }
}
```

The PowerShell tool sends the same shape with `"tool_name": "PowerShell"`, so a
matcher of `Bash|PowerShell` covers both.

### PreToolUse: Write

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "src/gameplay/health.ts",
    "content": "let health = 100\n..."
  }
}
```

### PreToolUse: Edit

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "src/gameplay/health.ts",
    "old_string": "let health = 100",
    "new_string": "let health: number = 100"
  }
}
```

### PreToolUse: Read

```json
{
  "tool_name": "Read",
  "tool_input": {
    "file_path": "src/gameplay/health.ts"
  }
}
```

In real payloads a file tool's `file_path` is absolute, with the platform's own
separators — backslashes on Windows. Strip the project root first, then match
from the start of what is left (`assets/data/`). A segment such as
`/assets/data/` matched anywhere also fires on a parent folder of the same name
and on files outside the project, such as the user's own `~/.opencode/skills/`.
`validate-assets.sh` shows the stripping.

## PostToolUse

Fired after a tool completes. **Cannot block** — the tool already ran. Exit 2
it is fed back to the model, so it can fix what it just wrote. stderr on exit 0 goes to
the debug log only, so an advisory warning must be hook JSON on stdout.

### PostToolUse: Write

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "assets/data/enemy_stats.json",
    "content": "{\"goblin\": {\"health\": 50}}"
  },
  "tool_response": {
    "filePath": "assets/data/enemy_stats.json",
    "type": "create"
  }
}
```

### PostToolUse: Edit

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "assets/data/enemy_stats.json",
    "old_string": "\"health\": 50",
    "new_string": "\"health\": 75"
  },
  "tool_response": { "filePath": "assets/data/enemy_stats.json" }
}
```

## SubagentStart

Synthesized when OpenCode's `subagent` tool runs. The payload's `tool_name` is
`Agent` (the ported scripts still read that name). The agent's ID is passed in
`agent_type` — there is no `agent_name` field.

```json
{
  "agent_id": "agent-abc123",
  "agent_type": "game-designer"
}
```

## SessionStart

The plugin runs this once per root session, on the first model call, and adds
plain stdout to the model's system context. That is the event that restores
context after a compaction: the plugin runs it again after
`session.compaction.ended` (see `post-compact.sh` in `hooks-reference.md`). Child sessions do not
run it.

## PreCompact

The plugin runs this before context compaction. **Its output is logged only**;
nothing reaches the model. Recovery after a compaction comes from the queued
`post-compact.sh` output and from `session-start.sh`, which the plugin runs
again after the compaction ends.

## Stop

Runs **every time a turn ends**, not once when the session ends. The plugin
triggers it from the `session.idle` event. The synthesized payload carries the
common fields.

## Output: warnings someone sees

A hook that warns but must not block exits 0 — and **on exit 0, stderr reaches
no one**. Print a JSON object on stdout instead:

```json
{
  "systemMessage": "Shown to the user",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Given to the model next to the tool result"
  }
}
```

- stdout must hold **only** that object.
- `hookEventName` is required inside `hookSpecificOutput`.
- **Leave out `permissionDecision`** unless you mean it: on PreToolUse, `"allow"`
  skips the user's permission prompt.

CCGS hooks use `hook_warn` from `.opencode/hooks/yaml-helper.sh`, which builds this
object and escapes the message without needing `jq`:

```bash
. .opencode/hooks/yaml-helper.sh
hook_warn PostToolUse "Asset names must be lowercase: $FILE_PATH"
exit 0
```

## Exit Code Reference

| Exit Code | Meaning |
|-----------|---------|
| 0 | Success. A JSON object on stdout is read as hook output; otherwise stdout is a message the plugin may pass on. |
| 2 | The plugin treats this as a block: the call is denied (permission hook) or the message is fed back to the model (tool hook). |
| Other | Non-blocking error; the action proceeds. |

**Output is capped at 10,000 characters (observed; the OpenCode hooks documentation does not state it).**
Plain stdout, and each of `additionalContext`, `systemMessage` and
`initialUserMessage`, is measured on its own. Past the cap OpenCode saves
the text to a file and passes a path
plus a 2,000-character preview, and nothing tells the model to read the file. Keep
what the model must see inside the cap — `session-start.sh` caps its checkpoint
preview for this reason.

## Notes

- Hooks receive JSON on **stdin** (pipe). Use `INPUT=$(cat)` to capture.
- Parse with `jq` if available, fall back to `grep` for cross-platform compatibility.
- On Windows, `grep -P` (Perl regex) is often unavailable. Use `grep -E` (POSIX extended) instead.
- Path separators may be `\` on Windows. Normalize with `sed 's|\\|/|g'` when comparing paths.
