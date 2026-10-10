import {
  Badge, Button, MessageBar, MessageBarBody, ProgressBar, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow,
} from '@fluentui/react-components';
import { Sparkle20Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessBanner, Empty, PageHeader, PersonChip, Tile } from '../components/ui';
import { NOMINATION_FIELDS, STAGES } from '../data/nominations';
import type { Nomination } from '../data/types';
import { visibleNominations } from '../lib/access';
import { fmtDate } from '../lib/format';
import { useDemo, useViewer } from '../lib/store';

export const filledCount = (n: Nomination) => NOMINATION_FIELDS.filter((f) => n.fields[f.key]).length;

export default function Leads() {
  const { state } = useDemo();
  const me = useViewer();
  const navigate = useNavigate();
  const [stage, setStage] = useState<string | null>(null);
  const all = visibleNominations(state, me.id);
  const list = stage ? all.filter((n) => n.stage === stage) : all;
  const total = NOMINATION_FIELDS.length;
  const pendingFor = (id: string) => state.suggestions.filter((s) => s.nominationId === id && s.status === 'pending').length;
  const pending = all.reduce((sum, n) => sum + pendingFor(n.id), 0);
  const avg = all.length ? Math.round((all.reduce((s, n) => s + filledCount(n), 0) / (all.length * total)) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Leads from Microsoft (Partner Center), tracked in the Nomination Tracker."
        actions={<Button appearance="primary" icon={<Sparkle20Regular />} onClick={() => navigate('/nominations')}>Open Nomination AI</Button>}
      />
      <AccessBanner sourceIds={['nomination']} />
      {!all.length ? <Empty>You don't have any leads you can see.</Empty> : (
        <>
          <div className="tiles">
            <Tile label="Leads you can see" value={all.length} />
            <Tile label="New this week" value={all.filter((n) => n.received >= '2026-10-04').length} hint="From Microsoft Partner Center" />
            <Tile label="AI updates waiting" value={pending} hint="Found in emails, need approval" />
            <Tile label="Average fields filled" value={`${avg}%`} hint={`of ${total} tracker fields`} />
          </div>
          <MessageBar intent="info" style={{ marginBottom: 16 }}>
            <MessageBarBody>
              <b>Lead flow:</b> Microsoft → Partner Center → Excel upload → Nomination Tracker → UnifyCloud work. Later, the app could pull leads from Partner Center automatically, with no Excel step.
            </MessageBarBody>
          </MessageBar>
          <div className="chip-row" style={{ marginBottom: 12 }}>
            <Button shape="circular" appearance={!stage ? 'primary' : 'outline'} onClick={() => setStage(null)}>All · {all.length}</Button>
            {STAGES.map((s) => (
              <Button key={s} shape="circular" appearance={stage === s ? 'primary' : 'outline'} onClick={() => setStage(s)}>
                {s} · {all.filter((n) => n.stage === s).length}
              </Button>
            ))}
          </div>
          <div className="panel table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  {['Account', 'Opportunity ID', 'Country', 'Owner (TPM)', 'Stage', 'Received', 'Fields filled', 'AI', ''].map((h) => <TableHeaderCell key={h}><b>{h}</b></TableHeaderCell>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((n) => {
                  const f = filledCount(n);
                  const p = pendingFor(n.id);
                  return (
                    <TableRow key={n.id}>
                      <TableCell><b>{n.accountName}</b><div className="muted small">{n.accountId}</div></TableCell>
                      <TableCell>{n.opportunityId}</TableCell>
                      <TableCell>{n.country}</TableCell>
                      <TableCell><PersonChip id={n.ownerId} /></TableCell>
                      <TableCell><Badge appearance="tint">{n.stage}</Badge></TableCell>
                      <TableCell>{fmtDate(n.received)}</TableCell>
                      <TableCell style={{ minWidth: 140 }}>
                        <ProgressBar value={f / total} color={f / total > 0.8 ? 'success' : f / total > 0.4 ? 'warning' : 'error'} thickness="large" />
                        <span className="small muted">{f}/{total}</span>
                      </TableCell>
                      <TableCell>{p > 0 && <Badge color="brand">{p} to review</Badge>}</TableCell>
                      <TableCell><Button size="small" onClick={() => navigate(`/nominations/${n.id}`)}>Open</Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
