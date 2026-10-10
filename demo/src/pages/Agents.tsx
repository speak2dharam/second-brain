import {
  Badge, Button, Checkbox, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Dropdown, Field, Input,
  MessageBar, MessageBarBody, Option, ProgressBar, Radio, RadioGroup, Slider, Spinner, Switch, Tab, TabList, Table, TableBody,
  TableCell, TableHeader, TableHeaderCell, TableRow, Textarea,
} from '@fluentui/react-components';
import { Add20Regular, Delete20Regular, Dismiss20Regular, Edit20Regular, Play20Regular } from '@fluentui/react-icons';
import { useState, type ReactNode } from 'react';
import { CheckGroup, Empty, PageHeader, StatusBadge, Tile } from '../components/ui';
import { AUTONOMY_LABEL, CHANNEL_LABEL, MINUTES_SAVED, TRIGGER_LABEL } from '../data/agents';
import { ENROLLMENTS, courseOf } from '../data/learning';
import { NOMINATION_FIELDS } from '../data/nominations';
import { nameOf, PEOPLE } from '../data/people';
import type { Agent, AgentRun, Autonomy, DemoState, DigestChannel, Trigger } from '../data/types';
import { excludedPeople, isReadable, sourceById } from '../lib/access';
import { digestRecipients } from '../lib/digest';
import { fmtDate, nowIso } from '../lib/format';
import { useDemo } from '../lib/store';
import { TIMES } from './Digest';

const WEEK_START = '2026-10-04';
const WRITE_TARGETS = ['Nomination Tracker', 'Email (send)', 'Teams (post)'];

interface Stats { runs: number; processed: number; produced: number; approved: number; rejected: number; pending: number; errors: number; cost: number; last?: AgentRun; hours: number }

function statsFor(s: DemoState, agent: Agent): Stats {
  const all = s.agentRuns.filter((r) => r.agentId === agent.id);
  const week = all.filter((r) => r.at >= WEEK_START);
  const sum = (k: 'processed' | 'produced' | 'approved' | 'rejected' | 'cost') => week.reduce((n, r) => n + r[k], 0);
  let approved = sum('approved');
  let rejected = sum('rejected');
  let pending = 0;
  if (agent.id === 'a-nom') {
    approved += s.suggestions.filter((x) => x.status === 'approved').length;
    rejected += s.suggestions.filter((x) => x.status === 'rejected').length;
    pending = s.suggestions.filter((x) => x.status === 'pending').length;
  }
  const produced = sum('produced');
  return {
    runs: week.length, processed: sum('processed'), produced, approved, rejected, pending,
    errors: week.filter((r) => r.status !== 'Success').length, cost: sum('cost'), last: all[0],
    hours: (produced * (MINUTES_SAVED[agent.id] ?? 5)) / 60,
  };
}

const accuracy = (st: Stats) => (st.approved + st.rejected ? st.approved / (st.approved + st.rejected) : null);
const sourceNames = (s: DemoState, ids: string[]) => ids.map((id) => sourceById(s, id)?.name ?? id).join(', ') || '—';

