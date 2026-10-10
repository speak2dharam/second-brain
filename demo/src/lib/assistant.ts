/**
 * Simulated AI assistant. In the real app an LLM with tools does this; here simple
 * intent matching stands in. The important part is real: every answer is built only
 * from data that already passed the permission engine (permissions before AI).
 */
import { EXTERNALS, LOCATION_NAMES, PEOPLE, isUnder, nameOf, personById } from '../data/people';
import { NOMINATION_FIELDS, STAGES } from '../data/nominations';
import type { DemoState, Person } from '../data/types';
import {
  accessLabel, emailParticipants, excludedPeople, isAdmin, lastActivity, levelsFor, sourceById, topLevel,
  visibleChats, visibleDocs, visibleEmails, visibleEnrollments, visibleLeaves, visibleNominations, visiblePeople, visibleTasks,
} from './access';
import { courseOf } from '../data/learning';
import { buildDigest } from './digest';
import { fmtDate, isToday } from './format';

export interface Answer {
  paragraphs: string[];
  table?: { columns: string[]; rows: string[][] };
  tree?: { text: string; sub: string; depth: number }[];
  bullets?: string[];
  sources: string[];
  scope: string[];
  actions: { label: string; to: string }[];
  steps: string[];
}

interface Ctx { s: DemoState; uid: string; me: Person; q: string; }

const COUNTRY_WORDS: [RegExp, string][] = [
  [/\bindia\b/, 'India'], [/\baustralia\b/, 'Australia'], [/\bjapan\b/, 'Japan'],
  [/\b(uk|united kingdom|britain)\b/, 'United Kingdom'], [/\b(usa|united states|america)\b/, 'United States'],
];
const DEPT_WORDS: [RegExp, string][] = [
  [/\bmarketing\b/, 'Marketing'], [/\bsales\b/, 'Sales'], [/\bhr\b/, 'HR'], [/\bit (team|department|dept)\b/, 'IT'],
  [/\bdelivery\b/, 'Delivery'], [/\bengineering\b/, 'Engineering'], [/\bleadership\b/, 'Leadership'],
];

const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function findPeople(q: string, except?: string): Person[] {
  return PEOPLE.filter((p) => p.id !== except && (q.includes(p.name.toLowerCase()) || new RegExp(`\\b${esc(p.name.split(' ')[0].toLowerCase())}\\b`).test(q)));
}
const findDept = (q: string) => DEPT_WORDS.find(([re]) => re.test(q))?.[1];
const findLocation = (q: string) => LOCATION_NAMES.find((l) => q.includes(l.toLowerCase()));
const findCountry = (q: string) => COUNTRY_WORDS.find(([re]) => re.test(q))?.[1];
const findOrg = (q: string) => EXTERNALS.find((x) => q.includes(x.org.split(' ')[0].toLowerCase()));

function scopeLines(c: Ctx, ...sourceIds: string[]): string[] {
  const lines: string[] = [];
  for (const id of sourceIds) {
    const src = sourceById(c.s, id);
    if (!src) continue;
    lines.push(`${src.name}: your access is "${accessLabel(c.s, c.uid, id)}"`);
    if (isAdmin(c.s, c.uid) && src.personal) {
      const ex = excludedPeople(src);
      if (ex.length) lines.push(`${src.name}: ${ex.map((p) => p.name).join(', ')} excluded, so their data is never read`);
    }
  }
  return lines;
}

const base = (steps: string[]): Answer => ({ paragraphs: [], sources: [], scope: [], actions: [], steps });
const disabled = (c: Ctx, id: string) => !sourceById(c.s, id)?.enabled;

function disabledAnswer(c: Ctx, id: string): Answer {
  const a = base(['Checking your access']);
  a.paragraphs.push(`The **${sourceById(c.s, id)?.name ?? id}** data source is currently disabled by the Admin, so I can't search it.`);
  return a;
}

/* ---------- intents ---------- */

