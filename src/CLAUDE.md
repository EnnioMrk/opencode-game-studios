# Source Directory

When writing or editing game code in this directory, follow these standards.

## Coding Standards

- All public APIs require doc comments
- Gameplay values must be **data-driven** (external config files), never hardcoded
- Prefer dependency injection over singletons for testability
- Architecture decisions go in `docs/architecture/` as ADRs — **how many depends on
  `modes.workflow`**: all at `full`, critical only at `standard`, none required at
  `minimal` (the decision log carries them)
- Commits must reference the relevant story ID or design document

## File Routing

Match the specialist agent to the file type being written — `gameplay-programmer`
for gameplay code, `ui-programmer` for UI, `technical-artist` for shaders and
visual work.

## Tests

Tests live in `tests/` — not in `src/`.
Run `/test-setup` to scaffold the test framework if it doesn't exist yet.
Every gameplay system should have unit tests covering its formulas and edge cases.

## Verification-Driven Development

Write tests first when adding gameplay systems.
For UI changes, verify with screenshots.
Compare expected output to actual output before marking work complete.
