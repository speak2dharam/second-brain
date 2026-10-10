/**
 * Builds one person's daily digest. Like the assistant, it only uses data that already
 * passed the permission engine, so a digest never shows more than the person may see.
 */
import { defaultDigest } from '../data/agents';
import { courseOf } from '../data/learning';
import { NOMINATION_FIELDS } from '../data/nominations';
import { isUnder, nameOf, PEOPLE } from '../data/people';
import type { DemoState, DigestSettings } from '../data/types';
import {
  canUse, levelsFor, topLevel, visibleEmails, visibleEnrollments, visibleLeaves, visibleNominations, visiblePeople, visibleTasks,
} from './access';
import { fmtDate } from './format';

export interface DigestSection { id: string; title: string; items: string[]; to?: string }
export interface Digest { headline: string; sections: DigestSection[] }

export const digestSettingsFor = (s: DemoState, uid: string): DigestSettings => s.digest[uid] ?? defaultDigest(s.digestPolicy);

/** Which sections make sense for this person's access (others are hidden in settings). */
export function availableSections(s: DemoState, uid: string): string[] {
  const out: string[] = [];
  if (canUse(s, uid, 'devops')) out.push('tasks');
  if (canUse(s, uid, 'email')) out.push('emails');
  if (canUse(s, uid, 'leave')) out.push('approvals');
  if (topLevel(levelsFor(s, uid, 'entra')) !== 'own' && canUse(s, uid, 'entra')) out.push('team');
  if (visibleNominations(s, uid).length) out.push('leads', 'ai');
  if (canUse(s, uid, 'uclms')) out.push('training');
  return out;
}

