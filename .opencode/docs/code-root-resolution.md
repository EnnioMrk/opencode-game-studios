# Code Root Resolution

Shared procedure for any skill that reads, scans, counts or writes game source
files. **An unresolved code root means the check did not run.** This file gives
the resolution order.

`.opencode/docs/directory-structure.md` is the authority for which directory holds
code. This file is the procedure for applying it.

## The root

The code root is `src/`.

## Resolution order

1. `src/` present in the project tree: that is the root.
2. Otherwise: **unresolved.**

`resolve_code_root()` in `.opencode/hooks/yaml-helper.sh` is the hook-side
implementation. Skills must match its semantics so that a hook and a skill never
disagree about where the code lives.

## Unresolved does not default to `src/`

This is the rule the whole file exists for, and it is obligation 2 of
`.opencode/rules/skill-authoring.md`: an absent value may not default to the
permissive one.

**For a read or scan:** report `NOT ASSESSED — code root unresolved` and say
which check did not run. Never report zero hits.

A scan anchored to a root the project does not use matches nothing, and
**nothing is indistinguishable from a clean result.** A localization check finds
no hardcoded strings; a security scan finds no secrets; a content audit counts
no implemented content; a stage detector counts no source files and calls a
finished project greenfield. Every one of those reads as a pass. This has been
found repeatedly across skills and hooks, which is why the resolution lives in
one place now.

**For a write:** do not write. Report the unresolved root and stop.

Writing code to the wrong root is worse than a false pass, because it produces a
project that cannot build: source written under a directory the build does not
read is silently inert.

## Applying it

Where a skill says `src/`, read it as *the code root*. Where a skill greps, glob
the resolved root. Where a skill writes, write under the resolved root.
