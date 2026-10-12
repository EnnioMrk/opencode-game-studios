# Run and Observe

Shared procedure for any skill that closes a story which changes something a
player can see. Used by `/dev-story` (Phase 6) and `/story-done` (Phase 3).
**A parse check is not a run, and a story nobody looked at does not close.**
This file explains how to look.

`.opencode/docs/coding-standards.md` is the authority for *what* evidence a story
needs. This file is the procedure for *producing* the visual half of it.

## The rule

Every story that changes something player-observable is **launched and observed
before it closes**, and the observation is a **retained screenshot** in
`production/qa/evidence/`. Compiling proves the code loads. Tests prove the
logic. Neither proves the text fits in the box.

The agent can see images: OpenCode's `Read` tool renders a PNG. The whole
problem is getting a picture out of the app unattended.

## The procedure

1. **Launch windowed** at a fixed resolution — `1280x720` unless the project
   says otherwise — using `commands.run` from `project.yaml`. Never a
   headless flag: those exist to *skip* rendering.
2. **Launch straight into the screen the story touched.** A feature that
   is only reachable through the main menu and three clicks is a feature the
   run will not reach. Stories should be written so their surface is reachable
   from a launch argument (a route, a query parameter, a debug flag).
3. **Wait, capture, quit.** Let the app render real frames — 60 is a safe
   floor — capture one, and exit. The capture mechanism is below.
4. **Look.** `Read` the PNG. Compare what is on screen to the acceptance
   criteria. Clipped text, an overflowing panel, a missing element, the wrong
   colour — these are defects, and this is the only step that finds them.
5. **Retain.** Copy the image to
   `production/qa/evidence/[story-slug]/[NN]-[what-it-shows].png` and reference
   it from the evidence doc. A screenshot that was taken and discarded is an
   assertion, not evidence.
6. **Report** one `Run result:` line in the implementation summary — vocabulary
   below.

## Capture

On Windows, PowerShell with `System.Drawing` can `CopyFromScreen` into a bitmap
and save it. It needs a visible desktop and the app window on top, and it
captures whatever is there — it cannot be told "the shop panel". Linux CI with
no display needs `xvfb-run` in front of the launch; a headless flag is not a
substitute.

## The `Run result:` line

Exactly one of three shapes, in the implementation summary:

- **`Run result: OBSERVED — <what was on screen, one line>`** with the retained
  path. *"Shop panel renders, all 6 slots inside the frame, prices legible at
  720p — `production/qa/evidence/shop-panel/01-shop-open.png`."*
- **`Run result: NOT VERIFIED — <reason>`**. The app did not launch,
  `commands.run` unset, launch crashed, screenshot empty. This is a **blocker**
  at the default gate level for Visual/Feel and UI stories, not a note — a
  story nobody looked at does not close. Under an explicit
  `testing.strict.visual`/`.ui: false` it is recorded and the story may close
  with the gap in `## Completion Notes`.
- **`Run result: N/A — <reason>`**, only for a story with genuinely nothing
  observable — a pure data migration, a save-format change with no surface.
  Say why. "It's a Logic story" is not a reason: a damage formula has a number
  on screen somewhere.

The run is **not waived at `qa.level: minimal`**. Tests are waived there; the
look is not. It is the cheapest verification in the pipeline and the one
whose absence produces a well-tested game that looks wrong.

## What a still can and cannot show

**Can:** layout, clipping, overflow, presence, alignment, colour, legibility,
that the right screen appeared at all. This is where shipped visual defects
actually live.

**Cannot:** timing, responsiveness, weight, animation curves, audio sync — the
"feel" half of Visual/Feel. Feel stays a human check in `/team-qa`. Say which
half the screenshot covered.

## Reaching the state

A screenshot of the title screen verifies nothing about depth 2. Either launch
the screen the story touched directly, or give the app a debug argument that
sets state (`--gold=500 --depth=2`). Write stories so their surface is reachable
one of those ways; a story that is not is a story that will be marked
`NOT VERIFIED` every time.
