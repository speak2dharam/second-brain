# Access Control: Login, Roles & Data Visibility

_Living document. Last updated: 2026-10-10_

## Two layers of protection

| Layer | Question it answers | Where it's configured | Doc |
|---|---|---|---|
| **1. Ingestion (exclusions)** | Whose data does the app **read at all**? | Per data source | [data-sources.md → Data scope](data-sources.md#data-scope-whose-data-the-app-reads) |
| **2. Visibility (roles)** | Of the data read, **who can see what**? | Roles & permissions | This doc |

Excluded people's data is **never read**, so no role, not even an admin's, can see it (D-008).

---

## 1. Login (authentication)

### Confirmed (user, 2026-10-10)
- Users open the app by its **URL** and sign in with their **Microsoft work account** (Office email).
- **Single sign-on:** if the user is already signed in to Microsoft in that browser, they're signed in automatically, with no extra login screen (D-007).
- **Any UnifyCloud user** can log in.

### Notes
- This is standard Microsoft Entra ID sign-in (OpenID Connect). The app is registered in UnifyCloud's Entra tenant.
- No separate passwords. Leavers lose access automatically when their Entra account is disabled.

### Open
- Can guests, contractors or external accounts in the tenant log in, or only employees? (Q-029)

---

## 2. Data visibility

### Confirmed principles (user, 2026-10-10)
1. **Default = own data only.** Any logged-in user sees **only their own** data: their email, Teams, SharePoint and OneDrive (D-009).
2. Same for in-house sources, e.g. **Leave Management: own leaves only**.
3. **Some roles see more, per data source.** Example: a **Team Lead** sees **their team's leaves** in Leave Management (D-010).
4. **Admin sees all data:** everything the app has read, **including everyone's emails, browsable by department or person**. Excluded people's data is still never read (D-015, D-018).
5. **The AI assistant follows exactly the same rules.** Same question, different answer per role: "give me all staff details" returns the **full hierarchy** for an Admin, but **only their team** for a Team Lead (D-013). See [ai-features.md](ai-features.md#1-ai-assistant-the-home-page).
6. **Admin and CTO/VP can see activity by location and by person:** e.g. "what's happening in Noida": who works there, what they're doing, their last task, email and chat. Also one specific staff member's activity (D-019).
   - Note: the CTO/VP may be **excluded as subjects** (their own data is never read) yet still be **privileged viewers** (they see others' activity). The two settings are independent.
7. **Legal limits are handled with exclusions:** if reading staff email is a legal problem in a country (e.g. UK, Europe), exclude those staff from reading (D-016).

### Visibility levels _(Claude's suggestion, to confirm)_
A shared set of levels makes every rule easy to express:

| Level | Meaning |
|---|---|
| None | Can't see this source |
| Own | Only their own records |
| Team | Own + their team's records |
| Department | Everyone in their department |
| Country / Region | Everyone in a country or region |
| All | Everyone (except excluded people, whose data is never read) |

### Open points
- **"Own" for shared content:** SharePoint sites and Teams channels belong to groups, not one person. Proposal: a user sees in the app **exactly what they can already open in Microsoft 365**, so the app mirrors existing Microsoft permissions (Q-026).
- **Who is in a Team Lead's team?** From the Entra ID manager field, from the Leave Management portal's own data, or defined in the app? Direct reports only, or everyone below them? (Q-027)
- **Leadership (CTO/VP) visibility:** no longer a fixed rule. Admin decides by creating a role for them (D-021).

---

## 3. Roles

### Decided (user, 2026-10-10): Admin creates roles in the app, then assigns them (D-021)
> "There should be an option to create a role, then assign it. Like admin wants to give an HR person complete access to leave, or give email read permission for all staff to an IT guy… according to the data source there should be access types… a Sales & Marketing team manager whom admin wants to give access to see all leads in the tracker." (user)

### How it works
1. **Each data source has its own access types** (D-022). Leave Management might offer *Own / Team / All*; the Nomination Tracker might offer *Own leads / All leads*.
2. **Admin creates a role** by giving it a name and **picking an access type for each data source**.
3. **Admin assigns the role** to people.
4. What a user can see (in menus, explorer pages and AI answers) = what their role(s) allow.

This fits pluggable data sources (D-005): **a new data source arrives with its own access types**, and they show up in the role editor automatically.

### Access types per data source _(draft; ✓ = from the user's examples)_
Access types use the visibility levels above (Own / Team / Department / Country-Region / All), plus source-specific ones where needed.

| Data source | Access types (draft) | Everyone gets by default |
|---|---|---|
| Email | Own · Department · Location · **All staff ✓** (IT example) | **Own ✓** |
| Teams | Own · Department · Location · All | **Own ✓** |
| SharePoint / OneDrive | Own · All | **Own ✓** |
| Leave Management | Own · **Team ✓** · Department · **All ("complete access") ✓** (HR example) | **Own ✓** |
| Entra ID (staff details / hierarchy) | Own · **Team ✓** · Department · **All: full hierarchy ✓** | ? |
| Azure DevOps | Own tasks · Project · **All: orgs, repos, sprints, tasks ✓** | ? |
| Nomination Tracker (leads) | Own leads? · **All leads ✓** (Sales & Marketing manager example). Actions such as edit or approve AI suggestions? (Q-042) | ? |
| Partner Center, Central Provisioning, … | TBD when each source is designed | ? |

### Built-in roles _(Claude's suggestion, consistent with what the user said)_
| Role | Access | Notes |
|---|---|---|
| **Admin** | Everything (except excluded people), incl. creating roles and managing data sources | Confirmed that Admin sees all (D-015, D-018). Can't be deleted |
| **Employee** | **Own** in every source | Everyone gets it automatically at first login (D-009) |

### Example custom roles (from the user's examples)
| Role | Access |
|---|---|
| HR Leave Manager | Leave Management: **All** |
| IT Email Reader | Email: **All staff** |
| Sales & Marketing Manager | Nomination Tracker: **All leads** |
| Team Lead | Leave Management: **Team**; Staff details: **Team** |
| Leadership (CTO/VP) | Whatever Admin chooses, e.g. location and person activity across sources |

### Open points
- Can one person hold **several roles** (e.g. Employee + HR Leave Manager)? Suggestion: yes, and access adds up, so the widest wins (Q-041).
- Do access types include **actions** (edit records, approve AI suggestions, upload Excel), or only viewing? (Q-042)
- Can a role be assigned to a whole **Entra group** (e.g. everyone in "HR") as well as to individuals? That saves assigning people one by one (Q-043).

### Options considered before the decision (history)
| Option | Summary | Outcome |
|---|---|---|
| A. Roles from Entra ID | Defined and assigned in the Azure portal | Not chosen |
| B. Roles in the app | Created and assigned on an admin screen | **Chosen** (D-021) |
| C. Hybrid | In-app roles plus Entra group mapping and an automatic Team Lead | Claude's earlier recommendation. Group assignment survives as an optional idea (Q-043) |