function emails(c: Ctx): Answer {
  if (disabled(c, 'email')) return disabledAnswer(c, 'email');
  const a = base(['Checking your access', 'Searching Email', 'Writing the answer']);
  const people = findPeople(c.q, c.uid);
  const dept = findDept(c.q);
  const org = findOrg(c.q);
  let list = visibleEmails(c.s, c.uid);
  let about = '';
  if (people.length) {
    list = list.filter((e) => people.some((p) => emailParticipants(e).includes(p.id)));
    about = ` exchanged with **${people.map((p) => p.name).join(', ')}**`;
  } else if (dept) {
    const ids = PEOPLE.filter((p) => p.department === dept && p.id !== c.uid).map((p) => p.id);
    list = list.filter((e) => emailParticipants(e).some((x) => ids.includes(x)));
    about = ` with the **${dept}** team`;
  } else if (org) {
    list = list.filter((e) => emailParticipants(e).includes(org.id) || e.subject.toLowerCase().includes(org.org.split(' ')[0].toLowerCase()));
    about = ` with **${org.org}**`;
  } else {
    const words = c.q.replace(/show|me|all|emails?|mails?|about|the|my|find|list|please|give/g, ' ').split(/\s+/).filter((w) => w.length > 3);
    if (words.length) {
      list = list.filter((e) => words.some((w) => (e.subject + ' ' + e.body).toLowerCase().includes(w)));
      about = ` about **${words.join(' ')}**`;
    }
  }
  const own = topLevel(levelsFor(c.s, c.uid, 'email')) === 'own';
  if (!list.length) {
    a.paragraphs.push(`I couldn't find any emails${about} that you're allowed to see.`);
  } else {
    a.paragraphs.push(`I found **${list.length} email${list.length > 1 ? 's' : ''}**${about}${own ? ' in your mailbox' : ' across the mailboxes you can access'}.`);
    a.table = { columns: ['When', 'From', 'To', 'Subject'], rows: list.slice(0, 12).map((e) => [fmtDate(e.date), nameOf(e.from), e.to.map(nameOf).join(', '), e.subject]) };
    if (list.length > 12) a.paragraphs.push(`Showing the latest 12.`);
  }
  a.sources.push(`Email · ${list.length}`);
  a.scope = scopeLines(c, 'email');
  a.actions.push({ label: 'Open Email explorer', to: '/explore/email' });
  return a;
}

function chats(c: Ctx): Answer {
  if (disabled(c, 'teams')) return disabledAnswer(c, 'teams');
  const a = base(['Checking your access', 'Searching Teams', 'Writing the answer']);
  const people = findPeople(c.q, c.uid);
  let list = visibleChats(c.s, c.uid);
  if (people.length) list = list.filter((m) => people.some((p) => m.participants.includes(p.id)));
  a.paragraphs.push(list.length ? `Here are **${list.length} Teams messages**${people.length ? ` involving **${people.map((p) => p.name).join(', ')}**` : ''} you can see.` : `No Teams messages found that you're allowed to see.`);
  if (list.length) a.table = { columns: ['When', 'Where', 'From', 'Message'], rows: list.slice(0, 10).map((m) => [fmtDate(m.date), m.where, nameOf(m.from), m.text]) };
  a.sources.push(`Teams · ${list.length}`);
  a.scope = scopeLines(c, 'teams');
  a.actions.push({ label: 'Open Teams explorer', to: '/explore/teams' });
  return a;
}

function directory(c: Ctx): Answer {
  if (disabled(c, 'entra')) return disabledAnswer(c, 'entra');
  const a = base(['Checking your access', 'Reading the directory (Entra ID)', 'Building the hierarchy']);
  const visible = visiblePeople(c.s, c.uid);
  const ids = new Set(visible.map((p) => p.id));
  const roots = visible.filter((p) => !p.managerId || !ids.has(p.managerId));
  const tree: Answer['tree'] = [];
  const walk = (p: Person, depth: number) => {
    tree.push({ text: p.name, sub: `${p.jobTitle} · ${p.department} · ${p.location}`, depth });
    visible.filter((x) => x.managerId === p.id).forEach((x) => walk(x, depth + 1));
  };
  roots.forEach((r) => walk(r, 0));
  const top = topLevel(levelsFor(c.s, c.uid, 'entra'));
  const what = top === 'all' ? 'the **complete staff hierarchy**' : top === 'team' ? 'your **team**' : top === 'department' ? `the **${c.me.department}** department` : top === 'location' ? `everyone in **${c.me.location}**` : 'only **your own profile**';
  a.paragraphs.push(`Here is ${what}: **${visible.length} ${visible.length === 1 ? 'person' : 'people'}**.`);
  if (top === 'own') a.paragraphs.push('Your role only allows you to see your own profile. Ask your Admin if you need more access.');
  a.tree = tree;
  a.sources.push(`Entra ID · ${visible.length}`);
  a.scope = scopeLines(c, 'entra');
  a.actions.push({ label: 'Open Directory', to: '/explore/directory' });
  return a;
}

