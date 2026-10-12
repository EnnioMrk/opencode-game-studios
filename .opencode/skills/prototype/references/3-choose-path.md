# /prototype — Phase 3: Choose the Prototype Path

> Part of `/prototype`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 3: Choose the Prototype Path

**In this file:**

- Path: HTML (browser-playable)
- Path: Paper (rules document + play log)

Select the prototype path. If `--path [html|paper]` was passed, use that.
Otherwise, read the full path details below.

### Path: HTML (browser-playable)

**Best for:** Puzzle games, card games, turn-based strategy, word games, idle games,
top-down logic games. Anything where timing precision doesn't matter.

**Reliability:** ~85–90% one-shot. The agent writes a single self-contained HTML
file the user opens in a browser — no install required.

**Limitation — browser latency lies about game feel.** Browsers introduce
50–133ms of rendering variance. This makes HTML prototypes fundamentally unreliable
for action games, platformers, fighting games, or anything where input timing,
jump arcs, or collision feel are what you're testing. If feel is the hypothesis,
this path cannot answer it.

**Alternative tools for this path:** PICO-8 (extreme constraints, great for retro
arcade concepts, web-export in one command), Phaser.js (more capable browser game
framework, still no install needed), or Twine (narrative/choice-based games).
These are faster than raw HTML for their respective genres — suggest them if appropriate.

**Output:** A single `prototype.html` (or PICO-8/Phaser equivalent) the user opens in any browser.

**Distribution — the HTML path's biggest advantage:** This build can reach real
players globally in minutes. Use this actively:
- **itch.io** — upload the file, share the link, get play counts and written feedback
  within hours. Free. The indie community plays rough builds here without expecting
  polish. This is genuine external validation at zero cost.
- **Loom + file share** — share via Google Drive/Dropbox, ask someone to record their
  screen + audio with Loom while playing. You get a video of real first-impression
  reactions and confusion without synchronous scheduling.
- **r/playmygame or r/WebGames** (Reddit) — active communities that specifically
  test early builds and give unsolicited honest feedback.
- **Game dev Discord servers** (GMTK, Brackeys, GameDev.tv) — members test each
  other's prototypes routinely; an HTML file is the easiest possible ask.

---

### Path: Paper (rules document + play log)

**Best for:** Strategy games, card games, board game-style mechanics, economy
systems, progression loops, any game where the logic can be simulated by hand.
Works for any genre when you need to validate rules, not feel.

**Reliability:** 100%. No code, no install.

**Limitation — cannot validate moment-to-moment feel.** Paper prototypes prove
that the rules are internally consistent and the decisions are interesting. They
cannot tell you whether jumping feels right or whether explosions feel satisfying.

**Paper playtest observation protocol (run this with 5+ people):**
1. Brief the rules once. Hand them the rule summary sheet. Then step back.
2. Do NOT explain further. Do NOT help. Do NOT clarify. Confusion is data.
3. Watch silently. Note every moment they slow down, re-read, or ask a question.
4. After the session, ask one question only: "What was confusing?" — not "Did you like it?"
5. Use fresh testers for each iteration. The same person cannot give new first-impression data.
6. If 3+ testers hit the same confusion point, that rule is broken — redesign it before re-testing.

**Output:** A printable rules document + a completed play log showing one simulated session.

**Narrative tools for this path:** For dialogue-heavy and story-driven games, skip the
generic rules doc — use a dedicated narrative scripting tool instead:
- **Twine** — zero-code hypertext fiction; ideal for branching structure experiments and choice-impact testing
- **Ink** (Inkle) — plain-text scripting language used in *80 Days*, *Heaven's Vault*, and *Overboard*
- **Yarn Spinner** — dialogue scripting used in *A Short Hike*, *DREDGE*, and *Night in the Woods*

All three let you write and playtest branching dialogue in minutes. Key metric for
narrative prototypes: **time to first emotional beat** — how many exchanges before
the player feels something? If it takes more than 3-4 exchanges, the opening is too slow.

---

Assess which path best fits the hypothesis, then use `question` with your
recommendation pre-stated:

- **Prompt**: "Which prototype path would you like to use? (Based on your concept, I'd recommend [path] — [one sentence reason].)"
- **Options**:
  - `HTML — browser prototype` — puzzle, card, turn-based, strategy, idle. Opens by double-clicking, no install. 85–90% reliable. **Not suitable for action games** — browser latency lies about feel.
  - `Paper — rules document + play log` — strategy, economy, logic, board-game-style mechanics. 100% reliable. Cannot validate feel.

---