/** Simulates one run of an agent against the current demo state. */
function simulateRun(s: DemoState, agent: Agent): { state: DemoState; run: AgentRun } {
  const base: AgentRun = { id: `r${Date.now()}`, agentId: agent.id, at: nowIso(), status: 'Success', processed: 0, produced: 0, approved: 0, rejected: 0, cost: 0, note: '' };
  const skipped = new Set(agent.sources.flatMap((id) => { const src = sourceById(s, id); return src ? excludedPeople(src).map((p) => p.id) : []; })).size;
  const exclNote = skipped ? ` · exclusions applied (${skipped} people never read)` : '';
  let next = s;
  let run = base;
  switch (agent.id) {
    case 'a-nom': {
      const hidden = s.suggestions.filter((x) => x.status === 'hidden');
      const emails = new Set(hidden.map((x) => x.emailId)).size;
      next = { ...s, suggestions: s.suggestions.map((x) => (x.status === 'hidden' ? { ...x, status: 'pending' } : x)) };
      run = { ...base, processed: Math.max(emails, 6), produced: hidden.length, cost: 0.21,
        note: hidden.length ? `Found ${hidden.length} field values in ${emails} emails across ${new Set(hidden.map((x) => x.nominationId)).size} leads, waiting for approval` : 'Read new emails, nothing new to fill' };
      break;
    }
    case 'a-digest': {
      const n = digestRecipients(s);
      run = { ...base, processed: PEOPLE.length, produced: n, cost: +(n * 0.021).toFixed(2), note: `Sent ${n} digests to people who have it switched on` };
      break;
    }
    case 'a-meet':
      run = { ...base, processed: 1, produced: 1, cost: 0.13, note: 'Summarised "Weekly delivery stand-up": 5 action items, drafted to Vikram Singh' };
      break;
    case 'a-lead': {
      const stuck = s.nominations.filter((n) => n.stage !== 'Completed' && (n.stage === 'New' || NOMINATION_FIELDS.filter((f) => n.fields[f.key]).length < 7));
      run = { ...base, processed: s.nominations.length, produced: stuck.length, cost: 0.05, note: `Flagged ${stuck.length} leads: ${stuck.map((n) => n.accountName).join(', ')}` };
      break;
    }
    case 'a-train': {
      const src = sourceById(s, 'uclms');
      const due = ENROLLMENTS.filter((e) => courseOf(e.courseId).mandatory && e.status !== 'Completed' && (!src || isReadable(src, e.personId)));
      run = { ...base, processed: ENROLLMENTS.length, produced: due.length, cost: 0.06,
        note: agent.autonomy === 'auto' ? `Sent ${due.length} reminders for mandatory training` : `Drafted ${due.length} reminders for approval` };
      break;
    }
    default: {
      const produced = 1 + Math.floor(Math.random() * 4);
      run = { ...base, processed: 10 + Math.floor(Math.random() * 30), produced, cost: 0.09,
        note: `${agent.writesTo ? `${produced} ${agent.autonomy === 'auto' ? 'actions taken' : 'suggestions'}` : `${produced} findings`} from ${sourceNames(s, agent.sources)}` };
    }
  }
  run.note += exclNote;
  return { state: { ...next, agentRuns: [run, ...next.agentRuns] }, run };
}

