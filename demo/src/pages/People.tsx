import { Avatar, Badge, Button, MessageBar, MessageBarBody, Tab, TabList } from '@fluentui/react-components';
import { Sparkle20Regular } from '@fluentui/react-icons';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AccessBanner, Empty, PageHeader } from '../components/ui';
import { courseOf } from '../data/learning';
import type { Person } from '../data/types';
import { lastActivity, visibleLeaves, visiblePeople } from '../lib/access';
import { fmtDate, isToday } from '../lib/format';
import { useDemo, useViewer } from '../lib/store';

type Group = 'location' | 'department' | 'country' | 'region';
const GROUPS: { id: Group; label: string }[] = [
  { id: 'location', label: 'Location' }, { id: 'department', label: 'Department' }, { id: 'country', label: 'Country' }, { id: 'region', label: 'Region' },
];

export default function People() {
  const { state } = useDemo();
  const me = useViewer();
  const [params, setParams] = useSearchParams();
  const group = (params.get('group') as Group) || 'location';
  const people = visiblePeople(state, me.id);
  const values = useMemo(() => {
    const m = new Map<string, number>();
    people.forEach((p) => m.set(p[group], (m.get(p[group]) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [people, group]);
  const value = params.get('value') && values.some(([v]) => v === params.get('value')) ? params.get('value')! : values[0]?.[0];
  const shown = people.filter((p) => p[group] === value);

  const rows = shown.map((p) => ({ p, act: lastActivity(state, me.id, p.id) }));
  const activeToday = rows.filter(({ act }) => [act.task?.updated, act.email?.date, act.chat?.date].some((d) => d && isToday(d))).length;
  const blocked = rows.filter(({ act }) => act.task?.state === 'Blocked');
  const leaveSoon = visibleLeaves(state, me.id).filter((l) => shown.some((p) => p.id === l.personId) && l.from >= '2026-10-10' && l.from <= '2026-10-24');

  const set = (g: Group, v?: string) => setParams(v ? { group: g, value: v } : { group: g });

  return (
    <>
      <PageHeader title="People & activity" subtitle="What is happening across locations, departments, countries and regions." />
      <AccessBanner sourceIds={['entra']} />
      <TabList selectedValue={group} onTabSelect={(_, d) => set(d.value as Group)} style={{ marginBottom: 12 }}>
        {GROUPS.map((g) => <Tab key={g.id} value={g.id}>{g.label}</Tab>)}
      </TabList>
      <div className="chip-row" style={{ marginBottom: 16 }}>
        {values.map(([v, n]) => (
          <Button key={v} shape="circular" appearance={v === value ? 'primary' : 'outline'} onClick={() => set(group, v)}>
            {v} · {n}
          </Button>
        ))}
      </div>

      {!shown.length ? <Empty>No people you can see.</Empty> : (
        <>
          <MessageBar intent="success" icon={<Sparkle20Regular />} style={{ marginBottom: 16 }}>
            <MessageBarBody>
              <b>AI summary for {value}:</b> {shown.length} people, {activeToday} active today.
              {blocked.length > 0 && <> {blocked.length} blocked ({blocked.map(({ p, act }) => `${p.name.split(' ')[0]}: ${act.task?.title}`).join('; ')}).</>}
              {leaveSoon.length > 0 && <> Upcoming leave: {leaveSoon.map((l) => `${shown.find((p) => p.id === l.personId)?.name.split(' ')[0]} ${fmtDate(l.from)}`).join(', ')}.</>}
            </MessageBarBody>
          </MessageBar>
          <div className="grid">
            {rows.map(({ p, act }) => <PersonCard key={p.id} p={p} act={act} />)}
          </div>
        </>
      )}
    </>
  );
}

function PersonCard({ p, act }: { p: Person; act: ReturnType<typeof lastActivity> }) {
  const line = (label: string, text?: string, when?: string) => (
    <div className="act-line">
      <span className="muted small">{label}</span>
      <span>{text ?? <span className="muted">— not visible / none</span>}</span>
      {when && <span className="muted small">{fmtDate(when)}</span>}
    </div>
  );
  return (
    <Link to={`/people/${p.id}`} className="panel person-card">
      <div className="row" style={{ marginBottom: 10 }}>
        <Avatar name={p.name} size={40} color="colorful" />
        <div>
          <b>{p.name}</b>
          <div className="muted small">{p.jobTitle} · {p.department}</div>
        </div>
        {act.task?.state === 'Blocked' && <Badge color="danger" appearance="tint">Blocked</Badge>}
      </div>
      {line('Last task', act.task && `${act.task.title} (${act.task.state})`, act.task?.updated)}
      {line('Last email', act.email?.subject, act.email?.date)}
      {line('Last chat', act.chat?.text, act.chat?.date)}
      {line('Training', act.learning.length
        ? `${act.learning.filter((e) => e.status === 'Completed').length}/${act.learning.length} courses done${act.learning.some((e) => courseOf(e.courseId).mandatory && e.status !== 'Completed') ? ' · ⚠️ mandatory pending' : ''}`
        : undefined)}
    </Link>
  );
}