function leaves(c: Ctx): Answer {
  if (disabled(c, 'leave')) return disabledAnswer(c, 'leave');
  const a = base(['Checking your access', 'Searching Leave Management', 'Writing the answer']);
  let list = visibleLeaves(c.s, c.uid);
  let who = 'I found';
  if (/\bmy\b/.test(c.q) && !/\bteam\b/.test(c.q)) { list = list.filter((l) => l.personId === c.uid); who = 'You have'; }
  else if (/\bteam\b/.test(c.q)) { list = list.filter((l) => isUnder(l.personId, c.uid)); who = 'Your team has'; }
  const people = findPeople(c.q, c.uid);
  if (people.length) { list = list.filter((l) => people.some((p) => p.id === l.personId)); who = `${people.map((p) => p.name).join(', ')} ${people.length > 1 ? 'have' : 'has'}`; }
  if (/pending/.test(c.q)) list = list.filter((l) => l.status === 'Pending');
  const pending = list.filter((l) => l.status === 'Pending').length;
  a.paragraphs.push(list.length
    ? `${who} **${list.length} leave record${list.length > 1 ? 's' : ''}**${pending ? `, **${pending} pending** approval` : ''}.`
    : `No leave records found that you're allowed to see.`);
  if (list.length) a.table = { columns: ['Person', 'Type', 'From', 'To', 'Days', 'Status'], rows: list.map((l) => [nameOf(l.personId), l.type, fmtDate(l.from), fmtDate(l.to), String(l.days), l.status]) };
  a.sources.push(`Leave Management · ${list.length}`);
  a.scope = scopeLines(c, 'leave');
  a.actions.push({ label: 'Open Leave explorer', to: '/explore/leave' });
  return a;
}

function tasks(c: Ctx): Answer {
  if (disabled(c, 'devops')) return disabledAnswer(c, 'devops');
  const a = base(['Checking your access', 'Searching Azure DevOps', 'Writing the answer']);
  let list = visibleTasks(c.s, c.uid);
  if (/\bmy\b/.test(c.q)) list = list.filter((w) => w.assignedTo === c.uid);
  a.paragraphs.push(list.length ? `Here are **${list.length} work items** you can see.` : 'No work items found that you can see.');
  if (list.length) a.table = { columns: ['ID', 'Title', 'State', 'Assigned to', 'Sprint', 'Updated'], rows: list.map((w) => [`#${w.id}`, w.title, w.state, nameOf(w.assignedTo), w.sprint, fmtDate(w.updated)]) };
  a.sources.push(`Azure DevOps · ${list.length}`);
  a.scope = scopeLines(c, 'devops');
  a.actions.push({ label: 'Open DevOps explorer', to: '/explore/devops' });
  return a;
}

function docs(c: Ctx): Answer {
  const a = base(['Checking your access', 'Searching SharePoint and OneDrive', 'Writing the answer']);
  let list = visibleDocs(c.s, c.uid);
  const words = c.q.replace(/show|me|all|my|documents?|files?|sharepoint|onedrive|the|find|list/g, ' ').split(/\s+/).filter((w) => w.length > 2);
  if (words.length) {
    const filtered = list.filter((d) => words.some((w) => d.name.toLowerCase().includes(w)));
    if (filtered.length) list = filtered;
  }
  a.paragraphs.push(list.length ? `Here are **${list.length} documents** you can open.` : 'No documents found that you can see.');
  if (list.length) a.table = { columns: ['Name', 'Where', 'Owner', 'Modified'], rows: list.map((d) => [d.name, `${d.source === 'sharepoint' ? 'SharePoint' : 'OneDrive'} › ${d.location}`, nameOf(d.ownerId), fmtDate(d.modified)]) };
  a.sources.push(`SharePoint / OneDrive · ${list.length}`);
  a.scope = scopeLines(c, 'sharepoint', 'onedrive');
  a.actions.push({ label: 'Open Documents', to: '/explore/documents' });
  return a;
}

