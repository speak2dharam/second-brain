# Screens

_Living list of the app's screens identified so far. This becomes the input for the clickthrough demo (Phase 2). Last updated: 2026-10-10_

Status: **Identified** = we know it's needed · **Specified** = contents agreed · **Designed** = mock-up exists

> **2026-10-10: all screens S1–S9 are built in the working demo** ([`demo/`](../demo/README.md)), with mock data and simulated AI (D-025). The demo is the reference for layout until the boss approves it.

## Layout
- **Home = AI Assistant** (D-012), plus a **navigation menu** to the other pages (D-017).
- The menu has **one page per data source** (DevOps, Email, …), plus overview pages. Each user sees only the menu items and data their role allows.

## Screen list
| ID | Screen | Who uses it | What it's for | Status | Details |
|---|---|---|---|---|---|
| S1 | Login | Everyone | Microsoft single sign-on. Usually invisible: if already signed in to Microsoft, the user goes straight to the home page | Identified | [access-control.md](access-control.md#1-login-authentication) |
| S2 | **Home: AI Assistant + menu** | Everyone | Chat; ask anything about the data you're allowed to see. Menu to all other pages | Identified | [ai-features.md](ai-features.md#1-ai-assistant-the-home-page) |
| S3 | Data source settings | Admin | List, add, edit, enable, disable and delete sources; set exclusions | Identified | [data-sources.md](data-sources.md#2-data-source-management-feature) |
| S4 | Roles & permissions | Admin | **Create a role** (name, description) → **pick an access type per data source** → **assign to people**. Edit/delete roles. Built-in: Admin, Employee | Partly specified | [access-control.md](access-control.md#3-roles) |
| S5 | Nomination Tracker: AI suggestions | Sales, marketing, TPMs | Review and approve the field values AI extracted | Identified (depends on Q-032) | [ai-features.md](ai-features.md#2-ai-fills-in-records-nomination-tracker) |
| S6 | **Org overview: location, team, department, country, region** | Admin, CTO/VP (Leadership) | "What's happening in Noida?" Who works there, what they're doing, their last task, email and chat. Same view by team, department, country or region | Identified | [project-brief.md](project-brief.md) |
| S7 | **Data source explorers** (one per source) | Admin (others: own data only) | Browse a source's data directly. See the examples below | Identified | [data-sources.md](data-sources.md#3-data-source-explorer-pages) |
| S8 | **Person activity** | Admin, Leadership | One staff member's recent activity across sources: tasks, emails, chats, leaves | Identified | |
| S10 | **My daily digest** | Everyone | Turn the digest on/off; time, days, channels (email / Teams / in-app), sections; live preview; "send me a test" | Built in demo | [ai-features.md](ai-features.md#31-daily-digest-feasible-) |
| S11 | **AI agents** (Admin) | Admin | Agents tab: on/off, run now, configure (trigger, sources, autonomy, threshold, instructions, notify, budget), create custom agent. Reports tab: runs, outputs, approval rate, time saved, cost. Run log tab | Built in demo | [ai-features.md](ai-features.md#32-ai-agents-configurable-in-the-app-feasible-) |
| S9 | **Leads tracker** | Admin, sales & marketing | Leads from Microsoft (Partner Center) and where each stands in the Nomination Tracker | Identified (Q-040) | [research/nomination-tracker.md](research/nomination-tracker.md) |

## Data source explorer examples (S7)
| Explorer | What Admin sees (user, 2026-10-10) |
|---|---|
| **DevOps** | All organisations, repos, sprints, tasks, etc. |
| **Email** | All emails, filtered **by department** or **by person** |
| **Learning (UCLMS)** | Learner progress (filter by course, status, department), course catalogue, client organisation reports (Admin/"all" only) |
| Teams, SharePoint, OneDrive, Leave Mgmt, Nomination Tracker, … | TBD, presumably similar |
