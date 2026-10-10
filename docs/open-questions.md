# Open Questions

## Open

| ID | Raised | Question | Context / why it matters |
|---|---|---|---|
| Q-008 | 2026-10-10 | ⏸ *Deferred (D-023).* What are the 50+ Nomination Tracker fields exactly? About 32 are known from the screenshot ([research](research/nomination-tracker.md)); the popup scrolls, so more remain | Needed when we design the Nomination Tracker data source |
| Q-009 | 2026-10-10 | What does TPM stand for at UnifyCloud (Technical Program/Project Manager?), and what is their workflow per opportunity? Are "PMs" (user's word) and "TPMs" (kickoff) the same role? | Primary users of the leads/auto-fill features |
| Q-010 | 2026-10-10 | What's the **first release / MVP**, and what goes into the **clickthrough demo** first? E.g. AI assistant + Data sources + Roles, then explorers, Noida view, leads… | Shapes scope and the demo |
| Q-011 | 2026-10-10 | Are "Nomination Portal" (kickoff) and "Nomination Tracker" the same system? Very likely yes | Data-source list |
| Q-014 | 2026-10-10 | **Legal/privacy check (owner: IT, per user).** Is reading all employees' email/OneDrive approved? Besides UK/Europe (handled by exclusion, D-016), other countries have privacy laws too (India's DPDP Act 2023, Australia's Privacy Act, Japan's APPI, US state laws). Must staff be **told** their email/chats are read and their activity is visible? | Could block or reshape the core idea; affects most staff |
| Q-015 | 2026-10-10 | Which "AI agents" (kickoff wording) will use the Second Brain besides our own AI assistant? | Is this a platform, an app, or both? |
| Q-017 | 2026-10-10 | Hosting is answered (Azure, D-024). Still open: **which Azure region(s)**, and must data stay in a certain country? What Microsoft licences exist (e.g. Microsoft 365 Copilot, E3/E5)? | Data residency; staff span India, Australia, UK, US, Japan |
| Q-018 | 2026-10-10 | Who owns or has access to Microsoft Partner Center at UnifyCloud? | Needed for API access to leads |
| Q-019 | 2026-10-10 | For each in-house portal (Nomination Tracker, Central Provisioning, Leave Management, …): who owns it, what data does it hold, and can it give data by API, database or only Excel? | Decides the connection type per source |
| Q-020 | 2026-10-10 | Are Entra ID user profiles (department, job title, country, **office location, e.g. Noida**, manager) filled in correctly for everyone? | Drives the location/team/department/country views (G5, D-019) |
| Q-021 | 2026-10-10 | What data is wanted from "Azure" itself: resources, costs, customer environments? Or did "Azure" just mean the Microsoft platform in general? | Data-source scope |
| Q-022 | 2026-10-10 | What exactly does the boss want to "see" in the overview pages (G5)? Which activities, metrics, and level of detail? | Defines the overview screens |
| Q-024 | 2026-10-10 | **Exclusions:** exclude by person, Entra group, job title, country (country confirmed, D-016)? And what about an excluded person's messages found in *other* people's mailboxes/chats (e.g. an employee's email to the CTO): read, skip, or hide that part? | Defines how strong the exclusion really is |
| Q-025 | 2026-10-10 | If someone is added to an exclusion list later, do we delete their already-imported data? | Data retention / privacy |
| Q-026 | 2026-10-10 | What does "own data" mean for shared content (SharePoint sites, Teams channels)? Proposal: users see in the app exactly what they can already open in Microsoft 365 | Visibility rules for M365 sources |
| Q-027 | 2026-10-10 | For "Team" access: how do we know who's in someone's team? Entra manager field, the Leave Management portal's data, or defined in the app? Direct reports only, or everyone below them? | Needed for any "Team" access type |
| Q-029 | 2026-10-10 | Who can log in: only employees, or also guests/contractors in the tenant? And what does an excluded person (e.g. the CTO) see about themselves? | Login rules, edge cases |
| Q-030 | 2026-10-10 | Who may view or edit the exclusion lists? Should every change be logged? | Exclusions are highly sensitive settings |
| Q-031 | 2026-10-10 | Is Entra ID always connected first, as the foundation (the people list used for exclusions, roles and teams)? | Setup order and dependencies (assumed yes) |
| Q-032 | 2026-10-10 | When AI extracts values for the Nomination Tracker, does it **update records directly**, or **suggest and let a person approve**? Claude recommends suggest + one-click approve at the start | Data quality and trust in sales data |
| Q-033 | 2026-10-10 | Can the app **write back** to the Nomination Tracker? It's a custom app on Azure App Service, **owned by another team**. Which team and contact? Can they give API or database access for read and write? | Whether D-014 is technically possible; the user must coordinate with that team |
| Q-035 | 2026-10-10 | Can the AI assistant **take actions** (update records, apply for leave, send emails), or only answer questions? | Scope of the assistant |
| Q-036 | 2026-10-10 | How will AI know which Nomination Tracker record an email belongs to (customer name, email domain, opportunity ID, …)? | Core of the auto-fill logic |
| Q-037 | 2026-10-10 | ⏸ *Deferred (D-023).* Nomination Tracker terms: CR (CloudRecon?), CP (CloudPilot?), AMMP, WWSA, LOE, POE, MLS, CPS, TP ID, Engagement Type, "Open AI Nomination", ACA. Claude's guesses are in [research/nomination-tracker.md](research/nomination-tracker.md#terms-claudes-guesses-please-confirm-q-037) | Needed when we design the Nomination Tracker data source |
| Q-038 | 2026-10-10 | What are the **timeline and deadlines**: when are the docs/specs due, and when is the clickthrough demo expected? | Planning; how deep to go |
| Q-040 | 2026-10-10 | What does "know what's happening with leads" mean in practice: status per lead, stage, stuck leads, missing documents, next steps, totals by region? | Defines the Leads tracker (S9) |
| Q-041 | 2026-10-10 | Can one person hold **several roles** (e.g. Employee + HR Leave Manager)? Suggestion: yes, and access adds up, so the widest wins | Role model (D-021) |
| Q-042 | 2026-10-10 | Do access types include **actions** (edit records, approve AI suggestions, upload Excel), or only viewing? | Role model (D-022) |
| Q-043 | 2026-10-10 | Can a role be assigned to a whole **Entra group** (e.g. everyone in "HR") as well as to individuals? | Saves Admin assigning people one by one |
| Q-044 | 2026-10-10 | Roughly **how many staff**, and how much data (mailbox sizes, Teams activity, SharePoint/OneDrive size)? | Database/storage sizing, sync design, cost |
| Q-045 | 2026-10-10 | Is there a **budget** for Azure running costs (AI model usage, database, storage)? | AI and storage costs can be significant at org-wide scale |
| Q-046 | 2026-10-10 | Which **React component library**: Fluent UI (Microsoft 365 look, familiar to staff), MUI, shadcn/ui, other? | User's call as UI/UX lead; affects the clickthrough too |
| Q-048 | 2026-10-10 | **UCLMS API access for the Second Brain:** UCLMS only has user logins (JWT) today. Use a read-only service account, or add Entra ID app-to-app (client credentials) auth to UCLMS? Claude recommends the latter, since Entra SSO is already planned for UCLMS | Secure, unattended syncing from UCLMS |
| Q-049 | 2026-10-10 | UCLMS also trains **client/partner staff** (not UnifyCloud employees, not in Entra). Should the Second Brain show only **organisation totals** for them (proposal), or individuals too? | Privacy of non-employees |
| Q-050 | 2026-10-10 | **Governance for AI agents:** only Admin can create or change agents (as in the demo)? Should a new custom agent or a switch to "act automatically" need a second person's approval before it goes live? Is there one overall monthly AI budget across all agents? | Agents run with broad read access and can write to systems |
| Q-047 | 2026-10-10 | Confirm Claude's proposals in [technology.md](technology.md): **Azure AI Foundry** for AI (model chosen later by testing), **pgvector** in PostgreSQL for AI search (Azure AI Search as fallback), the Azure building blocks, and **private networking** | Completes the architecture |

## Resolved

| ID | Raised | Resolved | Question | Answer |
|---|---|---|---|---|
| Q-001 | 2026-10-10 | 2026-10-10 | What is the project? | An AI-enabled "Second Brain for UnifyCloud" application. See [project-brief.md](project-brief.md) |
| Q-002 | 2026-10-10 | 2026-10-10 | Is the spreadsheet list the set of systems this project will connect to? | Broadly yes; the user confirmed the list (D-006) |
| Q-003 | 2026-10-10 | 2026-10-10 | What is `Research/transcript.txt` for? | It's the kickoff meeting transcript. Analysed in [research/kickoff-meeting.md](research/kickoff-meeting.md) |
| Q-004 | 2026-10-10 | 2026-10-10 | Is Vivek Bhatnagar the user's boss / sponsor? | **Yes** (user) |
| Q-005 | 2026-10-10 | 2026-10-10 | What was said in the missing 8 minutes of the kickoff? | **Not needed**; the user said to ignore it |
| Q-006 | 2026-10-10 | 2026-10-10 | What is the user's role? | **Sr. UI/UX Developer** (user). Team composition not specified |
| Q-007 | 2026-10-10 | 2026-10-10 | Which system holds the form with many fields that people skip? | The **Nomination Tracker**, used by sales & marketing (user) |
| Q-013 | 2026-10-10 | 2026-10-10 | Is "DevOps" Azure DevOps? | Yes. Everything is on Microsoft/Azure (user) |
| Q-012 | 2026-10-10 | 2026-10-10 | Is UCLMS in scope? | **Yes.** Added as a data source via its REST API (D-026). See [research/uclms.md](research/uclms.md) |
| Q-016 | 2026-10-10 | 2026-10-10 | Kickoff's cut-off "submitting customer […]" example | Dropped along with the missing transcript part (user: ignore it) |
| Q-023 | 2026-10-10 | 2026-10-10 | Roles: from Entra ID, in the app, or both? | **Created in the app by Admin, then assigned** (D-021). Each data source has its own access types (D-022) |
| Q-028 | 2026-10-10 | 2026-10-10 | Which roles do we need, and is Leadership the same as Admin? | **No fixed list.** Admin creates roles as needed; built-in Admin and Employee; Leadership is whatever Admin configures. See [access-control.md](access-control.md#3-roles) |
| Q-034 | 2026-10-10 | 2026-10-10 | Does Admin "see all data" include everyone's email content? | **Yes.** Admin can see all emails, by department or person. Countries with legal limits are handled by excluding those staff (D-016, D-018) |
| Q-039 | 2026-10-10 | 2026-10-10 | How do leads get from Partner Center into the Nomination Tracker? | **Someone uploads an Excel file into the Nomination Tracker**, so it's manual (user: "I think"). Possible automation later |