function place(c: Ctx, location?: string, country?: string): Answer {
  const a = base(['Checking your access', 'Reading the directory', 'Collecting latest tasks, emails and chats', 'Summarising']);
  const label = location ?? country ?? '';
  const people = visiblePeople(c.s, c.uid).filter((p) => (location ? p.location === location : p.country === country));
  if (!people.length) {
    a.paragraphs.push(`You can't see anyone in **${label}** with your current access.`);
    a.scope = scopeLines(c, 'entra');
    return a;
  }
  const rows = people.map((p) => {
    const act = lastActivity(c.s, c.uid, p.id);
    return { p, act, active: [act.task?.updated, act.email?.date, act.chat?.date].some((d) => d && isToday(d)) };
  });
  const activeToday = rows.filter((r) => r.active).length;
  const blocked = rows.filter((r) => r.act.task?.state === 'Blocked');
  const onLeave = visibleLeaves(c.s, c.uid).filter((l) => people.some((p) => p.id === l.personId) && l.status === 'Approved' && l.from >= '2026-10-10' && l.from <= '2026-10-17');
  a.paragraphs.push(`**${label}: ${people.length} ${people.length === 1 ? 'person' : 'people'}** you can see. **${activeToday}** ${activeToday === 1 ? 'was' : 'were'} active today.`);
  const notes: string[] = [];
  if (blocked.length) notes.push(`⚠️ Blocked: ${blocked.map((r) => `${r.p.name} (${r.act.task?.title})`).join('; ')}`);
  if (onLeave.length) notes.push(`🏖️ On leave next week: ${onLeave.map((l) => `${nameOf(l.personId)} (${fmtDate(l.from)}–${fmtDate(l.to)})`).join('; ')}`);
  if (notes.length) a.bullets = notes;
  a.table = {
    columns: ['Person', 'Role', 'Last task', 'Last email', 'Last chat'],
    rows: rows.map(({ p, act }) => [
      p.name, p.jobTitle,
      act.task ? `${act.task.title} (${act.task.state})` : '—',
      act.email ? `${act.email.subject} · ${fmtDate(act.email.date)}` : '—',
      act.chat ? `${act.chat.text} · ${fmtDate(act.chat.date)}` : '—',
    ]),
  };
  a.sources.push(`Entra ID · ${people.length}`, 'Azure DevOps', 'Email', 'Teams');
  a.scope = scopeLines(c, 'entra', 'devops', 'email', 'teams');
  a.actions.push({ label: `Open People & activity (${label})`, to: `/people?group=${location ? 'location' : 'country'}&value=${encodeURIComponent(label)}` });
  return a;
}

function person(c: Ctx, p: Person): Answer {
  const a = base(['Checking your access', `Collecting ${p.name.split(' ')[0]}'s activity`, 'Summarising']);
  if (!visiblePeople(c.s, c.uid).some((x) => x.id === p.id)) {
    a.paragraphs.push(`You don't have access to **${p.name}**'s activity with your current role.`);
    a.scope = scopeLines(c, 'entra');
    return a;
  }
  const items: [string, string, string][] = [];
  visibleTasks(c.s, c.uid).filter((w) => w.assignedTo === p.id).forEach((w) => items.push([w.updated, 'DevOps', `${w.title} (${w.state})`]));
  visibleEmails(c.s, c.uid).filter((e) => emailParticipants(e).includes(p.id)).forEach((e) => items.push([e.date, 'Email', `${e.from === p.id ? 'Sent' : 'Received'}: ${e.subject}`]));
  visibleChats(c.s, c.uid).filter((m) => m.from === p.id).forEach((m) => items.push([m.date, 'Teams', m.text]));
  visibleLeaves(c.s, c.uid).filter((l) => l.personId === p.id).forEach((l) => items.push([l.from, 'Leave', `${l.type} leave ${fmtDate(l.from)}–${fmtDate(l.to)} (${l.status})`]));
  visibleEnrollments(c.s, c.uid).filter((e) => e.personId === p.id).forEach((e) => {
    const crs = courseOf(e.courseId);
    items.push(e.status === 'Completed'
      ? [e.completedAt!, 'UCLMS', `Completed "${crs.title}" (${e.score}%), certificate ${e.certificate}`]
      : [e.lastActivity, 'UCLMS', `"${crs.title}": ${e.itemsCompleted}/${crs.items} items (${e.status})`]);
  });
  items.sort((x, y) => y[0].localeCompare(x[0]));
  a.paragraphs.push(`**${p.name}**, ${p.jobTitle} (${p.department}, ${p.location}).`);
  a.paragraphs.push(items.length ? `Here is their recent activity that you can see: **${items.length} items**.` : 'No activity you can see.');
  if (items.length) a.table = { columns: ['When', 'Source', 'Activity'], rows: items.slice(0, 12).map(([d, src, t]) => [fmtDate(d), src, t]) };
  a.sources.push('Azure DevOps', 'Email', 'Teams', 'Leave Management', 'UCLMS');
  a.scope = scopeLines(c, 'devops', 'email', 'teams', 'leave', 'uclms');
  a.actions.push({ label: `Open ${p.name.split(' ')[0]}'s activity page`, to: `/people/${p.id}` });
  return a;
}

