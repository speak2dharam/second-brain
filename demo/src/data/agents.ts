import type { Agent, AgentRun, DigestPolicy, DigestSettings, Trigger, Autonomy } from './types';

export const TRIGGER_LABEL: Record<Trigger, string> = {
  'new-email': 'On new email',
  'after-meeting': 'After each meeting',
  hourly: 'Every hour',
  daily: 'Daily',
  weekly: 'Weekly (Monday)',
  manual: 'Manual only',
};

export const AUTONOMY_LABEL: Record<Autonomy, string> = {
  read: 'Read & report only',
  suggest: 'Suggest, a person approves',
  auto: 'Act automatically above confidence',
};

/** Minutes of manual work one output saves, used for the "time saved" estimate. */
export const MINUTES_SAVED: Record<string, number> = { 'a-nom': 3, 'a-digest': 5, 'a-meet': 15, 'a-lead': 5, 'a-train': 2 };

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'a-nom', name: 'Nomination Tracker filler', builtIn: true, enabled: true,
    purpose: 'Reads emails, chats and documents about each lead and fills the missing Nomination Tracker fields, with the source email for every value.',
    trigger: 'new-email', time: '', sources: ['email', 'teams', 'sharepoint', 'nomination'], writesTo: 'Nomination Tracker',
    autonomy: 'suggest', autoThreshold: 95,
    instructions: 'Only fill a field when the email states it clearly. Dates in YYYY-MM-DD. Always link the source email. Never overwrite a value a person entered.',
    notify: ['sophie'], monthlyBudget: 60,
  },
  {
    id: 'a-digest', name: 'Daily digest', builtIn: true, enabled: true,
    purpose: "Sends each person a short summary of their day at the time they choose, built only from data they're allowed to see.",
    trigger: 'daily', time: 'per user', sources: ['devops', 'email', 'teams', 'leave', 'uclms', 'nomination', 'entra'], writesTo: 'Email / Teams / in-app',
    autonomy: 'auto', autoThreshold: 0,
    instructions: 'Lead with what needs action today. Keep it under 10 bullet points. No personal data about people the reader cannot see.',
    notify: [], monthlyBudget: 40,
  },
  {
    id: 'a-meet', name: 'Meeting notes', builtIn: true, enabled: true,
    purpose: 'After each Teams meeting, turns the transcript into a summary, decisions and action items, and drafts them for the organiser to send.',
    trigger: 'after-meeting', time: '', sources: ['teams'], writesTo: 'Teams (draft to organiser)',
    autonomy: 'suggest', autoThreshold: 90,
    instructions: 'Owner and due date for every action item. Flag customer commitments.',
    notify: [], monthlyBudget: 50,
  },
  {
    id: 'a-lead', name: 'Lead watcher', builtIn: true, enabled: true,
    purpose: 'Every morning checks all leads and flags the ones that are stuck: no activity for 7 days, or missing LOE / POE / NDA.',
    trigger: 'daily', time: '09:00', sources: ['nomination', 'email', 'partner'], writesTo: null,
    autonomy: 'read', autoThreshold: 0,
    instructions: 'A lead is stuck after 7 days without email or tracker activity. New leads need an owner within 2 days.',
    notify: ['sophie', 'james'], monthlyBudget: 15,
  },
  {
    id: 'a-train', name: 'Training reminder', builtIn: true, enabled: false,
    purpose: 'Reminds people whose mandatory UCLMS courses are due within 30 days, and tells their Team Lead who is behind.',
    trigger: 'weekly', time: '10:00', sources: ['uclms', 'entra'], writesTo: 'Email',
    autonomy: 'suggest', autoThreshold: 0,
    instructions: 'Friendly tone. Include the course link and how many items are left.',
    notify: ['rahul'], monthlyBudget: 10,
  },
];

/* Deterministic mock history for the last 7 days (4–10 Oct 2026). */
function rng(seed: number) {
  let x = seed;
  return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
}

