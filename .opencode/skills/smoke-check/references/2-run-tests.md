# /smoke-check — Phase 2: Run Automated Tests

> Part of `/smoke-check`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 2: Run Automated Tests

**In this file:**

- `commands.test` first
- Reading the result
- Test runner not available here
- Build check (the WAIVED path only)

**Run `commands.test` from `project.yaml` when it is set** — it is the
project's own test command and CI runs it. Use the project's own test command
(`bun test`, from `package.json`) only when `commands.test` is absent, and say in the
report which of the two you ran. Wrap it in a timeout (`timeout 900 …`): **a
timeout (exit 124) is a gate FAILURE, never a pass** — the run never completed
and nothing was verified. macOS has no `timeout`: use `gtimeout 900 …` from
Homebrew's `coreutils` (same exit 124), or, with nothing installed,
`perl -e 'alarm shift; exec @ARGV' 900 …`, which exits 142 when time runs out —
a FAILURE the same way.

**Reading the result.** A non-zero exit is a FAIL. A run that executed zero test
cases is `NOT ASSESSED — no tests found`, never a pass: a runner that opens,
matches nothing and exits 0 looks like success and is not. Read the summary line
for the counts (tests run, passed, failed), and list any failing tests with a
one-line description from the runner output.

**If the test runner is not available in this environment** (no test command
resolved in Phase 1 step 3, runner script not found, etc.), report clearly:

"Automated tests could not be executed — test runner not found (checked
`commands.test` and `package.json`; set `commands.test` to the command you use).
Status will be recorded as NOT RUN.
Confirm test results from your local IDE
or CI pipeline. Until you do, the verdict is NOT ASSESSED — not FAIL, and not
a pass either: nothing has been observed about this build yet."

Do not treat NOT RUN as an automatic FAIL. Record it, and let the developer's
manual confirmation in Phase 4 resolve it. Until that confirmation arrives the
verdict is **NOT ASSESSED** (see the verdict rules in Phase 5), which ranks
above both pass values and below FAIL. An unrun suite is not a healthy build; it
is an unknown one, and the two need different follow-ups.

Parse runner output and extract:
- Total tests run
- Passing count
- Failing count
- Names of any failing tests (up to 10; if more, note the count)
- Any crash or error output from the runner itself

**Build check — the WAIVED path only** (`qa.level: minimal`, no game tests;
Phase 1 step 1). With no suite to run, run the project's own boot check:
`commands.smoke` when set, else `commands.build` when set, under the same
timeout rules (`timeout 900`, or
`timeout 1800` for `commands.build`; a timeout is a FAIL). Read the result from
the command's own exit code and output: a non-zero exit is a FAIL. Record
`Build check: PASS — [command] exit 0`,
`FAIL — [reason]`, or `NOT RUN — [commands.smoke and commands.build unset |
command not found]`. A build check that did not run is named in the report
and leaves the launch in Batch 1 to carry the verdict; it never passes on its
own.

---
