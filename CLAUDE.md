# Second Brain — Project Memory & Working Rules

This folder is a **research and documentation workspace**, not a codebase (yet).
These rules exist so Claude keeps full context of every discussion across sessions.

## Current phase

**Phase 1 — Discovery & Documentation** (started 2026-10-10)

| Phase | Goal | Status |
|---|---|---|
| 1. Discovery & documentation | Research, discuss, and document *what* we build and *how*, minor to major | **In progress** |
| 2. Clickthrough demo | A working, clickable prototype for demo purposes (no real backend) | **In progress since 2026-10-10** (D-025): React app in `demo/`, mock data, simulated AI |
| 3. Development | Real build | Not started |

**No production code yet.** The only code is the demo in `demo/` (mock data, no real backend). Real development starts in a separate new folder after the demo is approved (D-025).

## At the start of every session — read these first

1. `docs/README.md` — index + current status snapshot
2. `docs/project-brief.md` — the single source of truth for what we're building
3. The most recent file in `docs/sessions/` — where we left off
4. `docs/open-questions.md` — what's still unresolved
5. `docs/decisions.md` — what's already been decided (don't re-litigate these unless the user raises them)

Then briefly tell the user where we left off and what's open.

## While discussing — record everything

The user wants **every detail documented, minor to major**. Don't wait to be asked.

- **Decision made** → add to `docs/decisions.md` as `D-###` (date, decision, why, alternatives considered).
  Never delete a decision; if it changes, mark it `Superseded by D-###`.
- **Question raised / unknown** → add to `docs/open-questions.md` as `Q-###`. Move to "Resolved" with the answer + date when answered.
- **Research done** → new file in `docs/research/<topic>.md` (sources, date, findings, implications for us). Add it to the index in `docs/research/README.md`.
- **New term / acronym** → `docs/glossary.md`.
- **Scope, users, features, flows change** → update `docs/project-brief.md` (and later `docs/features/`, `docs/flows/`).
- **Assumptions** → write them down explicitly labelled *Assumption* and add a matching open question so the user can confirm. Never present a guess as a fact.

## End of every discussion (or when the user says "wrap up" / "save")

1. Write/append `docs/sessions/YYYY-MM-DD-<short-topic>.md`: what we discussed, what was decided, what's open, next steps.
2. Update the status snapshot in `docs/README.md`.
3. Make sure every new decision/question from the session is in its log.

## Folder layout

```
CLAUDE.md                 ← this file (auto-loaded every session)
Research/                  ← user's raw research material (xlsx, transcripts). Keep as-is; don't rename/move without asking.
docs/
  README.md               ← index + status snapshot
  project-brief.md        ← living "what & why" of the product
  data-sources.md         ← catalog of data sources + data source management feature (core of the app)
  access-control.md       ← login (SSO), roles, visibility rules
  ai-features.md          ← AI assistant (home page), AI record auto-fill, other AI ideas
  screens.md              ← screen inventory (feeds the clickthrough)
  technology.md           ← tech stack, Azure building blocks, technical patterns
  decisions.md            ← decision log (D-###)
  open-questions.md       ← open/resolved questions (Q-###)
  glossary.md             ← terms & acronyms
  research/               ← one file per research topic
  sessions/               ← one file per discussion session
  features/               ← (later) one spec per feature
  flows/                  ← (later) user journeys / screen flows for the clickthrough
demo/                     ← the working demo: React + Vite + Fluent UI, mock data, simulated AI (D-025). `npm install` then `npm run dev`
```

Create `features/` and `flows/` only when we get there. When a demo feature changes behaviour, update the matching doc as well.

## Style

- Plain Markdown, short sections, tables where they help. Absolute dates (YYYY-MM-DD), never "yesterday" / "next week".
- Link between docs with relative links, and cite IDs (`D-004`, `Q-012`) so things are traceable.
- Prefer updating an existing doc over creating a near-duplicate.
