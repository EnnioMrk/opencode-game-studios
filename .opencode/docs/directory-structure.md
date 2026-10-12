# Directory Structure

```text
/
├── AGENTS.md                    # Master configuration
├── project.yaml                 # Machine-readable project config — modes, stage (source of truth)
├── .opencode/                     # Agent definitions, skills, hooks, rules, docs
├── src/                         # Game source code
├── assets/                      # Game assets (art, audio, vfx, shaders, data)
├── design/                      # Game design documents (gdd, narrative, levels, balance)
├── docs/                        # Technical documentation (architecture, api, postmortems)
├── tests/                       # Game test suites (unit, integration, performance, playtest)
├── tools/                       # Build and pipeline tools (ci, build, asset-pipeline)
├── prototypes/                  # Throwaway prototypes (outside the code root)
├── production/                  # Production management (sprints, milestones, releases)
│   ├── session-state/           # Ephemeral session state (active.md — gitignored)
│   └── session-logs/            # Session audit trail (gitignored)
└── CCGS Skill Testing Framework/ # QA for the skills/agents themselves — /skill-test, /skill-improve
```

## The code root

The code root is `src/`. It holds the game's source code; `tests/` holds its
test suites. Nothing else moves these paths — skills, hooks and CI all read the
same two directories.

Tests live under `tests/` — `tests/unit/` and `tests/integration/`.

Read `tests/unit/[system]/` (or `integration/`) anywhere as the test root plus `[System]/`.
