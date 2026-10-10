import {
  Avatar, Badge, Button, Dropdown, Field, Input, MessageBar, MessageBarBody, Option, Table, TableBody, TableCell,
  TableHeader, TableHeaderCell, TableRow, Textarea,
} from '@fluentui/react-components';
import { Add20Regular, Delete20Regular, Dismiss20Regular, LockClosed20Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { PageHeader } from '../components/ui';
import { PEOPLE, personById } from '../data/people';
import type { Level, Role } from '../data/types';
import { useDemo } from '../lib/store';

export default function Roles() {
  const { state, update } = useDemo();
  const [selected, setSelected] = useState(state.roles[0]?.id);
  const role = state.roles.find((r) => r.id === selected) ?? state.roles[0];

  const patch = (p: Partial<Role>) => update((s) => ({ ...s, roles: s.roles.map((r) => (r.id === role.id ? { ...r, ...p } : r)) }));

  const create = () => {
    const id = `role-${Date.now()}`;
    update((s) => ({ ...s, roles: [...s.roles, { id, name: 'New role', description: '', builtIn: false, isAdmin: false, everyone: false, access: {}, members: [] }] }));
    setSelected(id);
  };

  const remove = () => {
    update((s) => ({ ...s, roles: s.roles.filter((r) => r.id !== role.id) }));
    setSelected(state.roles[0]?.id);
  };

  const nonMembers = PEOPLE.filter((p) => !role.members.includes(p.id));

  return (
    <>
      <PageHeader
        title="Roles & access"
        subtitle="Create a role, pick an access type for each data source, then assign it to people."
        actions={<Button appearance="primary" icon={<Add20Regular />} onClick={create}>New role</Button>}
      />
      <div className="split">
        <div className="panel list-pane">
          {state.roles.map((r) => (
            <button key={r.id} className={`list-item ${r.id === role.id ? 'active' : ''}`} onClick={() => setSelected(r.id)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>{r.name}</b>
                {r.builtIn && <Badge size="small" appearance="tint">Built-in</Badge>}
              </div>
              <div className="muted small">{r.everyone ? 'Everyone (automatic)' : `${r.members.length} ${r.members.length === 1 ? 'person' : 'people'}`}</div>
            </button>
          ))}
        </div>

        <div className="stack">
          <div className="panel stack">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>{role.name}</h2>
              {!role.builtIn && <Button icon={<Delete20Regular />} onClick={remove}>Delete role</Button>}
            </div>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <Field label="Role name" style={{ flex: 1, minWidth: 200 }}>
                <Input value={role.name} disabled={role.builtIn} onChange={(_, d) => patch({ name: d.value })} />
              </Field>
              <Field label="Description" style={{ flex: 2, minWidth: 260 }}>
                <Textarea value={role.description} disabled={role.builtIn} onChange={(_, d) => patch({ description: d.value })} resize="vertical" />
              </Field>
            </div>
          </div>

          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Access per data source</h3>
            <p className="muted small">Each data source offers its own access types. New data sources appear here automatically.</p>
            {role.isAdmin ? (
              <MessageBar intent="info" icon={<LockClosed20Regular />}>
                <MessageBarBody>Admin has full access to every data source (except excluded people) and can manage data sources and roles.</MessageBarBody>
              </MessageBar>
            ) : (
              <div className="table-wrap">
                <Table>
                  <TableHeader><TableRow><TableHeaderCell><b>Data source</b></TableHeaderCell><TableHeaderCell><b>Access type</b></TableHeaderCell></TableRow></TableHeader>
                  <TableBody>
                    {state.sources.map((src) => {
                      const level: Level = role.access[src.id] ?? 'none';
                      const opts = [{ level: 'none' as Level, label: 'No access' }, ...src.access];
                      const current = opts.find((o) => o.level === level) ?? opts[0];
                      return (
                        <TableRow key={src.id}>
                          <TableCell>
                            <b>{src.name}</b>
                            {!src.enabled && <Badge size="small" appearance="tint" color="warning" style={{ marginLeft: 6 }}>Disabled</Badge>}
                            <div className="muted small">{src.category}</div>
                          </TableCell>
                          <TableCell>
                            <Dropdown
                              value={current.label}
                              selectedOptions={[current.level]}
                              onOptionSelect={(_, d) => patch({ access: { ...role.access, [src.id]: d.optionValue as Level } })}
                              style={{ minWidth: 240 }}
                            >
                              {opts.map((o) => <Option key={o.level} value={o.level}>{o.label}</Option>)}
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="panel">
            <h3 style={{ marginTop: 0 }}>People with this role</h3>
            {role.everyone ? (
              <p className="muted">Everyone who signs in gets this role automatically.</p>
            ) : (
              <>
                <div className="stack" style={{ gap: 6, marginBottom: 12 }}>
                  {role.members.length === 0 && <span className="muted">Nobody yet.</span>}
                  {role.members.map((id) => {
                    const p = personById(id);
                    return (
                      <div key={id} className="row member-row">
                        <Avatar name={p?.name} size={28} color="colorful" />
                        <span style={{ flex: 1 }}><b>{p?.name}</b> <span className="muted small">{p?.jobTitle} · {p?.location}</span></span>
                        <Button size="small" appearance="subtle" icon={<Dismiss20Regular />} onClick={() => patch({ members: role.members.filter((m) => m !== id) })}>Remove</Button>
                      </div>
                    );
                  })}
                </div>
                <Dropdown
                  placeholder="Assign to a person…"
                  value=""
                  selectedOptions={[]}
                  onOptionSelect={(_, d) => d.optionValue && patch({ members: [...role.members, d.optionValue] })}
                  style={{ minWidth: 280 }}
                >
                  {nonMembers.map((p) => <Option key={p.id} value={p.id} text={p.name}>{p.name} · {p.jobTitle}</Option>)}
                </Dropdown>
              </>
            )}
            <p className="muted small" style={{ marginBottom: 0 }}>A person can hold several roles. Their access adds up, so the widest access wins.</p>
          </div>
        </div>
      </div>
    </>
  );
}
