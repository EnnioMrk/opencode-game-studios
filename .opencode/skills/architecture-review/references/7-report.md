# /architecture-review — Phase 7: Output the Review Report

> Part of `/architecture-review`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 7: Output the Review Report

```
## Architecture Review Report
Date: [date]
GDDs Reviewed: [N]
ADRs Reviewed: [M]

[output of: Bash: bash .opencode/scripts/review-receipts.sh hash docs/architecture/adr-*.md design/gdd/*.md
 — one Reviewed-Content-Hash line per file reviewed; Phase 1a's freshness
 check reads these on the next run to skip or scope an unchanged re-review]

---

### Traceability Summary
Total requirements: [N]
✅ Covered: [X]
⚠️ Partial: [Y]
❌ Gaps: [Z]

### Coverage Gaps (no ADR exists)
For each gap:
  ❌ TR-[id]: [GDD] → [system] → [requirement]
     Suggested ADR: "/architecture-decision [suggested title]"
     Domain: [Physics/Rendering/etc]

### Cross-ADR Conflicts
[List all conflicts from Phase 4]

### ADR Dependency Order
[Topologically sorted implementation order from Phase 4 — dependency ordering section]
[Unresolved dependencies and cycles if any]

### Architecture Document Coverage
[List missing systems and orphaned architecture from Phase 6]

---

### Verdict: [PASS / NOT ASSESSED / CONCERNS / FAIL]

PASS: All requirements covered by **Accepted** ADRs, no conflicts
NOT ASSESSED: The review could not be performed over its stated scope — name why
CONCERNS: Some gaps, partial coverage, or coverage resting on `Proposed` ADRs,
      but no blocking conflicts
FAIL: Critical gaps (Foundation/Core layer requirements uncovered),
      or blocking cross-ADR conflicts detected

**`NOT ASSESSED` ranks above PASS and below CONCERNS and FAIL.** Emit it when:

- **No ADRs exist, or none could be read.** Zero requirements traced is not full
  coverage — it is an untraced architecture, and a matrix of `❌ Gap` rows at
  least says so while an empty matrix says nothing.
- **The requirement source is missing** — no `tr-registry.yaml` and no GDD
  requirements to trace *from*. A review with no left-hand column cannot report
  coverage; it can only report that it had nothing to compare.
- **An ADR is unreadable or has no `## Status`**, so its rows are `❓` and their
  coverage is unknown rather than absent.
- **Phase 6 could not run** — no `docs/architecture/architecture.md`. It must
  appear as a named `NOT ASSESSED` **line item** in the report rather than as
  absent findings. ADR traceability can still be complete, so a CONCERNS or FAIL
  finding elsewhere still stands; but in `full` mode, whose scope includes
  Phase 6, the verdict cannot be PASS — a review that could not look at part of
  its scope has not shown that part is sound, so it is NOT ASSESSED.

Do not resolve any of these to PASS on the grounds that no gap was *found*. No
gap was looked for.

### Blocking Issues (must resolve before PASS)
[List items that must be resolved — FAIL verdict only]

### Required ADRs
[Prioritised list of ADRs to create, most foundational first]
```

---
