# /test-setup — Phase 1: Detect Test Runner and Existing State

> Part of `/test-setup`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 1: Detect Test Runner and Existing State

1. **Read the test command**:
   - Read `commands.test` from `project.yaml` if it is set; otherwise read the
     `test` script from `package.json`.
   - If neither names a test command, stop and ask which command runs the tests.
     Do not guess a runner.

2. **Check for existing test infrastructure**:
   - Glob `tests/` — does the directory exist?
   - Glob `tests/unit/` and `tests/integration/` — do subdirectories exist?
   - Glob `.github/workflows/` — does a CI workflow file exist?
   - Glob the test root for **test files** — a test file is one the test command
     executes (a `*.test.ts` suite), not a markdown checklist.

3. **Report findings**:
   - "Test command: [command]. Test directory: [found / not found]. CI workflow: [found / not found]."
   - If everything already exists AND `force` argument was not passed:
     "Test infrastructure appears to be in place. Re-run with `/test-setup force`
     to regenerate. Proceeding will not overwrite existing test files."

If the `force` argument is passed, skip the "already exists" early-exit and
proceed — but still do not overwrite files that already exist at a given path.
Only create files that are missing.

---
