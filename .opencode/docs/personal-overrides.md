# Personal Overrides

Two kinds of personal settings exist, and they live in different files.

## 1. Studio settings — `project.local.yaml`

The CCGS settings that are **personal** (`modes.review_mode`, `modes.automation`,
`modes.automation_always_ask`, `team.size`, `testing.strict.*`,
`performance.enforce`, `features.*`) go in `project.local.yaml` at the project
root. Write them with:

```
/settings --local modes.review_mode=solo
```

The file is gitignored, so your preferences never reach your teammates. The full
precedence chain is in `.opencode/docs/config-resolution.md`.

## 2. OpenCode configuration — global config

OpenCode configuration is global or project, not per-developer-per-project.
Put **your own** tweaks in the global file:

```
~/.config/opencode/opencode.jsonc        # user-level; applies to every project
```

and leave the project's `opencode.jsonc` untouched unless the team should share
the change. Examples of personal entries:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permissions": [
    { "action": "shell", "resource": "git log *", "effect": "allow" },
    { "action": "skill", "resource": "some-noisy-skill", "effect": "deny" }
  ]
}
```

Global rules merge with the project's; the project's rules come first in the
chain and a later matching rule wins. Never weaken a project `deny` rule
locally — deny rules are final by design.

## 3. Personal instructions — global `AGENTS.md`

OpenCode loads `~/.config/opencode/AGENTS.md` before any project instructions.
Use it for how you want to work everywhere: response length, language, editor,
test habits.

```markdown
# Personal Preferences

- Keep responses concise; show file paths in code references.
- Run the test suite after every code change.
- Prefer a lower `docs.density` unless the team decides otherwise.
- When I say "review", run `/code-review` on the last changed files.
```

Do not put game project facts there — they belong in the project `AGENTS.md`.
