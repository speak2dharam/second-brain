import {
  Badge, Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Field, Input, MessageBar,
  MessageBarBody, ProgressBar, Spinner,
} from '@fluentui/react-components';
import { Checkmark20Regular, Dismiss20Regular, Mail20Regular, Sparkle20Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AccessBanner, Empty, PageHeader, PersonChip } from '../components/ui';
import { EMAILS } from '../data/content';
import { NOMINATION_FIELDS } from '../data/nominations';
import { nameOf } from '../data/people';
import type { Email, Suggestion } from '../data/types';
import { visibleEmails, visibleNominations } from '../lib/access';
import { fmtDate } from '../lib/format';
import { useDemo, useViewer } from '../lib/store';
import { filledCount } from './Leads';

const SCAN_STEPS = ['Finding emails about this account', 'Reading emails and attachments', 'Extracting field values', 'Checking confidence'];

export default function Nominations() {
  const { id } = useParams();
  const { state, update } = useDemo();
  const me = useViewer();
  const navigate = useNavigate();
  const list = visibleNominations(state, me.id);
  const n = list.find((x) => x.id === id) ?? list[0];
  const [scanStep, setScanStep] = useState<number | null>(null);
  const [email, setEmailState] = useState<Email | null>(null);
  const [shown, setShown] = useState(false); // separate from `email` so content stays during the close animation
  const setEmail = (e: Email) => { setEmailState(e); setShown(true); };

  if (!n) return (<><PageHeader title="Nomination AI" /><AccessBanner sourceIds={['nomination']} /><Empty>No leads you can see.</Empty></>);

  const sugg = state.suggestions.filter((s) => s.nominationId === n.id);
  const pending = sugg.filter((s) => s.status === 'pending');
  const hidden = sugg.filter((s) => s.status === 'hidden');
  const total = NOMINATION_FIELDS.length;
  const filled = filledCount(n);
  const related = EMAILS.filter((e) => sugg.some((s) => s.emailId === e.id));
  const canOpen = new Set(visibleEmails(state, me.id).map((e) => e.id));

  const setStatus = (ids: string[], status: Suggestion['status']) =>
    update((s) => {
      const approved = s.suggestions.filter((x) => ids.includes(x.id) && status === 'approved');
      return {
        ...s,
        suggestions: s.suggestions.map((x) => (ids.includes(x.id) ? { ...x, status } : x)),
        nominations: s.nominations.map((nom) => {
          const mine = approved.filter((a) => a.nominationId === nom.id);
          if (!mine.length) return nom;
          const fields = { ...nom.fields };
          mine.forEach((a) => { fields[a.field] = a.value; });
          return { ...nom, fields, aiFields: Array.from(new Set([...nom.aiFields, ...mine.map((a) => a.field)])) };
        }),
      };
    });

  const scan = () => {
    setScanStep(0);
    SCAN_STEPS.forEach((_, i) => setTimeout(() => setScanStep(i + 1), 600 * (i + 1)));
    setTimeout(() => {
      update((s) => ({ ...s, suggestions: s.suggestions.map((x) => (x.nominationId === n.id && x.status === 'hidden' ? { ...x, status: 'pending' } : x)) }));
      setScanStep(null);
    }, 600 * (SCAN_STEPS.length + 1));
  };

  const label = (key: string) => NOMINATION_FIELDS.find((f) => f.key === key)?.label ?? key;

  return (
    <>
      <PageHeader title="Nomination AI" subtitle="AI reads emails, finds the missing Nomination Tracker fields, and you approve them with one click." />
      <AccessBanner sourceIds={['nomination', 'email']} />
      <div className="split">
        <div className="panel list-pane">
          {list.map((x) => {
            const p = state.suggestions.filter((s) => s.nominationId === x.id && s.status === 'pending').length;
            return (
              <button key={x.id} className={`list-item ${x.id === n.id ? 'active' : ''}`} onClick={() => navigate(`/nominations/${x.id}`)}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b>{x.accountName}</b>
                  {p > 0 && <Badge color="brand" size="small">{p}</Badge>}
                </div>
                <div className="muted small">{x.stage} · {x.country} · {filledCount(x)}/{total} fields</div>
              </button>
            );
          })}
        </div>

        <div className="stack">
          <div className="panel">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0 }}>{n.accountName}</h2>
                <div className="muted small">Received {fmtDate(n.received)} · Stage: {n.stage}</div>
              </div>
              <Button appearance="primary" icon={scanStep !== null ? <Spinner size="tiny" /> : <Sparkle20Regular />} onClick={scan} disabled={scanStep !== null || hidden.length === 0}>
                {hidden.length ? 'Fill with AI' : 'AI scan complete'}
              </Button>
            </div>
            <div className="header-grid">
              {[['Account ID', n.accountId], ['TP ID', n.tpid], ['Opportunity ID', n.opportunityId], ['Assessment Type', n.assessmentType || '—'],
                ['Engagement Type', n.engagementType], ['Partner Name', n.partnerName], ['Partner ID', n.partnerId]].map(([k, v]) => (
                <div key={k}><div className="muted small">{k}</div><div>{v}</div></div>
              ))}
              <div><div className="muted small">Owner (TPM)</div><PersonChip id={n.ownerId} size={20} /></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <ProgressBar value={filled / total} thickness="large" color={filled / total > 0.8 ? 'success' : 'warning'} />
              <span className="small muted">{filled} of {total} fields filled{n.aiFields.length > 0 && ` · ${n.aiFields.length} filled by AI`}</span>
            </div>
          </div>

          {scanStep !== null && (
            <div className="panel stack" style={{ gap: 6 }}>
              {SCAN_STEPS.map((st, i) => (
                <div key={st} className={`step ${i < scanStep ? 'done' : i === scanStep ? 'now' : ''}`}>
                  {i < scanStep ? <Checkmark20Regular /> : i === scanStep ? <Spinner size="extra-tiny" /> : <span style={{ width: 20 }} />}
                  {st}{i === 1 && i <= scanStep && ` (${related.length} emails)`}
                </div>
              ))}
            </div>
          )}

          {pending.length > 0 && (
            <div className="panel">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}><Sparkle20Regular style={{ verticalAlign: 'middle' }} /> AI found {pending.length} value{pending.length > 1 ? 's' : ''}</h3>
                <div className="row">
                  <Button size="small" onClick={() => setStatus(pending.filter((s) => s.confidence >= 90).map((s) => s.id), 'approved')} disabled={!pending.some((s) => s.confidence >= 90)}>
                    Approve all ≥ 90%
                  </Button>
                  <Button size="small" appearance="primary" onClick={() => setStatus(pending.map((s) => s.id), 'approved')}>Approve all</Button>
                </div>
              </div>
              <div className="stack" style={{ gap: 8 }}>
                {pending.map((s) => {
                  const src = EMAILS.find((e) => e.id === s.emailId);
                  return (
                    <div key={s.id} className="suggestion">
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div className="muted small">{label(s.field)}</div>
                        <div><b>{s.value}</b></div>
                        {src && (canOpen.has(src.id) ? (
                          <button className="link-btn small" onClick={() => setEmail(src)}>
                            <Mail20Regular style={{ verticalAlign: 'middle' }} /> From email: “{src.subject}” · {nameOf(src.from)} · {fmtDate(src.date)}
                          </button>
                        ) : (
                          <span className="muted small">
                            <Mail20Regular style={{ verticalAlign: 'middle' }} /> Found in an email from {fmtDate(src.date)}. You don't have access to open that mailbox.
                          </span>
                        ))}
                      </div>
                      <Badge appearance="tint" color={s.confidence >= 90 ? 'success' : s.confidence >= 80 ? 'warning' : 'danger'}>{s.confidence}% sure</Badge>
                      <Button size="small" appearance="primary" icon={<Checkmark20Regular />} onClick={() => setStatus([s.id], 'approved')}>Approve</Button>
                      <Button size="small" icon={<Dismiss20Regular />} onClick={() => setStatus([s.id], 'rejected')}>Reject</Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Update Nomination</h3>
            <div className="field-grid">
              {NOMINATION_FIELDS.map((f) => {
                const ai = n.aiFields.includes(f.key);
                return (
                  <Field key={f.key} label={<span>{f.label} {ai && <Badge size="small" color="brand" appearance="tint" icon={<Sparkle20Regular />}>AI</Badge>}</span>}>
                    <Input value={n.fields[f.key] ?? ''} placeholder="— empty —" readOnly className={ai ? 'ai-input' : undefined} />
                  </Field>
                );
              })}
            </div>
            <MessageBar intent="info" style={{ marginTop: 12 }}>
              <MessageBarBody>Approved values are written back to the Nomination Tracker through its API. This needs access from the team that owns the tracker (Q-033).</MessageBarBody>
            </MessageBar>
          </div>
        </div>
      </div>

      <Dialog open={shown} onOpenChange={(_, d) => setShown(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{email?.subject}</DialogTitle>
            <DialogContent>
              {email && (
                <>
                  <div className="muted small">From {nameOf(email.from)} to {email.to.map(nameOf).join(', ')} · {fmtDate(email.date)}</div>
                  <pre className="email-body">{email.body}</pre>
                </>
              )}
            </DialogContent>
            <DialogActions><Button onClick={() => setShown(false)}>Close</Button></DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
