# /create-architecture — Phase 0: Load All Context

> Part of `/create-architecture`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 0: Load All Context

**In this file:**

- 0a. Design Context + Technical Requirements Extraction
- 0b. Existing Architecture Decisions
- 0c. Existing Architecture Document

Before anything else, load the full project context in this order:

### 0a. Design Context + Technical Requirements Extraction

Load the approved design documents and extract technical requirements from each:

1. `design/gdd/game-concept.md` — game pillars, genre, core loop
2. `design/gdd/systems-index.md` — all systems, dependencies, priority tiers

**Check both exist before reading either. Neither is optional here, and both
need an absence branch** — these two matter just as much:

- **`systems-index.md` absent** — stop:
  > "No systems index found. Run `/map-systems` first. An architecture written
  > without it invents layers for systems nobody mapped, and every ADR, epic and
  > story downstream inherits that invention."
  At `minimal` the index is not required (§ tier note above) — say so and proceed
  from the brief instead.
- **`game-concept.md` absent** — at `standard`/`full`, stop and point at
  `/brainstorm`. At `minimal`, read `design/game-brief.md` in its place; if that
  is absent too, stop — there is no design record to architect against.
- **Either present but empty or still template placeholders** — treat as absent.
  Present-but-empty is the case that most looks like present.

Do not proceed on a partial read and note it later. This phase is where design
assumptions get baked into ADRs, and an assumption made here is re-derived by
everything downstream rather than re-checked.
3. Project config — `naming.*` and `performance.*` from `project.yaml` (for any
   key absent or empty, fall back to `.opencode/docs/technical-preferences.md`);
   allowed libraries and forbidden patterns from
   `.opencode/docs/technical-preferences.md` (not migrated to project.yaml)
4. **Every GDD in `design/gdd/`** — extract technical requirements from the
   sections that carry them, **not from whole files**. Establish the denominator
   first (glob `design/gdd/*.md`, count **N**), then:
   ```
   Grep pattern="^## (Detailed Rules|Detailed Design|Formulas|Dependencies|Tuning Knobs|Acceptance Criteria)" glob="design/gdd/*.md" output_mode="content" -A 40
   ```
   Overview and Player Fantasy are narrative and imply no architecture; the
   scanned set is where rules, numbers, and cross-system contracts live. Accept
   either `## Detailed Rules` or `## Detailed Design` — the design standard and
   the GDD template disagree on the name and they denote the same section.

   Full-read a GDD when it matched **zero** sections (it predates the template —
   a zero-match means "unstructured", never "no requirements") or when a scanned
   section refers to material outside itself. **Never treat an absent section as
   an absent requirement**: report any GDD that contributed nothing, rather than
   letting it drop silently out of the baseline below.

   For each, extract:
   - Data structures implied by the game rules
   - Performance constraints stated or implied
   - Cross-system communication patterns (what talks to what, how)
   - State that must persist (save/load implications)
   - Threading or timing requirements

Build a **Technical Requirements Baseline** — a flat list of all extracted
requirements across all GDDs, numbered `TR-[system]-[NNN]`, the TR registry's
ID format. This is the
complete set of what the architecture must cover. Present it as:

```
## Technical Requirements Baseline
Extracted from [N] GDDs | [X] total requirements

| Req ID | GDD | System | Requirement | Domain |
|--------|-----|--------|-------------|--------|
| TR-combat-001 | combat.md | Combat | Hitbox detection per-frame | Physics |
| TR-combat-002 | combat.md | Combat | Combo state machine | Core |
| TR-inventory-001 | inventory.md | Inventory | Item persistence | Save/Load |
```

This baseline feeds into every subsequent phase. No GDD requirement should be
left without an architectural decision to support it by the end of this session.

### 0b. Existing Architecture Decisions

To learn **what has already been decided and in which domain**, scan the ADR
headers — do not full-read every ADR to produce a list of numbers and domains:
```
Grep pattern="^## (Status|Summary)" glob="docs/architecture/adr-*.md" output_mode="content" -A 4
Grep pattern="\*\*Domain\*\*" glob="docs/architecture/adr-*.md" output_mode="content"
```
`## Summary` (a 2-sentence what-and-why) plus `## Status` and the `Domain`
field are exactly "what was decided and its domain". List
the ADRs found, their status, and their domains from the scan. Full-read a
specific ADR only when a new decision this session would collide with it and you
need its reasoning — not to build the inventory.

### 0c. Existing Architecture Document

Glob `docs/architecture/architecture.md`. If it exists, this run updates it —
it never replaces it unasked. Read its `## Document Status` block and its `##`
headings, then use `question`:
- Prompt: "An architecture document already exists (v[N], [last updated]). What should this run do?"
- Options: `[A] Update chosen sections in place` / `[B] Rewrite the whole document — replaces the existing file` / `[C] Stop`

On `[A]`, ask which sections. Phases 1–6 author only those and say which they
skipped; Phase 7 replaces just those sections and raises `Version` to N+1,
leaving every other section as it is. `[B]` runs the full walkthrough, and
Phase 7's ask says it replaces the existing file.

A focus-area argument (`layers`, `data-flow`, `api-boundaries`, `adr-audit`)
is `[A]` with that one section chosen: it runs only its phase (1, 3, 4 or 5),
and Phase 7 writes that section. Phase 7b still runs on the updated document —
an update is reviewed like a first draft, at the review modes that review one. With no existing document there is nothing to
update — say so, and offer the full walkthrough instead.

---