export default function Agents() {
  const { state, update } = useDemo();
  const [tab, setTab] = useState('agents');
  const [editing, setEditing] = useState<{ agent: Agent; isNew: boolean } | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [logAgent, setLogAgent] = useState('');

  const patch = (id: string, p: Partial<Agent>) => update((s) => ({ ...s, agents: s.agents.map((a) => (a.id === id ? { ...a, ...p } : a)) }));
  const runNow = (agent: Agent) => {
    setRunning(agent.id);
    setTimeout(() => { update((s) => simulateRun(s, agent).state); setRunning(null); }, 1500);
  };
  const blank = (): Agent => ({
    id: `custom-${Date.now()}`, name: '', purpose: '', builtIn: false, enabled: true, trigger: 'daily', time: '09:00', sources: [],
    writesTo: null, autonomy: 'suggest', autoThreshold: 90, instructions: '', notify: [], monthlyBudget: 20,
  });

  const all = state.agents.map((a) => ({ a, st: statsFor(state, a) }));
  const tot = all.reduce((t, { st }) => ({ runs: t.runs + st.runs, processed: t.processed + st.processed, produced: t.produced + st.produced,
    approved: t.approved + st.approved, rejected: t.rejected + st.rejected, cost: t.cost + st.cost, hours: t.hours + st.hours, errors: t.errors + st.errors }),
  { runs: 0, processed: 0, produced: 0, approved: 0, rejected: 0, cost: 0, hours: 0, errors: 0 });
  const log = state.agentRuns.filter((r) => !logAgent || r.agentId === logAgent);
  const agentName = (id: string) => state.agents.find((a) => a.id === id)?.name ?? 'Deleted agent';

  return (
    <>
      <PageHeader
        title="AI agents"
        subtitle="Background AI that extracts data, fills records, sends digests and watches for problems. Configure what each agent may read and do."
        actions={<Button appearance="primary" icon={<Add20Regular />} onClick={() => setEditing({ agent: blank(), isNew: true })}>Create agent</Button>}
      />
      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(String(d.value))} style={{ marginBottom: 16 }}>
        <Tab value="agents">Agents ({state.agents.length})</Tab>
        <Tab value="reports">Reports</Tab>
        <Tab value="log">Run log</Tab>
      </TabList>

      {tab === 'agents' && (
        <div className="stack">
          <MessageBar intent="info" layout="multiline">
            <MessageBarBody>
              Agents run under the app's own service identity. <b>Exclusions always apply</b>: an agent never reads excluded people's data. What people see of an agent's output still follows their own role.
            </MessageBarBody>
          </MessageBar>
          {all.map(({ a, st }) => {
            const acc = accuracy(st);
            return (
              <div key={a.id} className={`panel agent-card ${a.enabled ? '' : 'disabled'}`}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div className="row">
                    <b style={{ fontSize: 16 }}>{a.name}</b>
                    <Badge appearance="tint" color={a.builtIn ? 'informative' : 'brand'}>{a.builtIn ? 'Pre-built' : 'Custom'}</Badge>
                    <Badge appearance="outline">
                      {a.autonomy === 'auto' ? (a.autoThreshold ? `Acts automatically at ≥ ${a.autoThreshold}% confidence` : 'Acts automatically') : AUTONOMY_LABEL[a.autonomy]}
                    </Badge>
                  </div>
                  <div className="muted small" style={{ margin: '4px 0 8px' }}>{a.purpose}</div>
                  <div className="agent-meta small">
                    <span><span className="muted">When:</span> {TRIGGER_LABEL[a.trigger]}{a.time && a.trigger !== 'manual' ? ` · ${a.time}` : ''}</span>
                    <span><span className="muted">Reads:</span> {sourceNames(state, a.sources)}</span>
                    <span><span className="muted">Writes to:</span> {a.writesTo ?? 'Nothing (report only)'}</span>
                    {a.notify.length > 0 && <span><span className="muted">Notifies:</span> {a.notify.map(nameOf).join(', ')}</span>}
                  </div>
                  <div className="row small" style={{ marginTop: 8 }}>
                    {st.last ? <><StatusBadge status={st.last.status} /><span className="muted">Last run {fmtDate(st.last.at)}:</span> <span>{st.last.note}</span></> : <span className="muted">Never run</span>}
                  </div>
                  <div className="row small muted" style={{ marginTop: 4 }}>
                    Last 7 days: {st.runs} runs · {st.produced} outputs{acc != null && ` · ${Math.round(acc * 100)}% approved`}{st.pending ? ` · ${st.pending} waiting for approval` : ''} · ${st.cost.toFixed(2)} AI cost
                  </div>
                </div>
                <div className="source-actions">
                  <Switch checked={a.enabled} label={a.enabled ? 'On' : 'Off'} onChange={(_, d) => patch(a.id, { enabled: d.checked })} />
                  <div className="row">
                    <Button icon={running === a.id ? <Spinner size="tiny" /> : <Play20Regular />} disabled={!a.enabled || running !== null} onClick={() => runNow(a)}>
                      {running === a.id ? 'Running…' : 'Run now'}
                    </Button>
                    <Button icon={<Edit20Regular />} onClick={() => setEditing({ agent: structuredClone(a), isNew: false })}>Configure</Button>
                    {!a.builtIn && <Button icon={<Delete20Regular />} aria-label="Delete agent" onClick={() => update((s) => ({ ...s, agents: s.agents.filter((x) => x.id !== a.id) }))} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'reports' && (
        <>
          <div className="tiles">
            <Tile label="Agent runs (7 days)" value={tot.runs} hint={tot.errors ? `${tot.errors} with errors or warnings` : 'No errors'} />
            <Tile label="Items read" value={tot.processed} hint="Emails, transcripts, records" />
            <Tile label="Outputs" value={tot.produced} hint="Suggestions, digests, alerts, notes" />
            <Tile label="Approval rate" value={tot.approved + tot.rejected ? `${Math.round((tot.approved / (tot.approved + tot.rejected)) * 100)}%` : '—'} hint={`${tot.approved} approved · ${tot.rejected} rejected`} />
            <Tile label="Time saved (estimate)" value={`${tot.hours.toFixed(1)} h`} hint="Outputs × typical manual minutes" />
            <Tile label="AI cost (7 days)" value={`$${tot.cost.toFixed(2)}`} />
          </div>
          <ReportTable rows={all.map(({ a, st }) => {
            const acc = accuracy(st);
            return [
              <span key="n"><b>{a.name}</b><div className="small muted">{a.builtIn ? 'Pre-built' : 'Custom'} · {a.enabled ? 'On' : 'Off'}</div></span>,
              String(st.runs), String(st.processed), String(st.produced),
              acc == null ? <span key="a" className="muted small">n/a (no approvals)</span> : (
                <div key="a" style={{ minWidth: 130 }}>
                  <ProgressBar value={acc} thickness="large" color={acc >= 0.85 ? 'success' : acc >= 0.6 ? 'warning' : 'error'} />
                  <span className="small">{Math.round(acc * 100)}% · {st.approved} ✓ / {st.rejected} ✗{st.pending ? ` · ${st.pending} waiting` : ''}</span>
                </div>
              ),
              st.errors ? <Badge key="e" appearance="tint" color="warning">{st.errors}</Badge> : '0',
              `${st.hours.toFixed(1)} h`,
              `$${st.cost.toFixed(2)} / $${a.monthlyBudget}`,
              st.last ? <span key="l">{fmtDate(st.last.at)} <StatusBadge status={st.last.status} /></span> : '—',
            ];
          })} />
          <p className="muted small">
            <b>Approval rate</b> = suggestions people approved ÷ (approved + rejected). A falling rate means the agent needs clearer instructions or a higher confidence threshold.
            Monthly AI cost is shown against each agent's budget.
          </p>
        </>
      )}

      {tab === 'log' && (
        <>
          <div className="row" style={{ marginBottom: 12 }}>
            <Dropdown aria-label="Agent" value={logAgent ? agentName(logAgent) : 'All agents'} selectedOptions={[logAgent]} onOptionSelect={(_, d) => setLogAgent(d.optionValue ?? '')} style={{ minWidth: 240 }}>
              <Option value="" text="All agents">All agents</Option>
              {state.agents.map((a) => <Option key={a.id} value={a.id} text={a.name}>{a.name}</Option>)}
            </Dropdown>
            <span className="muted small">{log.length} runs</span>
          </div>
          {!log.length ? <Empty>No runs yet.</Empty> : (
            <div className="panel table-wrap">
              <Table size="small">
                <TableHeader><TableRow>{['When', 'Agent', 'Status', 'Read', 'Outputs', 'What happened', 'Cost'].map((h) => <TableHeaderCell key={h}><b>{h}</b></TableHeaderCell>)}</TableRow></TableHeader>
                <TableBody>
                  {log.slice(0, 60).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{fmtDate(r.at)}</TableCell>
                      <TableCell>{agentName(r.agentId)}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell>{r.processed}</TableCell>
                      <TableCell>{r.produced}</TableCell>
                      <TableCell>{r.note}</TableCell>
                      <TableCell>${r.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {editing && (
        <AgentEditor
          agent={editing.agent}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={(a, policy) => {
            update((s) => ({
              ...s,
              agents: editing.isNew ? [...s.agents, a] : s.agents.map((x) => (x.id === a.id ? a : x)),
              digestPolicy: policy ?? s.digestPolicy,
            }));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function ReportTable({ rows }: { rows: ReactNode[][] }) {
  return (
    <div className="panel table-wrap">
      <Table>
        <TableHeader>
          <TableRow>{['Agent', 'Runs', 'Read', 'Outputs', 'Approved (accuracy)', 'Errors', 'Time saved', 'AI cost / budget', 'Last run'].map((h) => <TableHeaderCell key={h}><b>{h}</b></TableHeaderCell>)}</TableRow>
        </TableHeader>
        <TableBody>{rows.map((r, i) => <TableRow key={i}>{r.map((c, j) => <TableCell key={j}>{c}</TableCell>)}</TableRow>)}</TableBody>
      </Table>
    </div>
  );
}

function AgentEditor({ agent, isNew, onClose, onSave }: {
  agent: Agent; isNew: boolean; onClose: () => void; onSave: (a: Agent, policy?: DemoState['digestPolicy']) => void;
}) {
  const { state } = useDemo();
  const [d, setD] = useState<Agent>(agent);
  const [policy, setPolicy] = useState(state.digestPolicy);
  const set = (p: Partial<Agent>) => setD((x) => ({ ...x, ...p }));
  const isDigest = d.id === 'a-digest';
  const valid = d.name.trim() && d.purpose.trim() && d.sources.length;

  return (
    <Dialog open onOpenChange={(_, x) => !x.open && onClose()}>
      <DialogSurface style={{ maxWidth: 760 }}>
        <DialogBody>
          <DialogTitle>{isNew ? 'Create a custom agent' : `Configure: ${agent.name}`}</DialogTitle>
          <DialogContent>
            <div className="stack">
              {d.builtIn ? (
                <p className="muted" style={{ margin: 0 }}>{d.purpose}</p>
              ) : (
                <>
                  <Field label="Name" required><Input value={d.name} onChange={(_, x) => set({ name: x.value })} placeholder="e.g. Customer follow-up finder" /></Field>
                  <Field label="What should this agent do?" required hint="Describe the job in plain language. The AI turns this into its plan.">
                    <Textarea value={d.purpose} onChange={(_, x) => set({ purpose: x.value })} resize="vertical"
                      placeholder="e.g. Every Friday, find customers who haven't heard from us in 14 days and draft a follow-up email for their TPM." />
                  </Field>
                </>
              )}

              <div className="row" style={{ alignItems: 'flex-end' }}>
                <Switch checked={d.enabled} label={d.enabled ? 'On' : 'Off'} onChange={(_, x) => set({ enabled: x.checked })} />
                <Field label="When it runs">
                  <Dropdown value={TRIGGER_LABEL[d.trigger]} selectedOptions={[d.trigger]} onOptionSelect={(_, x) => x.optionValue && set({ trigger: x.optionValue as Trigger })} disabled={isDigest} style={{ minWidth: 200 }}>
                    {(Object.keys(TRIGGER_LABEL) as Trigger[]).map((t) => <Option key={t} value={t}>{TRIGGER_LABEL[t]}</Option>)}
                  </Dropdown>
                </Field>
                {(d.trigger === 'daily' || d.trigger === 'weekly') && !isDigest && (
                  <Field label="Time">
                    <Dropdown value={d.time} selectedOptions={[d.time]} onOptionSelect={(_, x) => x.optionValue && set({ time: x.optionValue })} style={{ minWidth: 110 }}>
                      {TIMES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                    </Dropdown>
                  </Field>
                )}
                {isDigest && <span className="small muted">Each user picks their own time.</span>}
              </div>

              <CheckGroup label="Data sources it may read" hint="Exclusions set on each data source always apply.">
                <div className="source-checks">
                  {state.sources.map((src) => (
                    <Checkbox key={src.id} checked={d.sources.includes(src.id)} label={src.name + (src.enabled ? '' : ' (disabled)')}
                      onChange={(_, x) => set({ sources: x.checked ? [...d.sources, src.id] : d.sources.filter((id) => id !== src.id) })} />
                  ))}
                </div>
              </CheckGroup>

              {!d.builtIn && (
                <Field label="Writes to">
                  <Dropdown value={d.writesTo ?? 'Nothing (report only)'} selectedOptions={[d.writesTo ?? '']} onOptionSelect={(_, x) => set({ writesTo: x.optionValue || null })} style={{ minWidth: 240 }}>
                    <Option value="" text="Nothing (report only)">Nothing (report only)</Option>
                    {WRITE_TARGETS.map((w) => <Option key={w} value={w}>{w}</Option>)}
                  </Dropdown>
                </Field>
              )}
              {d.builtIn && <div className="small"><span className="muted">Writes to:</span> {d.writesTo ?? 'Nothing (report only)'}</div>}

              {!isDigest && (
                <Field label="What it may do">
                  <RadioGroup value={d.autonomy} onChange={(_, x) => set({ autonomy: x.value as Autonomy })}>
                    <Radio value="read" label="Read & report only: findings and alerts, never changes anything" />
                    <Radio value="suggest" label="Suggest: a person approves every change (recommended to start)" />
                    <Radio value="auto" label="Act automatically when confidence is high enough; the rest goes for approval" />
                  </RadioGroup>
                </Field>
              )}
              {d.autonomy === 'auto' && !isDigest && (
                <Field label={`Act automatically at or above ${d.autoThreshold}% confidence`}>
                  <Slider min={50} max={100} step={1} value={d.autoThreshold} onChange={(_, x) => set({ autoThreshold: x.value })} />
                </Field>
              )}

              <Field label="Instructions" hint="Rules the agent must follow, in plain language.">
                <Textarea value={d.instructions} onChange={(_, x) => set({ instructions: x.value })} resize="vertical" />
              </Field>

              <CheckGroup label="Notify">
                <div className="row">
                  {d.notify.length === 0 && <span className="muted small">Nobody</span>}
                  {d.notify.map((id) => (
                    <Button key={id} size="small" shape="circular" icon={<Dismiss20Regular />} iconPosition="after" aria-label={`Remove ${nameOf(id)}`}
                      onClick={() => set({ notify: d.notify.filter((x) => x !== id) })}>
                      {nameOf(id)}
                    </Button>
                  ))}
                  <Dropdown aria-label="Add person to notify" placeholder="Add person…" value="" selectedOptions={[]}
                    onOptionSelect={(_, x) => x.optionValue && set({ notify: [...d.notify, x.optionValue] })} style={{ minWidth: 200 }}>
                    {PEOPLE.filter((p) => !d.notify.includes(p.id)).map((p) => <Option key={p.id} value={p.id} text={p.name}>{p.name}</Option>)}
                  </Dropdown>
                </div>
              </CheckGroup>
              <div className="row">
                <Field label="Monthly AI budget (USD)">
                  <Input type="number" value={String(d.monthlyBudget)} onChange={(_, x) => set({ monthlyBudget: Number(x.value) || 0 })} style={{ width: 120 }} />
                </Field>
              </div>

              {isDigest && (
                <div className="panel" style={{ background: 'var(--colorNeutralBackground2)' }}>
                  <b>Defaults for users</b>
                  <p className="small muted" style={{ margin: '4px 0 8px' }}>People can change their own digest settings. These apply to anyone who hasn't.</p>
                  <div className="row" style={{ alignItems: 'flex-end' }}>
                    <Switch checked={policy.defaultEnabled} label={policy.defaultEnabled ? 'On by default' : 'Off by default'} onChange={(_, x) => setPolicy({ ...policy, defaultEnabled: x.checked })} />
                    <Field label="Default time">
                      <Dropdown value={policy.defaultTime} selectedOptions={[policy.defaultTime]} onOptionSelect={(_, x) => x.optionValue && setPolicy({ ...policy, defaultTime: x.optionValue })} style={{ minWidth: 110 }}>
                        {TIMES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                      </Dropdown>
                    </Field>
                  </div>
                  <CheckGroup label="Allowed channels">
                    <div className="row">
                      {(Object.keys(CHANNEL_LABEL) as DigestChannel[]).map((c) => (
                        <Checkbox key={c} label={CHANNEL_LABEL[c]} checked={policy.allowedChannels.includes(c)}
                          onChange={(_, x) => setPolicy({ ...policy, allowedChannels: x.checked ? [...policy.allowedChannels, c] : policy.allowedChannels.filter((y) => y !== c) })} />
                      ))}
                    </div>
                  </CheckGroup>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button appearance="primary" disabled={!valid} onClick={() => onSave(d, isDigest ? policy : undefined)}>{isNew ? 'Create agent' : 'Save'}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
