# Second Brain — Documentation Index

## Status snapshot

_Last updated: 2026-10-10_

- **Phase:** 1 — Discovery & Documentation
- **Where we are:** The user has given the overall picture. Brief at v0.6. Confirmed so far:
  - it's an application: "the second brain of UnifyCloud where all can know everything (their role allows) and many tasks are automated"
  - the data-source list; pluggable data source management with per-source exclusions (incl. by country, for legal limits)
  - Microsoft SSO login; own data by default; Admin sees all, including everyone's emails
  - **roles: Admin creates custom roles and assigns them; each data source has its own access types**
  - **tech stack: .NET + React + PostgreSQL on Azure** (Claude's AI layer and Azure building-block proposals await confirmation, Q-047)
  - home = role-aware AI assistant + menu with a page per data source (DevOps, Email, …)
  - location/person activity views ("what's happening in Noida"); leads tracking (Partner Center → Nomination Tracker)
  - AI fills the Nomination Tracker from emails (portal owned by another team)

  **Open decision:** AI auto-update vs approve (Q-032, approve recommended). **Deferred:** Nomination Tracker terms/fields (D-023).
  **Still unanswered:** timeline (Q-038), what "know what's happening with leads" means (Q-040). **Legal check owner:** IT (Q-014).
- **Demo built (2026-10-10):** a working React demo in [`../demo/`](../demo/README.md) covering all screens S1–S9, with mock data and simulated AI (D-025). Run with `npm install` then `npm run dev`.
- **Next step:** The user reviews the demo and then shows it to Vivek. After approval, real development starts in a new folder.

## Documents

| Doc | What it holds |
|---|---|
| [project-brief.md](project-brief.md) | What we're building, for whom, why, scope |
| [data-sources.md](data-sources.md) | Catalog of all data sources + the data source management feature (incl. exclusions) |
| [access-control.md](access-control.md) | Login (SSO), roles, and who can see what |
| [ai-features.md](ai-features.md) | AI Assistant home page, Nomination Tracker auto-fill, other AI ideas |
| [screens.md](screens.md) | Screens identified so far (input for the clickthrough) |
| [technology.md](technology.md) | Tech stack, Azure building blocks, key technical patterns |
| [decisions.md](decisions.md) | Every decision, with reasoning (D-###) |
| [open-questions.md](open-questions.md) | Unknowns still to resolve (Q-###) |
| [glossary.md](glossary.md) | Terms, acronyms, internal system names |
| [research/](research/README.md) | Research notes, one file per topic |
| [sessions/](sessions/) | Notes from each discussion session |

Raw research material from the user lives in [../Research/](../Research/).
