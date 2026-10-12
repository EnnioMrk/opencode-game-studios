#!/usr/bin/env bash
#
# project-coherence.sh — compare what `project.yaml` DECLARES against what the
# project actually IS.
#
# WHY THIS EXISTS
#
# `project.yaml` is treated as the source of truth and is never reconciled
# against the artifact it describes: a `commands.test` that names a file which
# is not there reads as configured and fails the first time CI or /smoke-check
# runs it. Prose is in place and does not hold on its own; what was missing was
# a step that reads back what was written.
#
# OBSERVATIONS, NEVER VERDICTS
#
# Per AGENTS.md: a script that scores or judges will eventually contradict a mode
# or override it cannot see. This one prints what it compared and what it found,
# and always exits 0. The reader decides. A check that cannot run says so by
# name — silence is never treated as agreement.

set -u
export LC_ALL=C

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [ -n "${OPENCODE_PROJECT_DIR:-}" ] && [ -f "$OPENCODE_PROJECT_DIR/project.yaml" ]; then
  ROOT="$OPENCODE_PROJECT_DIR"
fi
cd "$ROOT" || exit 0

DIFFERS=0
CHECKED=0
SKIPPED=0

say()      { printf '%s\n' "$*"; }
match()    { CHECKED=$((CHECKED+1)); say "[MATCH]       $*"; }
differs()  { CHECKED=$((CHECKED+1)); DIFFERS=$((DIFFERS+1)); say "[DIFFERS]     $*"; }
skipped()  { SKIPPED=$((SKIPPED+1)); say "[NOT CHECKED] $*"; }

# Read one `key: value` from a named top-level block of project.yaml.
# Deliberately simple: this file is machine-written and two levels deep.
yaml_block_value() {
  block="$1"; key="$2"
  awk -v b="$block" -v k="$key" '
    $0 ~ "^"b":" { inb=1; next }
    inb && /^[a-zA-Z_]/ { inb=0 }
    inb && $0 ~ "^[[:space:]]+"k":" {
      sub("^[[:space:]]*"k":[[:space:]]*", "")
      gsub(/^"|"$/, "")
      print; exit
    }
  ' project.yaml 2>/dev/null
}

summarise() {
  say ""
  say "checked $CHECKED · differs $DIFFERS · not checked $SKIPPED"
  say ""
  say "Observations only — no verdict. 'not checked' is not agreement:"
  say "each line above names why that comparison could not be made."
  exit 0
}

# major.minor of the first version in $1.
vmm() { printf '%s' "$1" | grep -oE '[0-9]+\.[0-9]+' | head -1; }

say "=== project coherence ==="

if [ ! -f project.yaml ]; then
  skipped "everything — no project.yaml at the repo root. Run /start."
  summarise
fi

# --- 1-5. Declared configuration vs the installed project ---------------------
# The checks that used to run here compared declared version, rendering and
# physics values against an installed binary, a project file and its export
# presets. There is nothing here to compare them against. Reported, not skipped
# in silence.
skipped "NOT ASSESSED — no reference set for this stack"

# --- 6. Declared commands reference files that exist -------------------------
BUILD_CMD="$(yaml_block_value commands build)"
TEST_CMD="$(yaml_block_value commands test)"

if [ -z "$BUILD_CMD" ] && [ -z "$TEST_CMD" ]; then
  skipped "command checks — project.yaml declares no commands.build or commands.test"
else
  # A runner named by commands.test must be a file that exists, or the command
  # cannot run as written. The path is matched as a whole token, extension
  # included: a pattern that stopped at the first colon reported a present
  # runner as missing.
  RUNNER="$(printf '%s' "$TEST_CMD" | grep -oE '[A-Za-z0-9_/.-]+\.(ts|tsx|js|jsx|mjs|cjs|sh|py)' | head -1)"
  if [ -n "$RUNNER" ]; then
    if [ -f "$RUNNER" ]; then
      match "commands.test runner exists ($RUNNER)"
    else
      differs "commands.test is '$TEST_CMD' but '$RUNNER' does not exist, so this command cannot run as written."
    fi
  fi
fi

summarise