function leads(c: Ctx): Answer {
  if (disabled(c, 'nomination')) return disabledAnswer(c, 'nomination');
  const a = base(['Checking your access', 'Reading the Nomination Tracker', 'Checking AI suggestions', 'Summarising']);
  const list = visibleNominations(c.s, c.uid);
  if (!list.length) {
    a.paragraphs.push("You don't have any leads you can see in the Nomination Tracker.");
    a.scope = scopeLines(c, 'nomination');
    return a;
  }
  const total = NOMINATION_FIELDS.length;
  const filled = (n: (typeof list)[number]) => NOMINATION_FIELDS.filter((f) => n.fields[f.key]).length;
  const pending = c.s.suggestions.filter((x) => x.status === 'pending' && list.some((n) => n.id === x.nominationId)).length;
  const fresh = list.filter((n) => n.received >= '2026-10-04').length;
  const missingOnly = /missing|incomplete|empty/.test(c.q);
  const shown = missingOnly ? list.filter((n) => filled(n) < total) : list;
  a.paragraphs.push(`You can see **${list.length} leads**. **${fresh}** new from Microsoft this week. AI has **${pending} field updates** waiting for approval.`);
  a.bullets = STAGES.map((st) => `${st}: ${list.filter((n) => n.stage === st).length}`);
  a.table = {
    columns: ['Account', 'Country', 'Owner', 'Stage', 'Fields filled'],
    rows: shown.sort((x, y) => filled(x) - filled(y)).map((n) => [n.accountName, n.country, nameOf(n.ownerId), n.stage, `${filled(n)}/${total}`]),
  };
  if (missingOnly) a.paragraphs.push(`Sorted by most missing information first. Open **Nomination AI** to let AI fill the gaps from emails.`);
  a.sources.push(`Nomination Tracker · ${list.length}`, 'Partner Center');
  a.scope = scopeLines(c, 'nomination');
  a.actions.push({ label: 'Open Leads', to: '/leads' }, { label: 'Open Nomination AI', to: '/nominations' });
  return a;
}

const COURSE_WORDS: [RegExp, string][] = [
  [/\b(security|privacy|compliance|infosec)\b/, 'lc1'], [/\b(onboarding|new joiner)\b/, 'lc2'],
  [/\bcloud ?atlas\b/, 'lc3'], [/\bcloud ?pilot\b/, 'lc4'], [/\b(ammp|playbook)\b/, 'lc5'],
];

