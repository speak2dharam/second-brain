/**
 * The permission engine. Two layers (see docs/access-control.md):
 *  1. Ingestion: excluded people's data is never read (per data source).
 *  2. Visibility: a user sees data only if one of their roles grants it.
 * Everything the UI and the AI assistant show goes through canSee().
 */
import { CHATS, DOCS, EMAILS, LEAVES, WORK_ITEMS } from '../data/content';
import { ENROLLMENTS } from '../data/learning';
import { isUnder, PEOPLE, personById } from '../data/people';
import { LEVEL_LABEL, LEVEL_RANK, type DataSource, type DemoState, type Level, type Person, type Role } from '../data/types';

export const rolesOf = (s: DemoState, uid: string): Role[] => s.roles.filter((r) => r.everyone || r.members.includes(uid));
export const isAdmin = (s: DemoState, uid: string) => rolesOf(s, uid).some((r) => r.isAdmin);
export const sourceById = (s: DemoState, id: string) => s.sources.find((x) => x.id === id);

export function levelsFor(s: DemoState, uid: string, sourceId: string): Level[] {
  const src = sourceById(s, sourceId);
  if (!src || !src.enabled) return [];
  return rolesOf(s, uid)
    .map((r) => (r.isAdmin ? 'all' : r.access[sourceId] ?? 'none'))
    .filter((l): l is Level => l !== 'none');
}

export function topLevel(levels: Level[]): Level {
  return levels.reduce<Level>((a, b) => (LEVEL_RANK.indexOf(b) > LEVEL_RANK.indexOf(a) ? b : a), 'none');
}

export const canUse = (s: DemoState, uid: string, sourceId: string) => levelsFor(s, uid, sourceId).length > 0;

export function accessLabel(s: DemoState, uid: string, sourceId: string): string {
  const src = sourceById(s, sourceId);
  if (!src) return 'Not connected';
  if (!src.enabled) return 'Data source disabled';
  const top = topLevel(levelsFor(s, uid, sourceId));
  if (top === 'none') return 'No access';
  const label = src.access.find((a) => a.level === top)?.label ?? LEVEL_LABEL[top];
  return isAdmin(s, uid) ? `${label} (Admin)` : label;
}

function matches(level: Level, viewer: Person, owner: Person): boolean {
  switch (level) {
    case 'all': return true;
    case 'location': return owner.location === viewer.location;
    case 'department': return owner.department === viewer.department;
    case 'team': return owner.id === viewer.id || isUnder(owner.id, viewer.id);
    case 'own': return owner.id === viewer.id;
    default: return false;
  }
}

/** Layer 1: may the app read this person's data in this source at all? */
export function isReadable(src: DataSource, personId: string): boolean {
  if (!src.personal) return true;
  const p = personById(personId);
  if (!p) return true;
  const ex = src.exclusions;
  return !ex.people.includes(p.id) && !ex.countries.includes(p.country) && !ex.jobTitles.includes(p.jobTitle);
}

export const excludedPeople = (src: DataSource): Person[] => PEOPLE.filter((p) => !isReadable(src, p.id));

/** Layer 1 + 2: can this viewer see an item owned by these people? */
export function canSee(s: DemoState, uid: string, sourceId: string, ownerIds: string[]): boolean {
  const src = sourceById(s, sourceId);
  const viewer = personById(uid);
  if (!src || !src.enabled || !viewer) return false;
  const owners = ownerIds.map(personById).filter((p): p is Person => !!p && isReadable(src, p.id));
  if (!owners.length) return false;
  const levels = levelsFor(s, uid, sourceId);
  return owners.some((o) => levels.some((l) => matches(l, viewer, o)));
}

const internal = (ids: string[]) => ids.filter((id) => !id.startsWith('ext:'));
const byDateDesc = <T extends { date?: string; updated?: string; modified?: string }>(a: T, b: T) =>
  (b.date ?? b.updated ?? b.modified ?? '').localeCompare(a.date ?? a.updated ?? a.modified ?? '');

export const emailParticipants = (e: { from: string; to: string[] }) => [e.from, ...e.to];

export const visibleEmails = (s: DemoState, uid: string) =>
  EMAILS.filter((e) => canSee(s, uid, 'email', internal(emailParticipants(e)))).sort(byDateDesc);
export const visibleChats = (s: DemoState, uid: string) =>
  CHATS.filter((c) => canSee(s, uid, 'teams', c.participants)).sort(byDateDesc);
export const visibleTasks = (s: DemoState, uid: string) =>
  WORK_ITEMS.filter((w) => canSee(s, uid, 'devops', [w.assignedTo])).sort(byDateDesc);
export const visibleLeaves = (s: DemoState, uid: string) =>
  LEAVES.filter((l) => canSee(s, uid, 'leave', [l.personId])).sort((a, b) => a.from.localeCompare(b.from));
export const visibleDocs = (s: DemoState, uid: string) =>
  DOCS.filter((d) => canSee(s, uid, d.source, [d.ownerId])).sort(byDateDesc);
export const visiblePeople = (s: DemoState, uid: string) => PEOPLE.filter((p) => canSee(s, uid, 'entra', [p.id]));
export const visibleEnrollments = (s: DemoState, uid: string) =>
  ENROLLMENTS.filter((e) => canSee(s, uid, 'uclms', [e.personId])).sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
export const visibleNominations = (s: DemoState, uid: string) =>
  s.nominations.filter((n) => canSee(s, uid, 'nomination', [n.ownerId]));

/** Latest activity of one person, limited to what the viewer may see. */
export function lastActivity(s: DemoState, uid: string, personId: string) {
  const task = visibleTasks(s, uid).find((w) => w.assignedTo === personId);
  const email = visibleEmails(s, uid).find((e) => emailParticipants(e).includes(personId));
  const chat = visibleChats(s, uid).find((c) => c.from === personId);
  const learning = visibleEnrollments(s, uid).filter((e) => e.personId === personId);
  return { task, email, chat, learning };
}
