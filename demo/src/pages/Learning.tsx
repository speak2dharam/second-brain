import {
  Badge, Dropdown, MessageBar, MessageBarBody, Option, ProgressBar, Tab, TabList, Table, TableBody, TableCell,
  TableHeader, TableHeaderCell, TableRow,
} from '@fluentui/react-components';
import { Certificate20Regular } from '@fluentui/react-icons';
import { useState, type ReactNode } from 'react';
import { AccessBanner, Empty, PageHeader, PersonChip, StatusBadge, Tile } from '../components/ui';
import { CLIENT_ORGS, COURSES, courseOf } from '../data/learning';
import { DEPARTMENTS, nameOf, personById } from '../data/people';
import { levelsFor, topLevel, visibleEnrollments } from '../lib/access';
import { fmtDate } from '../lib/format';
import { useDemo, useViewer } from '../lib/store';

function Grid({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  if (!rows.length) return <Empty>Nothing you can see here.</Empty>;
  return (
    <div className="panel table-wrap">
      <Table>
        <TableHeader><TableRow>{columns.map((c) => <TableHeaderCell key={c}><b>{c}</b></TableHeaderCell>)}</TableRow></TableHeader>
        <TableBody>{rows.map((r, i) => <TableRow key={i}>{r.map((c, j) => <TableCell key={j}>{c}</TableCell>)}</TableRow>)}</TableBody>
      </Table>
    </div>
  );
}

function Pick({ label, value, options, onChange }: { label: string; value: string; options: { value: string; text: string }[]; onChange: (v: string) => void }) {
  const selected = options.find((o) => o.value === value);
  return (
    <Dropdown aria-label={label} value={selected ? selected.text : `All ${label.toLowerCase()}`} selectedOptions={[value]}
      onOptionSelect={(_, d) => onChange(d.optionValue ?? '')} style={{ minWidth: 220 }}>
      <Option value="" text={`All ${label.toLowerCase()}`}>All {label.toLowerCase()}</Option>
      {options.map((o) => <Option key={o.value} value={o.value} text={o.text}>{o.text}</Option>)}
    </Dropdown>
  );
}

export default function Learning() {
  const { state } = useDemo();
  const me = useViewer();
  const full = topLevel(levelsFor(state, me.id, 'uclms')) === 'all';
  const [tab, setTab] = useState('progress');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('');
  const [dept, setDept] = useState('');

  const all = visibleEnrollments(state, me.id);
  const list = all.filter((e) =>
    (!course || e.courseId === course) && (!status || e.status === status) && (!dept || personById(e.personId)?.department === dept));
  const done = all.filter((e) => e.status === 'Completed');
  const mandatory = COURSES.find((c) => c.mandatory)!;
  const mandatoryOpen = all.filter((e) => e.courseId === mandatory.id && e.status !== 'Completed').length;
  const current = !full && tab === 'clients' ? 'progress' : tab;

  return (
    <>
      <PageHeader title="Learning (UCLMS)" subtitle="Courses, progress, scores and certificates from the UnifyCloud Learning Management System." />
      <AccessBanner sourceIds={['uclms']} />
      {!all.length ? <Empty>No learning records you can see.</Empty> : (
        <>
          <div className="tiles">
            <Tile label="Enrolments you can see" value={all.length} />
            <Tile label="Completed" value={`${Math.round((done.length / all.length) * 100)}%`} hint={`${done.length} of ${all.length}`} />
            <Tile label="Certificates earned" value={done.filter((e) => e.certificate).length} />
            <Tile label={`${mandatory.title.split(' 2026')[0]} still open`} value={mandatoryOpen} hint={`Mandatory · due ${fmtDate(mandatory.dueDate)}`} />
          </div>
          <TabList selectedValue={current} onTabSelect={(_, d) => setTab(String(d.value))} style={{ marginBottom: 12 }}>
            <Tab value="progress">Learner progress</Tab>
            <Tab value="courses">Courses</Tab>
            {full && <Tab value="clients">Client organisations</Tab>}
          </TabList>

          {current === 'progress' && (
            <>
              <div className="row" style={{ marginBottom: 12 }}>
                <Pick label="Courses" value={course} options={COURSES.filter((c) => c.status === 'Published').map((c) => ({ value: c.id, text: c.title }))} onChange={setCourse} />
                <Pick label="Statuses" value={status} options={['Completed', 'In progress', 'Not started'].map((s) => ({ value: s, text: s }))} onChange={setStatus} />
                {full && <Pick label="Departments" value={dept} options={DEPARTMENTS.map((d) => ({ value: d, text: d }))} onChange={setDept} />}
                <span className="muted small">{list.length} enrolments</span>
              </div>
              <Grid
                columns={['Person', 'Course', 'Status', 'Progress', 'Score', 'Last activity', 'Certificate']}
                rows={list.map((e) => {
                  const crs = courseOf(e.courseId);
                  const pct = e.itemsCompleted / crs.items;
                  return [
                    <PersonChip key="p" id={e.personId} />,
                    <span key="c">{crs.title}{crs.mandatory && <Badge size="small" appearance="tint" color="danger" style={{ marginLeft: 6 }}>Mandatory</Badge>}</span>,
                    <StatusBadge key="s" status={e.status} />,
                    <div key="g" style={{ minWidth: 120 }}>
                      <ProgressBar value={pct} thickness="large" color={pct === 1 ? 'success' : pct > 0.4 ? 'brand' : 'warning'} />
                      <span className="small muted">{e.itemsCompleted}/{crs.items} items</span>
                    </div>,
                    e.score != null ? `${e.score}%` : '—',
                    fmtDate(e.completedAt ?? e.lastActivity),
                    e.certificate ? <span key="cert" className="row small"><Certificate20Regular /> {e.certificate}</span> : '—',
                  ];
                })}
              />
            </>
          )}

          {current === 'courses' && (
            <Grid
              columns={['Course', 'Category', 'Status', 'Modules / items', 'Instructor', 'Enrolled', 'Completed', 'Avg score']}
              rows={COURSES.map((c) => {
                const ens = all.filter((e) => e.courseId === c.id);
                const scored = ens.filter((e) => e.score != null);
                return [
                  <span key="t"><b>{c.title}</b>{c.mandatory && <div className="small muted">Mandatory · due {fmtDate(c.dueDate)}</div>}</span>,
                  c.category,
                  <Badge key="s" appearance="tint" color={c.status === 'Published' ? 'success' : 'informative'}>{c.status}</Badge>,
                  `${c.modules} / ${c.items}`,
                  nameOf(c.instructorId),
                  String(ens.length),
                  String(ens.filter((e) => e.status === 'Completed').length),
                  scored.length ? `${Math.round(scored.reduce((s, e) => s + e.score!, 0) / scored.length)}%` : '—',
                ];
              })}
            />
          )}

          {current === 'clients' && full && (
            <>
              <MessageBar intent="info" style={{ marginBottom: 12 }}>
                <MessageBarBody>
                  UCLMS also trains client and partner staff. They aren't UnifyCloud employees and aren't in Entra ID, so the Second Brain shows only organisation totals, not individuals (Q-049).
                </MessageBarBody>
              </MessageBar>
              <Grid
                columns={['Organisation', 'Learners', 'Enrolments', 'Completed', 'Completion rate', 'Avg score']}
                rows={CLIENT_ORGS.map((o) => [
                  <b key="n">{o.name}</b>, String(o.learners), String(o.enrollments), String(o.completed),
                  <div key="r" style={{ minWidth: 120 }}>
                    <ProgressBar value={o.completed / o.enrollments} thickness="large" />
                    <span className="small muted">{Math.round((o.completed / o.enrollments) * 100)}%</span>
                  </div>,
                  `${o.avgScore}%`,
                ])}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
