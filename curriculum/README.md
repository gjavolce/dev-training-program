# Curriculum Directory

This directory contains the complete curriculum reference for the SEB Embedded Engineering Training Program.

## Files

| File | Format | Purpose |
|---|---|---|
| `curriculum-reference.md` | Markdown | Machine-readable source of truth — use as context for Claude Code, session material generation, or exercise implementation |
| `curriculum-matrices.html` | HTML | Interactive browser version — filter by area, track, view full/compact detail |

## Stats

- **4 competency areas**: Database Engineering, Memory Management, Solution Design, Cloud & Observability
- **3 tracks**: Track A (L1→L2), Track B (L2→L3), Track C (L3→L4)
- **108 sessions** total (4 areas × 3 tracks × 9 sessions)
- **108 planted blockers** — one realistic failure per session
- **108 core/medium/hard exercises** — all in the loyalty program capstone domain

## Per-session elements

Each session in the markdown contains:

- **Topic** — what the session covers
- **Theory (credit scoring)** — concept taught in the theory domain
- **Planted blocker** — title + symptom + root cause + fix
- **Core exercise** — scaffolded, everyone completes
- **Medium exercise** — stretch with ambiguity
- **Hard exercise** — applied to engineer's own codebase
- **Between sessions** — homework bridging to next session
- **Prediction prompt** — "predict before running"
- **Ask the room (opening)** — pull knowledge before teaching
- **Ask the room (closing)** — reflection and commitment
- **Checkpoint quiz** — 3 self-check questions
- **Cross-area connection** — link to other competency areas
- **Cheat sheet items** — 3-5 commands/patterns to take away

## How to use

### As context for Claude Code
```bash
cat curriculum/curriculum-reference.md | head -100  # verify structure
# Then reference specific sessions: "Generate the DB-A6 blocker implementation for the loyalty-service"
```

### As context for this Claude project
Load `curriculum-reference.md` into the conversation when working on session materials, loyalty-service features, or train-the-trainer guides.

### For human review
Open `curriculum-matrices.html` in a browser. Filter by area and track. Toggle between full detail and compact view.
