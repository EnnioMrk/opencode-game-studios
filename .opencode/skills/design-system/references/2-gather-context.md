# /design-system — Phase 2: Gather Context

> Part of `/design-system`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## 2. Gather Context (Read Phase)

**In this file:**

- 2a: Required Reads
- 2b: Dependency Reads
- 2c: Optional Reads
- 2d: Present Context Summary
- 2e: Technical Feasibility Pre-Check

Read all relevant context **before** asking the user anything. This is the skill's
primary advantage over ad-hoc design — it arrives informed.

### 2a: Required Reads

> **At `minimal`** (design-system is voluntary at this tier): read
> `design/game-brief.md` in place of the game concept, and **skip the systems-index
> read** — neither `game-concept.md` nor `systems-index.md` exists at `minimal`.
> Author from the brief's relevant MVP feature and its core loop.
>
> **This callout keys on the PROJECT tier, not this system's effective tier.**
> The two differ whenever `workflow_overrides.system_overrides` bumps one system
> above a `minimal` project — the configuration `.opencode/docs/settings-guidance.md`
> advertises as the reason the override exists ("bump one deep system"). Those two
> files are absent because the *project* is `minimal`; raising *this system* to
> `standard` or `full` does not create them. So on a `minimal` project, take this
> branch **even for an overridden system**, and read the brief.
>
> The effective tier still governs everything downstream — the required section
> set (§1), the skeleton (§3), the section cycle (§4) and §5a. Only the
> required-*reads* branch here follows the project tier.
>
> **Then derive `Category`, `Layer` and `Priority` from the brief, once, here.**
> Five later steps are keyed on the systems index you just skipped — Section A's
> and Section B's recommended options, the Visual/Audio
> REQUIRED table, §6 specialist routing, and §5-pre's Quick reference — and none
> of them has an absent-index branch. An overridden system reaches all five at
> `standard` or `full`, so "skip the index" leaves them with no input at all.
> Derive from the brief instead:
>
> - **`Category`** — one of the nine in `templates/systems-index.md`
>   (`Core · Gameplay · Progression · Economy · Persistence · UI · Audio ·
>   Narrative · Meta`), chosen from what the brief says the system *does*.
> - **`Layer`** — `Foundation` if other systems depend on it, else `Feature`.
> - **`Priority`** — `MVP` if the brief's build order lists it, else `Post-MVP`.
>
> Carry all three for the rest of the run and treat them as the index's answer.
> **Mark them inferred** in §5-pre's Quick reference (*"Category: Gameplay
> (inferred from the brief — no systems index at this tier)"*) so a later reader
> does not mistake a derivation for an indexed fact. Do **not** write a systems
> index to hold them: `/map-systems` owns that file (§5d).
>
> Read literally without this rule, an overridden system resolves to `full`, falls
> through to the fail-fast reads below, and aborts with *"No game concept found.
> Run `/brainstorm` first"* — killing the escape hatch on step one of the very
> configuration it was built for.

- **Game concept**: Read `design/gdd/game-concept.md` — fail if missing:
  > "No game concept found. Run `/brainstorm` first."
- **Systems index**: Read `design/gdd/systems-index.md` — fail if missing:
  > "No systems index found. Run `/map-systems` first to map your systems."
- **Target system**: Find the system in the index. If not listed, warn:
  > "[system-name] is not in the systems index. Would you like to add it, or
  > design it as an off-index system?"
- **Entity registry**: If `design/registry/entities.yaml` exists, grep it for
  the entries this system owns and the entries that reference it:
  ```
  Grep pattern="source: design/gdd/[system-name].md" path="design/registry/entities.yaml" output_mode="content" -A 6
  Grep pattern="design/gdd/[system-name].md" path="design/registry/entities.yaml" output_mode="content" -B 8
  ```
  `referenced_by:` is a block list (the key and its paths are on separate
  lines), so match the path with `-B 8` context to see the owning entry; a
  `referenced_by.*[system-name]` one-liner never matches it. Hold these
  in context as **known facts** — values that other GDDs have already
  established and this GDD must not contradict.
- **Reflexion log**: Read `docs/consistency-failures.md` if it exists.
  Extract entries whose Domain matches this system's category. These are
  recurring conflict patterns — present them under "Past failure patterns"
  in the Phase 2d context summary so the user knows where mistakes have
  occurred before in this domain.

### 2b: Dependency Reads

From the systems index, identify:
- **Upstream dependencies**: Systems this one depends on (decisions this system
  must respect).
- **Downstream dependents**: Systems that depend on this one (expectations this
  system must satisfy).

For each dependency GDD that exists, read **only the four sections that carry the
cross-system contract** — not the whole GDD:
```
Grep pattern="^## ([0-9]+\. )?(Dependencies|Formulas|Edge Cases|Tuning Knobs)" glob="design/gdd/[dep].md" output_mode="content" -A 20
```
- Key interfaces and data flow (from Dependencies)
- Formulas that reference this system's outputs
- Edge cases that assume this system's behavior
- Tuning knobs that feed into this system

Much of this is already in `entities.yaml` (loaded in 2a) — the registry's
`formula_map`/`constant_map` carry the owned values with their `source:`. Use the
registry first; the section grep fills what it does not hold.

### 2c: Optional Reads

- **Game pillars**: Read `design/gdd/game-pillars.md` if it exists
- **Existing GDD**: Read `design/gdd/[system-name].md` if it exists (resume, don't
  restart from scratch)
- **Related systems**: do **not** glob-and-read `design/gdd/*.md` hunting for
  "thematically related" systems — there is no deterministic proxy for that and it
  is the read the registry exists to replace. `entities.yaml` (2a) already holds
  the cross-system facts a related GDD would supply. If a specific overlap is
  known, treat it as a dependency above and section-grep it; otherwise rely on the
  registry.

### 2d: Present Context Summary

Before starting design work, present a brief summary to the user:

> **Designing: [System Name]**
> - Priority: [from index] | Layer: [from index]
> - Depends on: [list, noting which have GDDs vs. undesigned]
> - Depended on by: [list, noting which have GDDs vs. undesigned]
> - Existing decisions to respect: [key constraints from dependency GDDs]
> - Pillar alignment: [which pillar(s) this system primarily serves]
> - **Known cross-system facts (from registry):**
>   - [entity_name]: [attribute]=[value], [attribute]=[value] (owned by [source GDD])
>   - [item_name]: [attribute]=[value], [attribute]=[value] (owned by [source GDD])
>   - [formula_name]: variables=[list], output=[min–max] (owned by [source GDD])
>   - [constant_name]: [value] [unit] (owned by [source GDD])
>   *(These values are locked — if this GDD needs different values, surface
>   the conflict before writing. Do not silently use different numbers.)*
>
> If no registry entries are relevant: omit the "Known cross-system facts" section.

If any upstream dependencies are undesigned, warn:
> "[dependency] doesn't have a GDD yet. We'll need to make assumptions about
> its interface. Consider designing it first, or we can define the expected
> contract and flag it as provisional."

### 2e: Technical Feasibility Pre-Check

NOT ASSESSED — no reference set for this stack.

---

Use `question`:
- "Ready to start designing [system-name]?"
  - Options: "Yes, let's go", "Show me more context first", "Design a dependency first"

---