export function buildDigest(s: DemoState, uid: string, only?: string[]): Digest {
  const want = (id: string) => availableSections(s, uid).includes(id) && (!only || only.includes(id));
  const sections: DigestSection[] = [];
  const first = nameOf(uid).split(' ')[0];

  if (want('tasks')) {
    const mine = visibleTasks(s, uid).filter((w) => w.assignedTo === uid && !['Done', 'Resolved'].includes(w.state));
    sections.push({ id: 'tasks', title: 'Your open tasks', to: '/explore/devops', items: mine.map((w) => `#${w.id} ${w.title} (${w.state})`) });
  }

  if (want('emails')) {
    const inbox = visibleEmails(s, uid).filter((e) => e.to.includes(uid) && e.from !== uid && e.date >= '2026-10-07');
    const unanswered = inbox.filter((e) => !visibleEmails(s, uid).some((r) => r.from === uid && r.to.includes(e.from) && r.date > e.date));
    sections.push({ id: 'emails', title: 'Emails that may need a reply', to: '/explore/email', items: unanswered.slice(0, 5).map((e) => `${nameOf(e.from)}: "${e.subject}" (${fmtDate(e.date)})`) });
  }

  if (want('approvals')) {
    const leaves = visibleLeaves(s, uid);
    const toApprove = leaves.filter((l) => l.personId !== uid && l.status === 'Pending');
    const mine = leaves.filter((l) => l.personId === uid && l.to >= '2026-10-10');
    sections.push({
      id: 'approvals', title: 'Leave', to: '/explore/leave',
      items: [
        ...toApprove.map((l) => `Approve: ${nameOf(l.personId)}, ${l.type} ${fmtDate(l.from)}–${fmtDate(l.to)} (${l.days} day${l.days > 1 ? 's' : ''})`),
        ...mine.map((l) => `Your ${l.type.toLowerCase()} leave ${fmtDate(l.from)}–${fmtDate(l.to)} is ${l.status.toLowerCase()}`),
      ],
    });
  }

  if (want('team')) {
    const level = topLevel(levelsFor(s, uid, 'entra'));
    const people = visiblePeople(s, uid).filter((p) => p.id !== uid && (level === 'team' ? isUnder(p.id, uid) : true));
    const ids = new Set(people.map((p) => p.id));
    const blocked = visibleTasks(s, uid).filter((w) => ids.has(w.assignedTo) && w.state === 'Blocked');
    const away = visibleLeaves(s, uid).filter((l) => ids.has(l.personId) && l.status === 'Approved' && l.from >= '2026-10-10' && l.from <= '2026-10-17');
    sections.push({
      id: 'team', title: { team: 'Your team', department: 'Your department', location: 'Your location', all: 'Across the company' }[level as 'team'] ?? 'Your team', to: '/people',
      items: [
        ...blocked.map((w) => `Blocked: ${nameOf(w.assignedTo)}, ${w.title}`),
        ...away.map((l) => `Away: ${nameOf(l.personId)} ${fmtDate(l.from)}–${fmtDate(l.to)}`),
      ],
    });
  }

  if (want('leads')) {
    const leads = visibleNominations(s, uid);
    const total = NOMINATION_FIELDS.length;
    const items = [
      ...leads.filter((n) => n.stage === 'New').map((n) => `New lead: ${n.accountName} (${n.country}). Book the intro call`),
      ...leads.filter((n) => n.stage !== 'New' && n.stage !== 'Completed' && NOMINATION_FIELDS.filter((f) => n.fields[f.key]).length < total / 3)
        .map((n) => `${n.accountName}: only ${NOMINATION_FIELDS.filter((f) => n.fields[f.key]).length}/${total} fields filled`),
    ];
    sections.push({ id: 'leads', title: 'Leads needing action', to: '/leads', items });
  }

  if (want('ai')) {
    const ids = new Set(visibleNominations(s, uid).map((n) => n.id));
    const pending = s.suggestions.filter((x) => x.status === 'pending' && ids.has(x.nominationId));
    const accounts = Array.from(new Set(pending.map((x) => s.nominations.find((n) => n.id === x.nominationId)?.accountName)));
    sections.push({ id: 'ai', title: 'AI suggestions waiting for you', to: '/nominations', items: pending.length ? [`${pending.length} field updates to approve (${accounts.join(', ')})`] : [] });
  }

  if (want('training')) {
    const ens = visibleEnrollments(s, uid);
    const mine = ens.filter((e) => e.personId === uid && e.status !== 'Completed')
      .sort((a, b) => Number(!!courseOf(b.courseId).mandatory) - Number(!!courseOf(a.courseId).mandatory));
    const level = topLevel(levelsFor(s, uid, 'uclms'));
    const others = level === 'own' ? [] : ens.filter((e) => e.personId !== uid && courseOf(e.courseId).mandatory && e.status !== 'Completed'
      && (level !== 'team' || isUnder(e.personId, uid)));
    sections.push({
      id: 'training', title: 'Training', to: '/explore/learning',
      items: [
        ...mine.map((e) => {
          const c = courseOf(e.courseId);
          return `${c.mandatory ? 'Mandatory: ' : ''}${c.title}: ${e.itemsCompleted}/${c.items} items${c.dueDate ? `, due ${fmtDate(c.dueDate)}` : ''}`;
        }),
        ...(others.length ? [`${others.length} ${level === 'team' ? 'people in your team' : 'people'} haven't finished mandatory training (${others.slice(0, 4).map((e) => nameOf(e.personId).split(' ')[0]).join(', ')}${others.length > 4 ? ', …' : ''})`] : []),
      ],
    });
  }

  const withItems = sections.filter((x) => x.items.length);
  const count = withItems.reduce((n, x) => n + x.items.length, 0);
  const SHORT: Record<string, string> = { tasks: 'your tasks', emails: 'emails to answer', approvals: 'leave', team: 'team updates', leads: 'leads', ai: 'AI suggestions', training: 'training' };
  const headline = count
    ? `Good morning ${first}. ${count} thing${count > 1 ? 's' : ''} to look at today: ${withItems.slice(0, 3).map((x) => SHORT[x.id]).join(', ')}${withItems.length > 3 ? ' and more' : ''}.`
    : `Good morning ${first}. Nothing needs your attention today. 🎉`;
  return { headline, sections: withItems };
}

/** How many people would currently receive a digest (for the agent's "Run now"). */
export const digestRecipients = (s: DemoState) => PEOPLE.filter((p) => digestSettingsFor(s, p.id).enabled).length;
