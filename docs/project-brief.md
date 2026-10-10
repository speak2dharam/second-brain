# Project Brief — Second Brain for UnifyCloud

_Living document. Last updated: 2026-10-10_

> Status: **Draft v0.6.** Built from the [kickoff meeting](research/kickoff-meeting.md), `Research/Data-sources.xlsx`, and the user's explanation on 2026-10-10. Items marked (Q-###) are open questions.

## 1. One-line summary
An **application** (working name: **"Second Brain for UnifyCloud"**) that brings together all of UnifyCloud's data sources. Leadership can then **see everything happening across teams, departments, countries and regions**, and AI agents get the context for any company task, including the data entry people skip today.

> **In the user's words (2026-10-10):** "A complete AI-enabled application which is the second brain of UnifyCloud, where all can know everything, and we can automate many tasks." For example, AI reads emails and updates the Nomination Tracker.
>
> *"All can know everything"* is read together with the access rules: everyone can know everything **their role allows** ([access-control.md](access-control.md)).

## 2. Problem
- Company knowledge is spread across many systems, with no single place to see what's going on.
- **Leadership has no single view** of what's happening across teams, departments, countries and regions (user, 2026-10-10).
- **Sales & marketing skip most fields in the Nomination Tracker** because there are too many (user, 2026-10-10).
- For each opportunity, TPMs are expected to keep sales records up to date by hand _(kickoff)_:
  - fill in an opportunity/lead form with **50+ fields**
  - log meetings when they're scheduled
  - upload meeting transcripts and action items after each meeting
  - schedule the next meeting and the next action
- **In practice, no TPM does this**, in any region. The result is constant friction: marketing and sales vs TPMs, each blaming the other.

## 3. Organisation context
| Aspect | What we know |
|---|---|
| Departments / teams | IT, Sales, Marketing, PMs/TPMs (maybe more) |
| Client countries | Australia, US, UK, Japan |
| Where people sit | Many in India (Noida); some in the client countries |
| Tech environment | Fully Microsoft: one Entra ID tenant, Azure, Azure DevOps, Teams, Outlook email, SharePoint/OneDrive |

