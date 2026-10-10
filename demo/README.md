# UnifyCloud Second Brain: working demo

A clickable demo of the planned **Second Brain for UnifyCloud** app. It runs entirely in the browser:
**mock data, simulated AI, no backend.** The permission rules are real, though: every screen and every AI answer
only shows what the signed-in person's roles allow, minus anyone excluded from a data source.

## Run it

```bash
cd demo
npm install      # first time only
npm run dev      # opens on http://localhost:5173
```

`npm run build` creates a static site in `dist/`, which can be hosted anywhere (e.g. Azure Static Web Apps).

## Demo script (about 10 minutes)

| # | Sign in as | Do this | What it shows |
|---|---|---|---|
| 1 | — | Open the app → **Sign in with Microsoft** → account picker | Microsoft single sign-on (automatic in the real app) |
| 2 | **Riya Saxena** (Trainee) | Click "Show me all emails exchanged with Nikhil Bansal", then "Give me all staff details" | AI assistant home page; a trainee sees only her own data |
| 3 | **Vikram Singh** (Team Lead) | "Give me all staff details", "Show my team's leaves" | Same question, different answer: only his team |
| 4 | **Rahul Verma** (Admin) | "Give me all staff details" | The complete hierarchy (22 people) |
| 5 | Rahul | "What's happening in Noida?" → open **People & activity** | Location view: last task, email and chat per person; AI summary |
| 6 | Rahul | **Data explorers → DevOps** (orgs, repos, sprints) and **Email** (filter by department or person) | A page per data source |
| 7 | Rahul | **Admin → Data sources**: disable/enable a source, open **Exclusions** on Outlook email, tick *United Kingdom* | Exclusions are per data source: UK staff's emails are no longer read, so they vanish from the Email explorer, the People view and AI answers |
| 8 | Rahul | **Add data source** → UCLMS → Connect, then **Roles & access** | New sources bring their own access types into the role editor |
| 9 | Rahul | **Roles & access** → New role, set access per source, assign people | Custom roles (e.g. HR: all leaves; IT: all email) |
| 10 | **Sophie Turner** (Sales & Marketing Mgr) | **Leads** → open **Contoso Logistics** → **Fill with AI** → Approve | AI reads emails and fills Nomination Tracker fields, with the source email and confidence for each |
| 11 | **Ananya Rao** (TPM) | **Leads** | A TPM sees only her own leads |
| 11b | Rahul | Click "Who hasn't completed the security training?", then open **Data explorers → Learning (UCLMS)** | UCLMS data source: progress, scores, certificates, client org reports; a mandatory course due 31 Oct |
| 11c | **Vikram Singh** | **My daily digest**: change time, days and channels, watch the preview; ask the assistant "What do I need to do today?" | Daily digest, controlled by each user |
| 11d | Rahul | **Admin → AI agents**: Run now on *Nomination Tracker filler*, configure it (auto above 95%), create a custom agent, then open **Reports** and **Run log** | Configurable AI agents and their reports |
| 12 | **Meera Iyer** (CTO) | "What's happening in London?" | Leadership view. Meera is excluded from email, so her own emails are never read, yet she can see others' |

Use **avatar menu → Reset demo data** to undo all changes, and **Switch demo user** to change person.

## How it's built

- React 18 + TypeScript + Vite, Fluent UI v9 (Microsoft 365 look), React Router (hash URLs)
- `src/data/`: mock org (22 fictional staff in Noida, Sydney, Tokyo, London, New York), emails, chats, DevOps, leaves, documents, leads
- `src/lib/access.ts`: the permission engine. **Layer 1:** exclusions per data source; **layer 2:** roles × access types
- `src/lib/assistant.ts`: the simulated AI. Intent matching stands in for the LLM, but answers are built only from permission-filtered data ("permissions before AI")
- State (data sources, roles, approvals) is kept in the browser's localStorage

All names and companies are fictional.
