import { Avatar, Badge, Button } from '@fluentui/react-components';
import { ArrowLeft20Regular, CalendarLtr20Regular, Chat20Regular, Code20Regular, HatGraduation20Regular, Mail20Regular } from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Empty, PageHeader } from '../components/ui';
import { nameOf, personById } from '../data/people';
import { courseOf } from '../data/learning';
import { emailParticipants, visibleChats, visibleEmails, visibleEnrollments, visibleLeaves, visiblePeople, visibleTasks } from '../lib/access';
import { fmtDate } from '../lib/format';
import { useDemo, useViewer } from '../lib/store';

interface Ev { when: string; source: string; icon: ReactNode; title: string; detail?: string }

export default function PersonPage() {
  const { id = '' } = useParams();
  const { state } = useDemo();
  const me = useViewer();
  const navigate = useNavigate();
  const p = personById(id);
  const allowed = p && visiblePeople(state, me.id).some((x) => x.id === p.id);

  if (!p || !allowed) {
    return (
      <>
        <PageHeader title="Person activity" />
        <Empty>You don't have access to this person's activity with your current role.</Empty>
      </>
    );
  }

  const events: Ev[] = [];
  visibleTasks(state, me.id).filter((w) => w.assignedTo === p.id)
    .forEach((w) => events.push({ when: w.updated, source: 'Azure DevOps', icon: <Code20Regular />, title: `#${w.id} ${w.title}`, detail: `${w.state} · ${w.sprint} · ${w.project}` }));
  visibleEmails(state, me.id).filter((e) => emailParticipants(e).includes(p.id))
    .forEach((e) => events.push({ when: e.date, source: 'Email', icon: <Mail20Regular />, title: e.subject, detail: e.from === p.id ? `Sent to ${e.to.map(nameOf).join(', ')}` : `From ${nameOf(e.from)}` }));
  visibleChats(state, me.id).filter((c) => c.from === p.id)
    .forEach((c) => events.push({ when: c.date, source: 'Teams', icon: <Chat20Regular />, title: c.text, detail: c.where }));
  visibleLeaves(state, me.id).filter((l) => l.personId === p.id)
    .forEach((l) => events.push({ when: l.from, source: 'Leave', icon: <CalendarLtr20Regular />, title: `${l.type} leave, ${l.days} day${l.days > 1 ? 's' : ''}`, detail: `${fmtDate(l.from)} – ${fmtDate(l.to)} · ${l.status}` }));
  visibleEnrollments(state, me.id).filter((e) => e.personId === p.id).forEach((e) => {
    const crs = courseOf(e.courseId);
    events.push(e.status === 'Completed'
      ? { when: e.completedAt!, source: 'UCLMS', icon: <HatGraduation20Regular />, title: `Completed “${crs.title}”`, detail: `Score ${e.score}% · certificate ${e.certificate}` }
      : { when: e.lastActivity, source: 'UCLMS', icon: <HatGraduation20Regular />, title: `${crs.title}`, detail: `${e.status} · ${e.itemsCompleted}/${crs.items} items${crs.mandatory ? ` · mandatory, due ${fmtDate(crs.dueDate)}` : ''}` });
  });
  events.sort((a, b) => b.when.localeCompare(a.when));
  const manager = p.managerId ? personById(p.managerId) : undefined;

  return (
    <>
      <Button appearance="subtle" icon={<ArrowLeft20Regular />} onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>Back</Button>
      <div className="panel row" style={{ gap: 16, marginBottom: 16 }}>
        <Avatar name={p.name} size={64} color="colorful" />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>{p.name}</h1>
          <div className="muted">{p.jobTitle} · {p.department}</div>
          <div className="row small" style={{ marginTop: 6 }}>
            <Badge appearance="tint">{p.location}, {p.country}</Badge>
            <Badge appearance="tint">{p.region}</Badge>
            {manager && <span className="muted">Reports to {manager.name}</span>}
            <span className="muted">{p.email}</span>
          </div>
        </div>
      </div>
      <h3>Recent activity</h3>
      <p className="muted small">Only items from data sources your role allows are shown.</p>
      {!events.length ? <Empty>No activity you can see.</Empty> : (
        <div className="timeline">
          {events.map((e, i) => (
            <div key={i} className="tl-item">
              <div className="tl-icon">{e.icon}</div>
              <div style={{ flex: 1 }}>
                <div><b>{e.title}</b></div>
                {e.detail && <div className="muted small">{e.detail}</div>}
              </div>
              <div className="muted small" style={{ whiteSpace: 'nowrap' }}>{e.source} · {fmtDate(e.when)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