## 4. Target users _(draft, Q-015)_
| User | What they get |
|---|---|
| **Leadership (the user's boss)** | One view of everything happening, by team, department, country and region |
| Every employee (incl. trainees) | An AI assistant over their own email, Teams, SharePoint, OneDrive and leaves |
| TPMs / PMs | Less manual data entry; forms and meeting records filled in for them |
| Marketing & sales | Nomination Tracker filled in by AI; complete, up-to-date opportunity data |
| Team Leads | Their team's data where allowed (e.g. leaves, staff details) |
| All employees (longer term) | Context and references for any task, e.g. writing an SOW |
| Admins | See all data (except excluded people); manage the data sources |
| AI agents | A shared data and context layer to build on |

## 5. Goals & success criteria
- **G1:** Data from all key company sources is available to different AI agents. _(kickoff)_
- **G2:** Give reference and context for every task, small (updating a lead) to large (writing an SOW). _(kickoff)_
- **G3:** Auto-fill the **Nomination Tracker**: AI reads emails, extracts the information and updates records. The kickoff target is **≥45 of 50 fields**. _(kickoff + user)_
- **G4:** Capture meeting data (schedule, transcript, action items, next steps) automatically. _(kickoff)_
- **G5:** **Org-wide visibility for leadership:** see what's happening across teams, departments, countries, regions and **locations** (e.g. "what's happening in Noida": who works there, their last task, email, chat), and **any single person's activity**. _(user, 2026-10-10)_
- **G6:** **Data sources can be plugged in:** add, edit, enable, disable and delete sources; add more over time. _(user, 2026-10-10)_
- **G7:** **Privacy by design:** sensitive people's data is never read; everyone sees only their own data unless their role allows more. _(user, 2026-10-10)_
- **G8:** **AI-first:** AI in everything. The home page is an AI assistant where anyone can ask anything about the data they're allowed to see. _(user, 2026-10-10)_
- **G9:** **Leads visibility:** Admin knows what's happening with every lead from Microsoft (Partner Center → Nomination Tracker). _(user, 2026-10-10)_
- **G10:** **Automate tasks:** start with AI updating the Nomination Tracker from emails; more automation to follow. _(user, 2026-10-10)_

**Success criteria:** _TBD_

## 6. Scope
### Candidate first use case _(Q-010)_
**AI Assistant home page + Nomination Tracker auto-fill.** Both are now confirmed as requirements by the user. Leadership visibility (G5) may be equally central. Order not decided.
### In scope (confirmed)
- Connecting the data sources listed in [data-sources.md](data-sources.md)
- Data source management (add / edit / enable / disable / delete), including per-source exclusions
- Microsoft single sign-on for all UnifyCloud users
- Roles and per-source visibility rules
### Out of scope
_TBD_

## 7. Data sources
**Full catalog and management feature: [data-sources.md](data-sources.md).**

Confirmed by user: Microsoft Entra ID, Azure, Azure DevOps, Teams, Outlook email, Microsoft Partner Center, Nomination Tracker, Central Provisioning System, Leave Management Portal, **UCLMS** (learning system, via its API, D-026). More will come. In-house portals may provide data as Excel files.

**Lead flow:** Microsoft → Partner Center (lead) → **someone uploads an Excel file** → Nomination Tracker (handled by sales & marketing / TPMs). See [research/partner-center.md](research/partner-center.md) and [research/nomination-tracker.md](research/nomination-tracker.md).

## 8. Key features _(draft)_
| ID | Feature | Source |
|---|---|---|
| F1 | Connect to and index the data sources | Kickoff + user |
| F2 | Context/API layer that AI agents can query | Kickoff |
| F3 | **Nomination Tracker auto-fill:** AI reads emails, extracts information, updates records | Kickoff + user |
| F4 | Meeting capture: transcript, action items, next meeting | Kickoff |
| F5 | **Leadership overview:** activity by team / department / country / region | User, 2026-10-10 |
| F6 | **Data source management:** add / edit / enable / disable / delete, plus **per-source exclusions** (whose data is never read) | User, 2026-10-10 |
| F7 | **Login with Microsoft (single sign-on):** open the URL and you're in if already signed in to Microsoft | User, 2026-10-10 |
| F8 | **Roles & permissions:** Admin **creates roles and assigns them**; each data source has its **own access types** (e.g. HR: all leaves; IT: all staff email; Sales & Marketing manager: all leads). Everyone gets own data by default; Admin sees all | User, 2026-10-10 |
| F9 | **AI Assistant home page + menu:** chat; ask anything; answers are role-aware | User, 2026-10-10 |
| F10 | **Data source explorers:** a menu page per source, e.g. DevOps (orgs, repos, sprints, tasks), Email (all emails by department/person) | User, 2026-10-10 |
| F11 | **Org / location overview:** what's happening in a location, team, department, country or region | User, 2026-10-10 |
| F12 | **Person activity:** one staff member's recent tasks, emails, chats | User, 2026-10-10 |
| F13 | **Leads tracker:** Microsoft leads (Partner Center) and their status in the Nomination Tracker | User, 2026-10-10 |

Details: access rules in [access-control.md](access-control.md) · AI in [ai-features.md](ai-features.md) · screens in [screens.md](screens.md).

## 9. Constraints
- **Tech:** UnifyCloud is fully on Microsoft (Entra ID, Azure, M365, Azure DevOps). **Stack: .NET + React + PostgreSQL on Azure** (D-024). See [technology.md](technology.md).
- **Time:** "You don't have infinite time." Move fast and use AI. _(kickoff)_
- **Don't reinvent:** research how other companies have built this first. _(kickoff)_
- **Access & privacy:** reading all employees' email and OneDrive needs approval. Staff and clients span India, Australia, US, UK, Japan (and Europe per the kickoff) (Q-014).

## 10. Risks
| Risk | Why it matters |
|---|---|
| Privacy/legal approval for mailbox scanning | Could block the core idea; several countries' laws apply |
| Permission leakage | The app must not show data to people who shouldn't see it (e.g. leave data, other people's email). Addressed by design: exclusions (D-008), own data by default (D-009). Still needs careful build and testing |
| Tension: "boss sees everything" vs "own data only" | Must define what Leadership actually sees: content or summaries (Q-028) |
| Admin reads everyone's personal content | Confirmed: Admin sees everyone's emails (D-018). Legal risk is handled by excluding staff in restricted countries (D-016), but **India, Australia, Japan and the US have privacy laws too**, and staff may need to be told. Needs a legal/HR check (Q-014) |
| Employee-monitoring perception | "Last email / last chat / what are they doing" per person can feel like surveillance and hurt trust if staff aren't informed (Q-014) |
| Dependency on another team | The Nomination Tracker is owned by another team; read/write access needs their cooperation (Q-033) |
| AI leaks data across roles | The assistant must only receive data the user may see. Permissions are applied before the AI, never left to the AI ([ai-features.md](ai-features.md#key-design-principle-claudes-recommendation-to-confirm)) |
| No write access to Nomination Tracker | If it's Excel-only, AI can't update it directly (Q-033) |
| AI fills fields wrongly | Bad data goes into the sales pipeline; may need human review before submit |
| Adoption | TPMs already skip the current process; the new flow must take less effort |
| Patchy org data | If Entra ID fields (department, country) are incomplete, the team/country views will be wrong (Q-020) |
| In-house data via Excel | Manual uploads can go stale or be inconsistent |

## 11. Stakeholders & people
| Person | Role in this project | Source |
|---|---|---|
| **Vivek Bhatnagar** | **The user's boss and the sponsor.** Wants the application; wants to see everything across teams, departments, countries and regions. Set the vision in the kickoff | User + kickoff |
| IT team | Owns the **legal/privacy check** on reading staff data (Q-014) | User, 2026-10-10 |
| Anil Tiwari | Team member; committed to creating the specs and architecture | Kickoff |
| Amit, Rajat | Know the opportunity form fields and system | Kickoff 11:50 |
| Akshay | A TPM, used as the example user | Kickoff |
| Nomination Tracker team | Another team that owns the Nomination Tracker portal. The user must coordinate with them for access and AI updates (Q-033) | User, 2026-10-10 |
| The user | **Sr. UI/UX Developer**; documenting and designing the app with Claude | User, 2026-10-10 |

## 12. Agreed next steps (from the kickoff)
1. Create **specifications and architecture** first, then take questions to Vivek.
2. **Study the opportunity form fields** with Amit / Rajat.
3. **Research** how other companies have built this.
