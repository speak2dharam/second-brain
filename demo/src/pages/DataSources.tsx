import {
  Badge, Button, Checkbox, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Dropdown, Field, Input,
  MessageBar, MessageBarBody, Option, Switch, Tooltip,
} from '@fluentui/react-components';
import {
  Add20Regular, ArrowSync20Regular, ArrowUpload20Regular, Delete20Regular, Edit20Regular, PersonProhibited20Regular,
} from '@fluentui/react-icons';
import { useState } from 'react';
import { Empty, PageHeader, StatusBadge } from '../components/ui';
import { COUNTRIES, JOB_TITLES, PEOPLE } from '../data/people';
import { SOURCE_TEMPLATES } from '../data/setup';
import type { DataSource, Exclusions } from '../data/types';
import { excludedPeople } from '../lib/access';
import { fmtDate, nowIso } from '../lib/format';
import { useDemo } from '../lib/store';

const FREQUENCIES = ['Every 15 min', 'Every 30 min', 'Hourly', 'Daily', 'Daily upload', 'Manual upload'];

export default function DataSources() {
  const { state, update } = useDemo();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<DataSource | null>(null);
  const [excluding, setExcluding] = useState<DataSource | null>(null);
  const [deleting, setDeleting] = useState<DataSource | null>(null);

  const patch = (id: string, p: Partial<DataSource>) =>
    update((s) => ({ ...s, sources: s.sources.map((x) => (x.id === id ? { ...x, ...p } : x)) }));

  const sync = (src: DataSource, extra = 0) => {
    patch(src.id, { status: 'Syncing' });
    setTimeout(() => update((s) => ({
      ...s,
      sources: s.sources.map((x) => (x.id === src.id ? { ...x, status: 'Connected', lastSync: nowIso(), itemCount: x.itemCount + extra } : x)),
    })), 1500);
  };

  return (
    <>
      <PageHeader
        title="Data sources"
        subtitle="Connect the systems the Second Brain reads from. Add, edit, enable, disable or delete them, and choose whose data is read."
        actions={<Button appearance="primary" icon={<Add20Regular />} onClick={() => setAdding(true)}>Add data source</Button>}
      />
      <MessageBar intent="info" style={{ marginBottom: 16 }}>
        <MessageBarBody>
          <b>Exclusions</b> decide whose data the app reads at all. Excluded people are never read, so nobody (not even the Admin or the AI) can see their data.
          Use them for sensitive people (e.g. CTO, HR Manager, VPs) or whole countries with legal limits (e.g. the UK).
        </MessageBarBody>
      </MessageBar>
      {!state.sources.length && <Empty>No data sources. Add one to get started.</Empty>}
      <div className="stack">
        {state.sources.map((src) => {
          const ex = src.personal ? excludedPeople(src) : [];
          return (
            <div key={src.id} className={`panel source-card ${src.enabled ? '' : 'disabled'}`}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div className="row">
                  <b style={{ fontSize: 16 }}>{src.name}</b>
                  <Badge appearance="outline">{src.category}</Badge>
                  {src.readWrite && <Badge appearance="tint" color="important">Read + write</Badge>}
                  {src.custom && <Badge appearance="tint" color="brand">Added</Badge>}
                </div>
                <div className="muted small" style={{ margin: '4px 0 8px' }}>{src.description}</div>
                <div className="row small">
                  <StatusBadge status={src.enabled ? src.status : 'Disabled'} />
                  <span className="muted">{src.connection}</span>
                  <span className="muted">· {src.syncFrequency}</span>
                  <span className="muted">· {src.itemCount} items</span>
                  <span className="muted">· last sync {fmtDate(src.lastSync)}</span>
                  {src.owner && <span className="muted">· owner: {src.owner}</span>}
                </div>
                <div className="row small" style={{ marginTop: 6 }}>
                  <span className="muted">Access types:</span>
                  {src.access.map((a) => <Badge key={a.level} appearance="tint" color="informative" size="small">{a.label}</Badge>)}
                </div>
                {src.personal && (
                  <div className="small" style={{ marginTop: 6 }}>
                    <PersonProhibited20Regular style={{ verticalAlign: 'middle' }} />{' '}
                    {ex.length ? <>Not read: <b>{ex.map((p) => p.name).join(', ')}</b></> : <span className="muted">No exclusions: everyone's data is read</span>}
                  </div>
                )}
              </div>
              <div className="source-actions">
                <Switch checked={src.enabled} label={src.enabled ? 'Enabled' : 'Disabled'} onChange={(_, d) => patch(src.id, { enabled: d.checked })} />
                <div className="row">
                  <Tooltip content="Sync now" relationship="label">
                    <Button icon={<ArrowSync20Regular />} disabled={!src.enabled || src.status === 'Syncing'} onClick={() => sync(src)} />
                  </Tooltip>
                  {src.connection === 'Excel upload' && (
                    <Tooltip content="Upload Excel" relationship="label">
                      <Button icon={<ArrowUpload20Regular />} disabled={!src.enabled} onClick={() => sync(src, 25)} />
                    </Tooltip>
                  )}
                  {src.personal && <Button icon={<PersonProhibited20Regular />} onClick={() => setExcluding(src)}>Exclusions</Button>}
                  <Tooltip content="Edit" relationship="label"><Button icon={<Edit20Regular />} onClick={() => setEditing(src)} /></Tooltip>
                  <Tooltip content="Delete" relationship="label"><Button icon={<Delete20Regular />} onClick={() => setDeleting(src)} /></Tooltip>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {adding && <AddDialog onClose={() => setAdding(false)} onAdd={(src) => { update((s) => ({ ...s, sources: [...s.sources, src] })); setAdding(false); sync(src, src.connection === 'Excel upload' ? 0 : 120); }} />}
      {editing && <EditDialog src={editing} onClose={() => setEditing(null)} onSave={(p) => { patch(editing.id, p); setEditing(null); }} />}
      {excluding && <ExclusionDialog src={excluding} onClose={() => setExcluding(null)} onSave={(exclusions) => { patch(excluding.id, { exclusions }); setExcluding(null); }} />}
      <Dialog open={!!deleting} onOpenChange={(_, d) => !d.open && setDeleting(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete {deleting?.name}?</DialogTitle>
            <DialogContent>The connection and all data imported from it will be removed. Roles lose its access types. (Use "Reset demo data" to undo.)</DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleting(null)}>Cancel</Button>
              <Button appearance="primary" onClick={() => {
                const id = deleting!.id;
                update((s) => ({ ...s, sources: s.sources.filter((x) => x.id !== id) }));
                setDeleting(null);
              }}>Delete</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}

function AddDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (s: DataSource) => void }) {
  const [tpl, setTpl] = useState(0);
  const t = SOURCE_TEMPLATES[tpl];
  const [name, setName] = useState(t.name);
  const [owner, setOwner] = useState(t.owner);
  const pick = (i: number) => { setTpl(i); setName(SOURCE_TEMPLATES[i].name); setOwner(SOURCE_TEMPLATES[i].owner); };
  return (
    <Dialog open onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface style={{ maxWidth: 640 }}>
        <DialogBody>
          <DialogTitle>Add data source</DialogTitle>
          <DialogContent>
            <div className="stack">
              <div className="template-grid">
                {SOURCE_TEMPLATES.map((x, i) => (
                  <button key={x.name} className={`template ${i === tpl ? 'active' : ''}`} onClick={() => pick(i)}>
                    <b>{x.name}</b>
                    <span className="muted small">{x.connection}</span>
                    <span className="small">{x.description}</span>
                  </button>
                ))}
              </div>
              <Field label="Name"><Input value={name} onChange={(_, d) => setName(d.value)} /></Field>
              <Field label="Owning team"><Input value={owner} onChange={(_, d) => setOwner(d.value)} placeholder="e.g. HR" /></Field>
              <div className="small">
                <span className="muted">This source brings its own access types for roles: </span>
                {t.access.map((a) => <Badge key={a.level} appearance="tint" size="small" style={{ marginRight: 4 }}>{a.label}</Badge>)}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button appearance="primary" disabled={!name.trim()} onClick={() => onAdd({
              ...t, name: name.trim(), owner, id: `custom-${Date.now()}`, enabled: true, status: 'Syncing', lastSync: null, itemCount: 0,
              exclusions: { people: [], countries: [], jobTitles: [] }, explorer: null,
            })}>Connect</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function EditDialog({ src, onClose, onSave }: { src: DataSource; onClose: () => void; onSave: (p: Partial<DataSource>) => void }) {
  const [name, setName] = useState(src.name);
  const [owner, setOwner] = useState(src.owner);
  const [freq, setFreq] = useState(src.syncFrequency);
  return (
    <Dialog open onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Edit {src.name}</DialogTitle>
          <DialogContent>
            <div className="stack">
              <Field label="Name"><Input value={name} onChange={(_, d) => setName(d.value)} /></Field>
              <Field label="Connection"><Input value={src.connection} readOnly /></Field>
              <Field label="Owning team"><Input value={owner} onChange={(_, d) => setOwner(d.value)} /></Field>
              <Field label="Sync frequency">
                <Dropdown value={freq} selectedOptions={[freq]} onOptionSelect={(_, d) => setFreq(d.optionValue ?? freq)}>
                  {FREQUENCIES.map((f) => <Option key={f} value={f}>{f}</Option>)}
                </Dropdown>
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button appearance="primary" onClick={() => onSave({ name, owner, syncFrequency: freq })}>Save</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function ExclusionDialog({ src, onClose, onSave }: { src: DataSource; onClose: () => void; onSave: (e: Exclusions) => void }) {
  const [ex, setEx] = useState<Exclusions>(structuredClone(src.exclusions));
  const [q, setQ] = useState('');
  const toggle = (key: keyof Exclusions, v: string, on: boolean) =>
    setEx((e) => ({ ...e, [key]: on ? [...e[key], v] : e[key].filter((x) => x !== v) }));
  const affected = excludedPeople({ ...src, exclusions: ex });
  return (
    <Dialog open onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface style={{ maxWidth: 760 }}>
        <DialogBody>
          <DialogTitle>Whose data can the app read in {src.name}?</DialogTitle>
          <DialogContent>
            <p className="muted small" style={{ marginTop: 0 }}>Tick to exclude. Excluded data is never downloaded. People are listed from Microsoft Entra ID.</p>
            <div className="excl-grid">
              <div>
                <h4>People</h4>
                <Input size="small" placeholder="Search people" value={q} onChange={(_, d) => setQ(d.value)} style={{ marginBottom: 6, width: '100%' }} />
                <div className="check-list">
                  {PEOPLE.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => (
                    <Checkbox key={p.id} checked={ex.people.includes(p.id)} onChange={(_, d) => toggle('people', p.id, !!d.checked)}
                      label={<span>{p.name} <span className="muted small">{p.jobTitle}</span></span>} />
                  ))}
                </div>
              </div>
              <div>
                <h4>Countries</h4>
                <div className="check-list short">
                  {COUNTRIES.map((c) => <Checkbox key={c} checked={ex.countries.includes(c)} onChange={(_, d) => toggle('countries', c, !!d.checked)} label={c} />)}
                </div>
                <h4>Job titles</h4>
                <div className="check-list short">
                  {JOB_TITLES.map((t) => <Checkbox key={t} checked={ex.jobTitles.includes(t)} onChange={(_, d) => toggle('jobTitles', t, !!d.checked)} label={t} />)}
                </div>
              </div>
            </div>
            <MessageBar intent={affected.length ? 'warning' : 'info'} style={{ marginTop: 12 }}>
              <MessageBarBody>
                {affected.length
                  ? <><b>{affected.length} people will not be read:</b> {affected.map((p) => p.name).join(', ')}</>
                  : "No exclusions: everyone's data in this source is read."}
              </MessageBarBody>
            </MessageBar>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button appearance="primary" onClick={() => onSave(ex)}>Save exclusions</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
