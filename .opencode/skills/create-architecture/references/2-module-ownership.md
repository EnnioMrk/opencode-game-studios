# /create-architecture — Phase 2: Module Ownership Map

> Part of `/create-architecture`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 2: Module Ownership Map

For each module defined in Phase 1, define ownership:

- **Owns**: what data and state this module is solely responsible for
- **Exposes**: what other modules may read or call
- **Consumes**: what it reads from other modules

Format as a table per layer, then as an ASCII dependency diagram.

Get user approval on the ownership map, then record it in
`production/session-state/active.md`; it is written at Phase 7.

---
