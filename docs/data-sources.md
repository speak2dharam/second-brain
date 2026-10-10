# Data Sources

_Living document. Last updated: 2026-10-10_

Data sources are the **core of the application** (user, 2026-10-10). This doc has two parts:
1. **Catalog:** every source we know of, what it gives us, and how we might connect to it.
2. **Data source management:** the in-app feature to add, edit, enable, disable and delete sources.

## Context
- UnifyCloud runs **entirely on Microsoft**: one Microsoft Entra ID (Azure AD) tenant, with Azure, Azure DevOps, Teams, Outlook/Exchange email, SharePoint and OneDrive.
- There are also **in-house portals** (Nomination Tracker, Central Provisioning System, Leave Management Portal, …). Their owning teams can share data, **possibly as Excel files**.
- **More sources will come later.** The app must not hard-code a fixed list (D-005).

## 1. Catalog

Legend: ✓ confirmed by user · ? unconfirmed. The "How we might connect" column is Claude's early thinking, still to be researched.

| # | Source | Category | What it could give us | How we might connect | Owner | In scope | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Microsoft Entra ID | Identity & org | Users, departments, job titles, country/office, manager hierarchy, groups | Microsoft Graph API | IT? | ✓ | Could supply the **team / department / country / region** views (Q-020) |
| 2 | Outlook / Exchange email | Communication | Customer conversations, meetings scheduled, accounts discussed | Microsoft Graph API | IT? | ✓ | Privacy/legal approval needed (Q-014) |
| 3 | Microsoft Teams: chats, channels, meetings, recordings, transcripts | Communication | Discussions, meeting transcripts, action items | Microsoft Graph API | IT? | ✓ | Meeting transcripts drive kickoff goal G4 |
| 4 | SharePoint & OneDrive | Documents | Proposals, SOWs, specs, customer documents | Microsoft Graph API | IT? | ✓ | |
| 5 | Azure DevOps | Delivery | Projects, work items, progress, who is working on what | Azure DevOps REST API | ? | ✓ | Confirmed as Azure DevOps (Q-013 resolved) |
| 6 | Azure (subscriptions/resources) | Cloud | ? Resources, costs, customer environments | Azure Resource Manager / Cost Management APIs | ? | ? | Unclear what data is wanted from "Azure" itself (Q-021) |
| 7 | Microsoft Partner Center | Partner / sales | **Leads from Microsoft** (user, 2026-10-10), probably under "Referrals" | Partner Center API (to verify) | ? | ✓ | Leads are then handled in the Nomination Tracker. See [research/partner-center.md](research/partner-center.md) (Q-018, Q-039) |
| 8 | Nomination Tracker | In-house portal: **sales & marketing** | One record per lead/nomination: account, Microsoft opportunity ID, partner, assessment statuses, dates, LOE/POE, NDA, next steps… **Many fields that people skip** | Custom web app on **Azure App Service**, so it likely has its own database. API/DB access through the **owning team** (another team); **needs write access**, because AI updates records (Q-033) | **Another team** (name ?) | ✓ | **Read + write.** Fields seen so far: [research/nomination-tracker.md](research/nomination-tracker.md). Same as the kickoff's "Nomination Portal"? (Q-011) |
| 9 | Central Provisioning System | In-house portal | ? | API / database / **Excel** | ? | ✓ | |
| 10 | Leave Management Portal | In-house portal (HR) | Who is on leave, and when | API / database / **Excel** | ? | ✓ | HR data, sensitive: limit who sees what |
| 11 | Product specifications & UnifyCloud capabilities | Knowledge | What UnifyCloud sells and can do | Document upload / SharePoint | ? | ✓ | Added by Vivek in the kickoff (10:01) |
| 12 | **UCLMS** (UnifyCloud Learning Management System) | In-house portal: **learning** | Courses, enrolments, progress, quiz/assignment scores, certificates, for staff **and client/partner organisations** | **UCLMS REST API** (D-026). Auth for app-to-app access to be decided (Q-048) | UI/UX team | ✓ | Details: [research/uclms.md](research/uclms.md). Match users to Entra by email; client learners as totals only (Q-049) |
| … | Future sources | | | | | | The app must support adding more (D-005) |

