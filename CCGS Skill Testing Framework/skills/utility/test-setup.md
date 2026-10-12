# Skill Test Spec: /test-setup

## Skill Summary

`/test-setup [force]` scaffolds the test framework for the project.
It checks for existing infrastructure, presents a plan,
and asks "May I create these files? I will not overwrite any test files that
already exist at these paths." before writing.

It creates `tests/README.md`, `tests/smoke/critical-paths.md`,
`production/qa/evidence/`, `.github/workflows/tests.yml`, and the test root:
`tests/unit/` and `tests/integration/` (placeholder files, and
no runner script — the project's own test command, `bun test`, is the
runner). When the
infrastructure already exists it exits early unless `force` is passed, and
`force` only creates missing files — it never overwrites. No director gates
apply. The verdict is COMPLETE when the scaffold is in place.

---

## Static Assertions (Structural)

Checked against the SKILL.md by `/skill-test spec` — no fixture needed.

- [ ] Has required frontmatter fields: `name` and `description` (plus `disable-model-invocation: true` when the skill must not be model-invoked)
- [ ] Has ≥2 phase headings
- [ ] Contains verdict keyword: COMPLETE
- [ ] Contains ask-before-write language before creating files ("May I create these files?")
- [ ] Has a next-step handoff (Phase 6 Next steps: `/qa-plan sprint`, `/smoke-check`)

---

## Director Gate Checks

None. `/test-setup` is a scaffolding utility. No director gates apply.

---

## Test Cases

### Case 1: Happy Path — scaffolds the test structure

**Fixture:**
- `tests/` does not exist; no CI workflow
- The user approves the plan

**Input:** `/test-setup`

**Expected behavior:**
1. Phase 1 reports "Test directory: not found. CI workflow: not found."
2. Phase 2 presents the plan: `tests/unit/`, `tests/integration/`, `tests/smoke/`,
   `tests/README.md`, `production/qa/evidence/`, `.github/workflows/tests.yml` —
   and no runner script
3. Skill asks "May I create these files? I will not overwrite any test files that
   already exist at these paths."
4. On approval: placeholder files under `tests/unit/` and
   `tests/integration/`, `tests/README.md`, `tests/smoke/critical-paths.md`, and
   a file under `production/qa/evidence/`
5. `.github/workflows/tests.yml` runs the project's test command
6. The documented test command matches `coding-standards.md`'s CI command
   (`bun test`)
7. Phase 6 summary; verdict COMPLETE

**Assertions:**
- [ ] `tests/unit/`, `tests/integration/`, `tests/smoke/` and `production/qa/evidence/` all exist afterwards (each holds a written file)
- [ ] No custom runner script is written (the project's own test command is the runner)
- [ ] The test command matches the coding-standards.md CI command
- [ ] Approval is asked before any file is created
- [ ] Verdict is COMPLETE

---

### Case 2: Infrastructure Already Exists — Early exit, nothing re-initialized

**Fixture:**
- `tests/unit/`, `tests/integration/` and `.github/workflows/tests.yml` all exist
- No `force` argument

**Input:** `/test-setup`

**Expected behavior:**
1. Phase 1 reports "Test directory: found. CI workflow: found."
2. Skill says: "Test infrastructure appears to be in place. Re-run with
   `/test-setup force` to regenerate. Proceeding will not overwrite existing test files."
3. No plan approval is requested and no file is written

**Assertions:**
- [ ] Skill does NOT re-initialize when the infrastructure exists
- [ ] The message points to `/test-setup force`
- [ ] No existing file is modified and no new file is written

---

### Case 3: Director Gate Check — No gate; test-setup is a scaffolding utility

**Fixture:**
- `tests/` does not exist

**Input:** `/test-setup`

**Expected behavior:**
1. Skill scaffolds and writes all test framework files
2. No director agents are spawned
3. No gate IDs appear in output

**Assertions:**
- [ ] No director gate is invoked
- [ ] No gate skip messages appear
- [ ] Verdict is COMPLETE without any gate check

---

## Protocol Compliance

- [ ] Checks existing infrastructure before generating any scaffold
- [ ] Generates the test runner config and CI workflow the project uses
- [ ] Puts unit and integration tests in the test root, `tests/`
- [ ] Creates `production/qa/evidence/` — the path the Phase 6 summary reports
- [ ] Asks approval before creating files
- [ ] Exits early when infrastructure exists; `force` creates only missing files and never overwrites
- [ ] Verdict is COMPLETE when scaffold is in place

---

## Coverage Notes

- The `force` path on a partial scaffold (create only the missing files) is
  covered by protocol compliance, not by its own case.
