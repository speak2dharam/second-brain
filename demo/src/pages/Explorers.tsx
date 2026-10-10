import {
  Avatar, Badge, Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Dropdown, Input, Option,
  Tab, TabList, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow,
} from '@fluentui/react-components';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AccessBanner, Empty, PageHeader, PersonChip, StatusBadge } from '../components/ui';
import { REPOS, SPRINTS } from '../data/content';
import { DEPARTMENTS, nameOf, PEOPLE, personById } from '../data/people';
import type { Email, Person } from '../data/types';
import {
  emailParticipants, levelsFor, topLevel, visibleChats, visibleDocs, visibleEmails, visibleLeaves, visiblePeople, visibleTasks,
} from '../lib/access';
import { fmtDate } from '../lib/format';
import { useDemo, useViewer } from '../lib/store';

function DataTable({ columns, rows, onRow }: { columns: string[]; rows: ReactNode[][]; onRow?: (i: number) => void }) {
  if (!rows.length) return <Empty>Nothing you can see here.</Empty>;
  return (
    <div className="panel table-wrap">
      <Table>
        <TableHeader><TableRow>{columns.map((c) => <TableHeaderCell key={c}><b>{c}</b></TableHeaderCell>)}</TableRow></TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i} onClick={onRow ? () => onRow(i) : undefined} style={onRow ? { cursor: 'pointer' } : undefined}>
              {r.map((c, j) => <TableCell key={j}>{c}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: { value: string; text: string }[]; onChange: (v: string) => void }) {
  const selected = options.find((o) => o.value === value);
  return (
    <Dropdown
      aria-label={label}
      value={selected ? selected.text : `All ${label.toLowerCase()}`}
      selectedOptions={[value]}
      onOptionSelect={(_, d) => onChange(d.optionValue ?? '')}
      style={{ minWidth: 200 }}
    >
      <Option value="" text={`All ${label.toLowerCase()}`}>All {label.toLowerCase()}</Option>
      {options.map((o) => <Option key={o.value} value={o.value} text={o.text}>{o.text}</Option>)}
    </Dropdown>
  );
}

/* ---------------- Directory ---------------- */

export function DirectoryExplorer() {
  const { state } = useDemo();
  const me = useViewer();
  const people = visiblePeople(state, me.id);
  const ids = new Set(people.map((p) => p.id));
  const ordered: { p: Person; depth: number }[] = [];
  const walk = (p: Person, depth: number) => {
    ordered.push({ p, depth });
    people.filter((x) => x.managerId === p.id).forEach((x) => walk(x, depth + 1));
  };
  people.filter((p) => !p.managerId || !ids.has(p.managerId)).forEach((r) => walk(r, 0));

  return (
    <>
      <PageHeader title="Directory" subtitle="Staff and reporting lines from Microsoft Entra ID." />
      <AccessBanner sourceIds={['entra']} />
      <DataTable
        columns={['Name', 'Job title', 'Department', 'Location', 'Email']}
        rows={ordered.map(({ p, depth }) => [
          <span key="n" className="person-chip" style={{ paddingLeft: depth * 22 }}>
            {depth > 0 && <span className="tree-line">â””</span>}
            <Avatar name={p.name} size={24} color="colorful" />
            <Link to={`/people/${p.id}`}>{p.name}</Link>
          </span>,
          p.jobTitle, p.department, `${p.location}, ${p.country}`, <span key="e" className="muted">{p.email}</span>,
        ])}
      />
    </>
  );
}

/* ---------------- Email ---------------- */

export function EmailExplorer() {
  const { state } = useDemo();
  const me = useViewer();
  const [dept, setDept] = useState('');
  const [person, setPerson] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Email | null>(null);
  const [shown, setShown] = useState(false); // separate from `open` so content stays during the close animation
  const all = visibleEmails(state, me.id);
  const involved = useMemo(() => {
    const ids = new Set(all.flatMap(emailParticipants).filter((x) => personById(x)));
    return PEOPLE.filter((p) => ids.has(p.id));
  }, [all]);
  const list = all.filter((e) => {
    const parts = emailParticipants(e);
    if (person && !parts.includes(person)) return false;
    if (dept && !parts.some((x) => personById(x)?.department === dept)) return false;
    if (q && !(e.subject + ' ' + e.body).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Email" subtitle="Browse email by department or by person." />
      <AccessBanner sourceIds={['email']} />
      <div className="row" style={{ marginBottom: 12 }}>
        <Filter label="Departments" value={dept} options={DEPARTMENTS.map((d) => ({ value: d, text: d }))} onChange={setDept} />
        <Filter label="People" value={person} options={involved.map((p) => ({ value: p.id, text: p.name }))} onChange={setPerson} />
        <Input placeholder="Search subject or text" value={q} onChange={(_, d) => setQ(d.value)} />
        <span className="muted small">{list.length} emails</span>
      </div>
      <DataTable
        columns={['When', 'From', 'To', 'Subject']}
        rows={list.map((e) => [fmtDate(e.date), nameOf(e.from), e.to.map(nameOf).join(', '), <b key="s">{e.subject}</b>])}
        onRow={(i) => { setOpen(list[i]); setShown(true); }}
      />
      <Dialog open={shown} onOpenChange={(_, d) => setShown(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{open?.subject}</DialogTitle>
            <DialogContent>
              {open && (<>
                <div className="muted small">From {nameOf(open.from)} to {open.to.map(nameOf).join(', ')} Â· {fmtDate(open.date)}</div>
                <pre className="email-body">{open.body}</pre>
              </>)}
            </DialogContent>
            <DialogActions><Button onClick={() => setShown(false)}>Close</Button></DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}

/* ---------------- Teams ---------------- */

export function TeamsExplorer() {
  const { state } = useDemo();
  const me = useViewer();
  const [where, setWhere] = useState('');
  const all = visibleChats(state, me.id);
  const places = Array.from(new Set(all.map((c) => c.where)));
  const list = where ? all.filter((c) => c.where === where) : all;
  return (
    <>
      <PageHeader title="Teams" subtitle="Chats and channel messages." />
      <AccessBanner sourceIds={['teams']} />
      <div className="row" style={{ marginBottom: 12 }}>
        <Filter label="Chats & channels" value={where} options={places.map((p) => ({ value: p, text: p }))} onChange={setWhere} />
      </div>
      <DataTable columns={['When', 'Where', 'From', 'Message']} rows={list.map((c) => [fmtDate(c.date), c.where, <PersonChip key="p" id={c.from} />, c.text])} />
    </>
  );
}

/* ---------------- DevOps ---------------- */

export function DevOpsExplorer() {
  const { state } = useDemo();
  const me = useViewer();
  const full = topLevel(levelsFor(state, me.id, 'devops')) === 'all';
  const [tab, setTab] = useState(full ? 'orgs' : 'items');
  const items = visibleTasks(state, me.id);
  const orgs = Array.from(new Set(REPOS.map((r) => r.org)));
  const current = full ? tab : 'items';

  return (
    <>
      <PageHeader title="Azure DevOps" subtitle="Organisations, repos, sprints and work items." />
      <AccessBanner sourceIds={['devops']} />
      <TabList selectedValue={current} onTabSelect={(_, d) => setTab(String(d.value))} style={{ marginBottom: 12 }}>
        {full && <Tab value="orgs">Organisations</Tab>}
        {full && <Tab value="repos">Repos</Tab>}
        {full && <Tab value="sprints">Sprints</Tab>}
        <Tab value="items">Work items</Tab>
      </TabList>
      {!full && <p className="muted small">Organisations, repos and sprints need the "All orgs, repos, sprints, tasks" access type.</p>}
      {current === 'orgs' && full && (
        <DataTable
          columns={['Organisation', 'Projects', 'Repos', 'Open work items']}
          rows={orgs.map((o) => [
            <b key="o">{o}</b>,
            Array.from(new Set(REPOS.filter((r) => r.org === o).map((r) => r.project))).join(', '),
            String(REPOS.filter((r) => r.org === o).length),
            String(items.filter((w) => w.org === o && !['Done', 'Resolved'].includes(w.state)).length),
          ])}
        />
      )}
      {current === 'repos' && full && (
        <DataTable columns={['Repo', 'Project', 'Organisation', 'Last commit', 'By']} rows={REPOS.map((r) => [<b key="r">{r.name}</b>, r.project, r.org, fmtDate(r.lastCommit), nameOf(r.lastCommitBy)])} />
      )}
      {current === 'sprints' && full && (
        <DataTable columns={['Sprint', 'Project', 'Dates', 'State', 'Work items']} rows={SPRINTS.map((s) => [
          <b key="s">{s.name}</b>, s.project, `${fmtDate(s.start)} â€“ ${fmtDate(s.end)}`, <Badge key="b" appearance="tint" color={s.state === 'Current' ? 'brand' : 'informative'}>{s.state}</Badge>,
          String(items.filter((w) => w.sprint === s.name).length),
        ])} />
      )}
      {current === 'items' && (
        <DataTable columns={['ID', 'Title', 'Type', 'State', 'Assigned to', 'Sprint', 'Updated']} rows={items.map((w) => [
          `#${w.id}`, <b key="t">{w.title}</b>, w.type, <StatusBadge key="s" status={w.state} />, <PersonChip key="p" id={w.assignedTo} />, w.sprint, fmtDate(w.updated),
        ])} />
      )}
    </>
  );
}

/* ---------------- Leave ---------------- */

export function LeaveExplorer() {
  const { state } = useDemo();
  const me = useViewer();
  const [status, setStatus] = useState('');
  const all = visibleLeaves(state, me.id);
  const list = status ? all.filter((l) => l.status === status) : all;
  return (
    <>
      <PageHeader title="Leave" subtitle="Leave requests from the Leave Management Portal." />
      <AccessBanner sourceIds={['leave']} />
      <div className="row" style={{ marginBottom: 12 }}>
        <Filter label="Statuses" value={status} options={['Approved', 'Pending', 'Rejected'].map((x) => ({ value: x, text: x }))} onChange={setStatus} />
      </div>
      <DataTable columns={['Person', 'Type', 'From', 'To', 'Days', 'Status']} rows={list.map((l) => [
        <PersonChip key="p" id={l.personId} />, l.type, fmtDate(l.from), fmtDate(l.to), String(l.days), <StatusBadge key="s" status={l.status} />,
      ])} />
    </>
  );
}

/* ---------------- Documents ---------------- */

export function DocumentsExplorer() {
  const { state } = useDemo();
  const me = useViewer();
  const list = visibleDocs(state, me.id);
  return (
    <>
      <PageHeader title="Documents" subtitle="Files from SharePoint and OneDrive." />
      <AccessBanner sourceIds={['sharepoint', 'onedrive']} />
      <DataTable columns={['Name', 'Source', 'Location', 'Owner', 'Modified']} rows={list.map((d) => [
        <b key="n">{d.name}</b>, d.source === 'sharepoint' ? 'SharePoint' : 'OneDrive', d.location, <PersonChip key="p" id={d.ownerId} />, fmtDate(d.modified),
      ])} />
    </>
  );
}