function learning(c: Ctx): Answer {
  if (disabled(c, 'uclms')) return disabledAnswer(c, 'uclms');
  const a = base(['Checking your access', 'Reading UCLMS (courses, progress, scores)', 'Writing the answer']);
  let list = visibleEnrollments(c.s, c.uid);
  const courseId = COURSE_WORDS.find(([re]) => re.test(c.q))?.[1];
  const course = courseId ? courseOf(courseId) : undefined;
  let who = '';
  const people = findPeople(c.q, c.uid);
  const dept = findDept(c.q);
  const loc = findLocation(c.q);
  const myTeam = /\bmy team\b|\bmy team's\b/.test(c.q);
  if (/\bmy\b/.test(c.q) && !myTeam) { list = list.filter((e) => e.personId === c.uid); who = 'Your'; }
  else if (people.length) { list = list.filter((e) => people.some((p) => p.id === e.personId)); who = `${people.map((p) => p.name).join(', ')}'s`; }
  else if (dept) { list = list.filter((e) => personById(e.personId)?.department === dept); who = `The ${dept} team's`; }
  else if (myTeam) { list = list.filter((e) => isUnder(e.personId, c.uid)); who = "Your team's"; }
  else if (loc) { list = list.filter((e) => personById(e.personId)?.location === loc); who = `${loc}'s`; }
  if (course) list = list.filter((e) => e.courseId === course.id);
  const notDone = /(\bnot\b|n't|incomplete|pending|overdue|\byet\b|behind|missing)/.test(c.q);
  if (notDone) list = list.filter((e) => e.status !== 'Completed');
  const certs = /certificate/.test(c.q);
  if (certs) list = list.filter((e) => e.certificate);

  if (!list.length) {
    a.paragraphs.push(notDone && course ? `Everyone you can see has completed **${course.title}**. 🎉` : "I couldn't find any learning records you're allowed to see.");
    if (topLevel(levelsFor(c.s, c.uid, 'uclms')) === 'own') a.paragraphs.push('Your access to UCLMS covers **only your own learning**. Ask your Admin if you need to see others.');
  } else if (certs) {
    a.paragraphs.push(`${who ? `${who} ` : ''}**${list.length} certificate${list.length > 1 ? 's' : ''}** earned in UCLMS.`);
    a.table = { columns: ['Person', 'Course', 'Score', 'Issued', 'Certificate'], rows: list.map((e) => [nameOf(e.personId), courseOf(e.courseId).title, `${e.score}%`, fmtDate(e.completedAt), e.certificate!]) };
  } else {
    const done = list.filter((e) => e.status === 'Completed').length;
    const prog = list.filter((e) => e.status === 'In progress').length;
    const ns = list.filter((e) => e.status === 'Not started').length;
    const subject = `${who ? `${who} ` : ''}${course ? `**${course.title}**` : 'training'}`;
    if (notDone) {
      a.paragraphs.push(`**${list.length} ${list.length === 1 ? 'person has' : 'people have'} not completed** ${course ? `**${course.title}**` : 'their training'} yet: ${prog} in progress, ${ns} not started.`);
    } else {
      a.paragraphs.push(`${subject}: **${list.length} enrolment${list.length > 1 ? 's' : ''}**, **${done} completed** (${Math.round((done / list.length) * 100)}%), ${prog} in progress, ${ns} not started.`);
    }
    if (course?.mandatory && course.dueDate) a.paragraphs.push(`This course is **mandatory** and due on **${fmtDate(course.dueDate)}**.`);
    const sorted = notDone ? [...list].sort((x, y) => x.itemsCompleted / courseOf(x.courseId).items - y.itemsCompleted / courseOf(y.courseId).items) : list;
    a.table = {
      columns: ['Person', 'Course', 'Status', 'Progress', 'Score', notDone ? 'Last activity' : 'Completed / last activity'],
      rows: sorted.slice(0, 15).map((e) => {
        const crs = courseOf(e.courseId);
        return [nameOf(e.personId), crs.title, e.status, `${e.itemsCompleted}/${crs.items} items`, e.score != null ? `${e.score}%` : '—', fmtDate(e.completedAt ?? e.lastActivity)];
      }),
    };
    if (list.length > 15) a.paragraphs.push('Showing the first 15.');
  }
  if (list.length && topLevel(levelsFor(c.s, c.uid, 'uclms')) === 'own' && (dept || myTeam || loc || people.length)) {
    a.paragraphs.push('Note: your access to UCLMS covers **only your own learning**, so only your own records are included.');
  }
  a.sources.push(`UCLMS · ${list.length}`);
  a.scope = scopeLines(c, 'uclms');
  a.actions.push({ label: 'Open Learning explorer', to: '/explore/learning' });
  return a;
}

function digest(c: Ctx): Answer {
  const a = base(['Checking your access', 'Collecting tasks, emails, leave, leads and training', 'Writing your digest']);
  const d = buildDigest(c.s, c.uid);
  a.paragraphs.push(d.headline);
  a.bullets = d.sections.flatMap((sec) => sec.items.map((it) => `**${sec.title}:** ${it}`));
  a.sources.push('Daily digest agent');
  a.actions.push({ label: 'Digest settings', to: '/digest' });
  return a;
}

function help(c: Ctx): Answer {
  const a = base(['Thinking']);
  a.paragraphs.push(`Hi ${c.me.name.split(' ')[0]}! I'm the UnifyCloud Second Brain. I answer from the data your role lets you see. Try:`);
  a.bullets = suggestionsFor(c.s, c.uid);
  return a;
}

/* ---------- entry point ---------- */

export function ask(s: DemoState, uid: string, question: string): Answer {
  const me = personById(uid)!;
  const q = question.toLowerCase().trim();
  const c: Ctx = { s, uid, me, q };
  const location = findLocation(q);
  const country = findCountry(q);
  const people = findPeople(q, uid);

  if (/\b(digest|my day|what do i need|what should i do|on my plate|to-?do)\b/.test(q)) return digest(c);
  if (/\b(lead|leads|nomination|nominations|opportunit|pipeline)/.test(q)) return leads(c);
  if (/\b(leave|leaves|vacation|holiday|time off)\b/.test(q)) return leaves(c);
  if (/\b(training|trainings|trained|course|courses|learning|uclms|lms|certificates?|certification|compliance|onboarding)\b/.test(q)) return learning(c);
  if (/\b(staff|employees|hierarchy|org chart|organi[sz]ation|who reports|team members|my team)\b/.test(q) && !/\b(e-?mail|mail|chat)/.test(q)) return directory(c);
  if ((location || country) && /\b(happening|working|doing|who|activity|status|going on|update)\b/.test(q)) return place(c, location, location ? undefined : country);
  if (/\b(e-?mails?|mails?|inbox)\b/.test(q)) return emails(c);
  if (/\b(chats?|teams|messages?)\b/.test(q)) return chats(c);
  if (people.length && /\b(activity|doing|working|up to|last|latest|busy)\b/.test(q)) return person(c, people[0]);
  if (/\b(tasks?|sprints?|work items?|devops|bugs?)\b/.test(q)) return tasks(c);
  if (/\b(documents?|files?|sharepoint|onedrive|nda|loe|poe)\b/.test(q)) return docs(c);
  if (location || country) return place(c, location, location ? undefined : country);
  if (people.length) return person(c, people[0]);
  return help(c);
}

/** Example questions tailored to the signed-in user's access. */
export function suggestionsFor(s: DemoState, uid: string): string[] {
  const out: string[] = ['What do I need to do today?'];
  const lvl = (id: string) => topLevel(levelsFor(s, uid, id));
  const me = personById(uid)!;
  if (lvl('entra') === 'all') out.push("What's happening in Noida?");
  if (lvl('nomination') !== 'none' && visibleNominations(s, uid).length) out.push('Show leads status', 'Which leads are missing information?');
  if (lvl('entra') !== 'own') out.push('Give me all staff details');
  if (lvl('leave') === 'team') out.push("Show my team's leaves");
  if (lvl('leave') === 'all') out.push('Show pending leave requests');
  if (lvl('uclms') === 'all') out.push("Who hasn't completed the security training?");
  if (lvl('uclms') === 'team') out.push("Show my team's training progress");
  if (lvl('email') === 'all') out.push('Show emails with Contoso');
  if (lvl('entra') === 'all') out.push('What is Riya Saxena doing?');
  if (me.id === 'riya') out.push('Show me all emails exchanged with Nikhil Bansal', 'Show emails with the marketing team');
  if (lvl('leave') === 'own') out.push('Show my leaves');
  if (lvl('uclms') === 'own') out.push('Show my training progress');
  if (lvl('devops') !== 'none') out.push('What are my tasks?');
  if (lvl('entra') === 'own') out.push('Give me all staff details');
  return Array.from(new Set(out)).slice(0, 6);
}
