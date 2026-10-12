# /test-setup — Phase 6: Post-Setup Summary

> Part of `/test-setup`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 6: Post-Setup Summary

After writing all files, report:

```
Test infrastructure created — test command: [the project's test command].

Files created:
- tests/README.md
- tests/unit/ and tests/integration/
- tests/smoke/critical-paths.md
- production/qa/evidence/.gitkeep
[test runner files, if any]
- .github/workflows/tests.yml

Next steps:
1. Write your first test — a `*.test.ts` suite under the test root — so the
   framework has one test that proves it runs
2. Run `/qa-plan sprint` before your first sprint to classify stories and set
   test evidence requirements. At `workflow: minimal` — the default — skip
   this: there are no sprints. At `qa.level: minimal`, also the default, tests
   are waived, so `/dev-story` writes none. Raise `qa.level` with `/settings`
   to have it write them
3. `/smoke-check` before every QA hand-off

Gate note: /gate-check Technical Setup → Pre-Production now requires:
- the test root: tests/unit/ and tests/integration/
- .github/workflows/tests.yml
- At least one example test file
Run /test-setup and write one example test before advancing.
(At `workflow: minimal` that gate requires only the project config.)

Verdict: **COMPLETE** — test framework scaffolded and CI/CD wired up.
```

---