function buildRuns(): AgentRun[] {
  const r = rng(42);
  const runs: AgentRun[] = [];
  let id = 0;
  const add = (agentId: string, at: string, p: Partial<AgentRun>) =>
    runs.push({ id: `r${++id}`, agentId, at, status: 'Success', processed: 0, produced: 0, approved: 0, rejected: 0, cost: 0, note: '', ...p });
  const days = ['04', '05', '06', '07', '08', '09', '10'];
  const weekdays = ['05', '06', '07', '08', '09'];

  for (const d of days) {
    for (const h of ['09', '12', '15', '18']) {
      if (d === '10' && h !== '09') continue;
      const processed = 5 + Math.floor(r() * 10);
      const produced = Math.floor(r() * 4);
      const rejected = produced > 1 && r() > 0.7 ? 1 : 0;
      const throttled = d === '07' && h === '15';
      add('a-nom', `2026-10-${d}T${h}:00`, {
        processed, produced, approved: produced - rejected, rejected, cost: +(0.08 + processed * 0.012).toFixed(2),
        status: throttled ? 'Partial' : 'Success',
        note: throttled ? 'Microsoft Graph throttling: 3 emails retried on the next run' : produced ? `Found ${produced} field value${produced > 1 ? 's' : ''} in ${processed} emails` : `Read ${processed} emails, nothing new`,
      });
    }
  }
  for (const d of weekdays) add('a-digest', `2026-10-${d}T08:30`, { processed: 22, produced: 19, cost: 0.41, note: 'Sent 19 digests (email 12 · Teams 4 · in-app 3)' });
  for (const d of weekdays) {
    add('a-meet', `2026-10-${d}T11:05`, { processed: 1, produced: 1, approved: 1, cost: 0.14, note: 'Summarised "Delivery stand-up": 5 action items' });
    if (d === '07') add('a-meet', `2026-10-${d}T16:40`, { status: 'Failed', processed: 1, cost: 0.01, note: 'No transcript: recording was off for "Tailspin prep"' });
    else add('a-meet', `2026-10-${d}T16:40`, { processed: 1, produced: 1, approved: r() > 0.2 ? 1 : 0, rejected: 0, cost: 0.12, note: 'Summarised a customer call: 3 action items' });
  }
  for (const d of days) {
    const produced = 1 + Math.floor(r() * 3);
    add('a-lead', `2026-10-${d}T09:00`, { processed: 8, produced, cost: 0.05, note: `Flagged ${produced} stuck lead${produced > 1 ? 's' : ''}` });
  }
  add('a-train', '2026-09-28T10:00', { processed: 22, produced: 14, approved: 14, cost: 0.06, note: 'Drafted 14 reminders, approved and sent by Rahul' });
  return runs.sort((a, b) => b.at.localeCompare(a.at));
}

export const INITIAL_RUNS: AgentRun[] = buildRuns();

/* ---------- Daily digest ---------- */

export const INITIAL_DIGEST_POLICY: DigestPolicy = { defaultEnabled: true, defaultTime: '08:30', allowedChannels: ['email', 'teams', 'app'] };

export const DIGEST_SECTIONS: { id: string; label: string }[] = [
  { id: 'tasks', label: 'My open tasks (DevOps)' },
  { id: 'emails', label: 'Emails that may need a reply' },
  { id: 'approvals', label: 'Leave: approvals and my leave' },
  { id: 'team', label: 'My team: blocked work and upcoming leave' },
  { id: 'leads', label: 'Leads needing action' },
  { id: 'training', label: 'Training due (UCLMS)' },
  { id: 'ai', label: 'AI suggestions waiting for me' },
];

export const CHANNEL_LABEL = { email: 'Email (Outlook)', teams: 'Teams message', app: 'In the app' } as const;

export const TIME_ZONE: Record<string, string> = {
  Noida: 'India Standard Time (UTC+5:30)',
  Sydney: 'Australian Eastern Daylight Time (UTC+11)',
  Tokyo: 'Japan Standard Time (UTC+9)',
  London: 'British Summer Time (UTC+1)',
  'New York': 'Eastern Daylight Time (UTC−4)',
};

export function defaultDigest(policy: DigestPolicy): DigestSettings {
  return {
    enabled: policy.defaultEnabled,
    time: policy.defaultTime,
    days: 'weekdays',
    channels: (['email', 'app'] as const).filter((c) => policy.allowedChannels.includes(c)),
    sections: DIGEST_SECTIONS.map((x) => x.id),
  };
}
