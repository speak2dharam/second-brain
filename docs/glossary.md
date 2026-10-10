# Glossary

Terms, acronyms and internal system names. "?" = meaning not yet confirmed by the user.

| Term | Meaning |
|---|---|
| Second Brain | This project: a shared knowledge and context layer over UnifyCloud's systems, used by AI agents |
| UnifyCloud | The organisation this project is for |
| TPM / PM | ? Probably Technical Program/Project Manager. Fills in opportunity data and runs customer meetings. PMs work for clients in Australia, US, UK and Japan, from India or on-site. Whether "PM" and "TPM" are the same role is unconfirmed (Q-009) |
| Microsoft Entra ID | Microsoft's identity service (formerly Azure AD). UnifyCloud's single tenant for all users |
| Microsoft Graph | Microsoft's single API for Microsoft 365 data (users, mail, Teams, SharePoint, OneDrive) |
| Data source | Any system the app pulls data from, connected by API or file upload. Managed in-app (D-005) |
| SSO (single sign-on) | Signing in once with a Microsoft work account and being let into the app automatically (D-007) |
| Exclusion list | Per data source: the people whose data the app never reads (D-008) |
| Visibility level | How far a role can see in a source: None / Own / Team / Department / Country-Region / All (draft) |
| Own data | A user's own email, Teams, OneDrive, etc. The default visibility for everyone (D-009) |
| Opportunity / lead form | ? A form with 50+ fields that TPMs are supposed to fill in per sales opportunity. System unknown (Q-007) |
| SOW | Statement of Work: a contract document describing the work for a customer |
| Nomination Tracker (also "Nomination Trackr", "Nomination Portal") | In-house portal used by **sales & marketing** for opportunity/nomination records. It has many fields that people skip; AI is to fill them (D-014). Probably one system under several names (Q-011) |
| AI Assistant | The chatbot on the home page; answers questions from the data the user may see (D-012, D-013) |
| Admin | Role that sees all data the app has read (D-015) |
| Trainee | Example of a default Employee user: sees only their own data |
| UCLMS | **UnifyCloud Learning Management System** (`ucelearning.azurewebsites.net`): internal corporate LMS for staff and client/partner training: courses, quizzes, assignments, certificates. .NET 8 + Angular. Owned by the UI/UX team. A data source via its REST API (D-026). See [research/uclms.md](research/uclms.md) |
| AI agent | Background AI that works on a schedule or trigger without anyone asking (e.g. Nomination Tracker filler, Daily digest, Meeting notes, Lead watcher, Training reminder). Configured in Admin → AI agents (D-028) |
| Autonomy | How far an agent may go: read & report only · suggest (a person approves) · act automatically above a confidence threshold |
| Daily digest | A short AI summary of what needs a person's attention, sent at their chosen time by email, Teams or in-app (D-027) |
| Enrolment | In UCLMS: a person's membership in a course, with status (Not started / In progress / Completed), progress and score |
| Central Provisioning System | ? In-house portal; a confirmed data source |
| Leave Management Portal | ? In-house HR leave portal; a confirmed data source. Sensitive data |
| MS Partner Center | Microsoft Partner Center, Microsoft's partner portal. **Leads from Microsoft arrive here**, then go to the Nomination Tracker. See [research/partner-center.md](research/partner-center.md) |
| Lead | A sales opportunity sent by Microsoft through Partner Center and handled in the Nomination Tracker |
| CR / CP | ? In the Nomination Tracker: probably **CloudRecon** (infrastructure) and **CloudPilot** (app/database) assessments, UnifyCloud tools (Q-037) |
| AMMP | ? Probably Microsoft's **Azure Migration and Modernization Program** (partner funding) (Q-037) |
| LOE / POE | ? Probably Letter of Engagement / Proof of Execution (Q-037) |
| WWSA, MLS, CPS, ACA | ? Nomination Tracker terms, meaning unknown (Q-037) |
| TPID | Microsoft's "Top Parent ID" for a customer organisation |
| Data source explorer | A menu page per data source for browsing its data directly (D-017) |
| pgvector | PostgreSQL extension that stores AI "embeddings" (vectors), so we can search by meaning |
| Embedding | A list of numbers representing a text's meaning. Similar texts get similar numbers, which enables meaning-based search |
| Row-level security (RLS) | PostgreSQL feature that filters which rows each user can read, enforced by the database itself |
| Azure AI Foundry | Azure's platform for hosting AI models (several providers) inside the company's Azure subscription |
| MSAL | Microsoft Authentication Library; MSAL React handles Microsoft sign-in in the frontend |
| Delta query | Microsoft Graph feature to fetch only what changed since the last sync |
| Role | A named set of access types, one per data source. Created by Admin in the app and assigned to people (D-021) |
| Access type | What a role can see (and maybe do) in one data source, e.g. Leave: Own / Team / All. Each data source defines its own (D-022) |
| CloudAtlas | A UnifyCloud product, mentioned in the kickoff status update. Per Claude's general knowledge, a cloud migration/modernization assessment tool (unconfirmed). Not this project |
| GTM Planner | Another internal project (go-to-market planner) mentioned in the kickoff. Not this project |
| Clickthrough | A clickable demo prototype that shows the flows without real backend logic (Phase 2) |