**Note (to verify in research):** sources 1–4 are all Microsoft 365 and can be reached through one API, Microsoft Graph. One integration could cover most of the core sources.

### Connection types
| Type | Used for | Status |
|---|---|---|
| **API connector** (scheduled or live sync) | Microsoft 365, Azure DevOps, Partner Center, any in-house portal that has an API | Likely; to research |
| **File upload (Excel/CSV)** | In-house portals without an API; teams share exports | Mentioned by user as likely |
| Others (direct database, …) | TBD | Not discussed |

## 2. Data source management (feature)

### Confirmed requirements (user, 2026-10-10)
- **Add** a new data source
- **Edit** an existing data source
- **Enable / disable** a data source
- **Delete** a data source
- The list must grow over time; "may be there will be more"
- **Set whose data the app reads** for each source, with exclusions (see below)
- **Each data source defines its own access types** (e.g. Leave: Own / Team / All), which Admin uses when building roles (D-022, [access-control.md](access-control.md#3-roles))

### Data scope: whose data the app reads
**Confirmed (user, 2026-10-10):**
- **Each data source** (e.g. Email, Teams) has a setting for **whose data the app may read**.
- Specific people can be **excluded**, e.g. the **CTO, HR Manager, VP**. Their data is **never read** by the app, so **no one** can see it in the app (D-008).

**How it might work (Claude's thinking, to confirm):**
- **Entra ID is the foundation source:** once it's connected, the app knows every user, with their job title, department and groups. The exclusion picker for every other source uses that list. *Assumption: Entra ID is connected first* (Q-031).
- Exclude by **individual person**, by **Entra group** (e.g. "Executives"), or by **job title**? (Q-024)
- **Exclude by country/region:** confirmed as needed (user, 2026-10-10). If reading staff email is legally a problem in the UK or Europe, those staff can be excluded from reading (D-016).
- **Enforce it at Microsoft's side too, where possible:** Exchange Online can restrict which mailboxes an app may read ("RBAC for Applications"), so excluded mailboxes are blocked by Microsoft and not only by our code. SharePoint has a similar "selected sites" permission. *To research.*

**Open edge cases:**
- An employee emails the CTO. The email sits in the employee's mailbox, which *is* read. Do we read it, skip it, or hide the CTO's part? (Q-024)
- If someone is excluded later, do we **delete** their already-imported data? (Q-025)
- Who may edit the exclusion list? It should be very restricted and every change logged (Q-030).
- An excluded person (e.g. the CTO) logs in: do they see nothing from that source, since their data was never read? (Q-029)

### To discuss later (Claude's suggestions, not decided)
- What each source record holds: name, type, connection method, credentials, owning team, sync frequency, last sync time/status.
- **Disable vs delete:** does disabling keep the already-imported data, and does deleting remove it?
- **Who can manage sources:** an admin role only?
- **Excel uploads:** a fixed template per source or flexible column mapping? Does a re-upload replace or add to existing data? How often do teams upload?
- **Visibility per source:** who can see what. Now covered in [access-control.md](access-control.md).
- **Audit log:** who added, changed or deleted a source, and when.
- **Health view:** failed syncs, stale data.

## 3. Data source explorer pages

**Confirmed (user, 2026-10-10):** besides the AI assistant, the menu has **a page per data source** where you can browse its data directly (D-017). What each user sees there follows their role ([access-control.md](access-control.md)).

| Source | Explorer content (what Admin sees) |
|---|---|
| Azure DevOps | All **organisations, repos, sprints, tasks**, etc. |
| Email | **All emails**, filtered **by department** or **by person** |
| Others | TBD |

Screen: S7 in [screens.md](screens.md).
