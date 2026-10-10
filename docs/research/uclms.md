# UCLMS (UnifyCloud Learning Management System)

| | |
|---|---|
| **Source** | The UCLMS project folder `D:\LMS\UCLMS-Project` (README, ARCHITECTURE.md, docs/UCLMS-Project-Brief.md, API controllers and DTOs), read on 2026-10-10 |
| **Production URL** | `https://ucelearning.azurewebsites.net` |
| **Owner** | UI/UX team (per `Research/Data-sources.xlsx`) |
| **How we connect** | **Through the UCLMS REST API** (user, 2026-10-10) (D-026) |

## What it is
An internal corporate LMS (Canvas-style) used to:
- **train UnifyCloud staff** on internal tools, products (e.g. CloudAtlas, CloudPilot) and compliance, and
- **onboard client and partner staff** (organisations whose teams use UnifyCloud products).

There's no public sign-up: admins invite users by email.

## Tech
.NET 8 Web API (clean architecture) + Angular 20 SPA, served from one Azure App Service. Azure SQL, Azure Blob Storage, SMTP (Office 365) email.
**Auth today:** UCLMS's own login with JWT (15-minute access token + refresh cookie). **Entra ID SSO is planned, not built yet.**

## Data model (what's there)
| Area | Entities |
|---|---|
| People | Users (name, **email**, role, organisation, active, last login), Organizations (optional grouping: a company or department) |
| Content | Courses (title, category, status Draft/Published/Archived, passing score %, dates), Modules, Module Items, Pages, Quizzes, Assignments |
| Progress | CourseEnrollments (status NotStarted / InProgress / Completed, final score, completion date), ModuleItemProgress, QuizAttempts, AssignmentSubmissions |
| Results | Certificates (issued date, verification code, score) |

**UCLMS's own roles:** Platform Admin, Instructor, Observer (read-only, scoped to organisations), Learner.

## API endpoints useful to the Second Brain (all `GET`)
| Endpoint | Gives us | UCLMS role needed |
|---|---|---|
| `/api/users` | All users (paged), incl. email: used to **match to Entra ID by email** | Admin / Instructor |
| `/api/users/{id}/activity` | One person's enrolments with progress, per-assessment grades, certificates, last login, "everything an admin needs to answer *what has this person done?*" | Admin / Instructor |
| `/api/courses` | Course catalogue (title, category, status, passing score, module count, dates) | Any |
| `/api/reports/platform` | Totals: users, orgs, courses, enrolments, certificates, completion rate | Admin |
| `/api/reports/org/{id}` | Per-organisation: learners, enrolments, completion rate, average score, per-course breakdown | Admin / Observer |
| `/api/reports/course/{id}` | Per-course: enrolled / completed / in progress / not started, average score, each learner's status | Admin / Observer |
| `/api/reports/user/{id}` | A learner's courses, statuses, scores, completion dates | Admin / Observer |
| `/api/organizations` | Organisations | Admin |
| `/api/assignments/pending-grading` | Submissions waiting for grading | Instructor / Admin |

## What the Second Brain uses it for
- **Every employee:** "Show my training progress", "Which mandatory courses do I still need to finish?"
- **Team Leads:** their team's training status.
- **Admin / Leadership / a Training Manager role:** "Who hasn't completed the security training?", completion by department or location, client organisation training reports.
- **People & activity / Person page:** each person's courses, progress and certificates sit alongside their tasks, emails and chats.

## Integration considerations
| # | Topic | Note |
|---|---|---|
| 1 | **API authentication** | UCLMS only has user logins (JWT) today; there's no app-to-app access. Options: (a) a dedicated read-only **service account** in UCLMS, or (b) **better:** add Entra ID **app-to-app (client credentials)** auth to UCLMS for the Second Brain, which fits UCLMS's planned move to Entra SSO. The same team owns UCLMS, so (b) is realistic (Q-048) |
| 2 | **Matching people** | UCLMS users have their own numeric IDs. Match them to Entra ID users by **email address** |
| 3 | **Client / partner learners** | They aren't UnifyCloud staff and aren't in Entra ID. Proposal: show **only organisation totals** for them, not individuals (Q-049) |
| 4 | **Exclusions** | Exclusions apply as for other personal sources (D-008): an excluded person's learning records are never read |
| 5 | **What not to pull** | Quiz answer keys and full submission contents aren't needed; status, scores, dates and certificates are enough |
| 6 | **Access types (draft)** | Own learning · Team learning · Department · Same location · All learners + client org reports |

## Demo
Added to the demo on 2026-10-10. Mock data mirrors the API shapes above (`demo/src/data/learning.ts`): 6 courses incl. a mandatory security course, 42 enrolments, certificates, 3 client organisations, and the **Learning (UCLMS)** explorer page.
