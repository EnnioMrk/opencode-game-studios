# /test-setup — Phase 3: Create Directory Structure

> Part of `/test-setup`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 3: Create Directory Structure

**In this file:**

- `tests/README.md`
- `production/qa/evidence/.gitkeep`
- Test runner files

After approval, create the following files:

### `tests/README.md`

````markdown
# Test Infrastructure

**Test command**: [the command from `commands.test` or the `test` script]
**Test Framework**: [the runner that command uses]
**CI**: `.github/workflows/tests.yml`
**Setup date**: [date]

## Directory Layout

```
tests/
  unit/           # Isolated unit tests (formulas, state machines, logic)
  integration/    # Cross-system and save/load tests
  smoke/          # Critical path test list for /smoke-check gate
```

```
production/qa/
  evidence/       # Screenshot logs and manual test sign-off records
```

> **Manual evidence lives under `production/qa/evidence/`, not `tests/`** — that
> is where every consumer reads it.

## Running Tests

```bash
[the project's test command]
```

## Test Naming

Names follow `.opencode/rules/test-standards.md` — every name says the scenario
and the expected result.

## Story Type → Test Evidence

| Story Type | Required Evidence | Location |
|---|---|---|
| Logic | Automated unit test — must pass | `tests/unit/[system]/` |
| Integration | Integration test OR playtest doc | `tests/integration/[system]/` |
| Visual/Feel | Screenshot + lead sign-off | `production/qa/evidence/` |
| UI | Retained screenshot of each screen touched | `production/qa/evidence/` |
| Config/Data | Smoke check pass | `production/qa/smoke-*.md` |

## CI

Tests run automatically on every push to `main` and on every pull request.
A failed test suite blocks merging.
````

The README and this skill's completion summary name the same evidence path —
`production/qa/evidence/` is where `/smoke-check`, `/test-evidence-review`,
`/qa-plan` and the evidence table in `.opencode/docs/coding-standards.md` read,
so a `tests/evidence/` would be a directory nothing reads.

### `production/qa/evidence/.gitkeep`

Create it empty. Git does not keep an empty directory, and this is where
`/story-done`, `/smoke-check` and `/test-evidence-review` look for screenshots and
sign-off records — the completion summary lists it, so it must exist.

### Test runner files

The shared layout above is runner-independent: `tests/unit/`, `tests/integration/`
and `tests/smoke/` are read by `/smoke-check`, `/test-evidence-review` and
`gate-check` whatever runs the tests.

Create a runner file only when the project's runner needs one to run from CI —
its command is already declared (`commands.test` in `project.yaml`, else the
`test` script in `package.json`). Do not write a runner script for a runner that
ships its own test command.

---
