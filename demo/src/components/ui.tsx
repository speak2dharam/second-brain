import { Avatar, Badge, MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { nameOf, personById } from '../data/people';
import type { SourceStatus } from '../data/types';
import { accessLabel, excludedPeople, isAdmin, sourceById } from '../lib/access';
import { useDemo } from '../lib/store';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

/** Shows the viewer's access level for the given sources, plus exclusions (Admin only). */
export function AccessBanner({ sourceIds }: { sourceIds: string[] }) {
  const { state } = useDemo();
  const uid = state.userId!;
  const admin = isAdmin(state, uid);
  return (
    <div className="stack" style={{ marginBottom: 16 }}>
      {sourceIds.map((id) => {
        const src = sourceById(state, id);
        if (!src) return (
          <MessageBar key={id} intent="warning"><MessageBarBody>This data source has been deleted.</MessageBarBody></MessageBar>
        );
        if (!src.enabled) return (
          <MessageBar key={id} intent="warning">
            <MessageBarBody><MessageBarTitle>{src.name} is disabled</MessageBarTitle>The Admin has disabled this data source, so its data is hidden everywhere, including from the AI.</MessageBarBody>
          </MessageBar>
        );
        const ex = admin && src.personal ? excludedPeople(src) : [];
        return (
          <MessageBar key={id} intent="info" icon={null}>
            <MessageBarBody>
              <b>{src.name}</b> · your access: <b>{accessLabel(state, uid, id)}</b>
              {ex.length > 0 && <> · Not read by the app (excluded): {ex.map((p) => p.name).join(', ')}</>}
            </MessageBarBody>
          </MessageBar>
        );
      })}
    </div>
  );
}

export function PersonChip({ id, size = 24 }: { id: string; size?: 20 | 24 | 28 | 32 }) {
  const p = personById(id);
  return (
    <span className="person-chip">
      <Avatar name={nameOf(id)} size={size} color="colorful" />
      {p ? <Link to={`/people/${p.id}`}>{p.name}</Link> : <span>{nameOf(id)}</span>}
    </span>
  );
}

export function StatusBadge({ status }: { status: SourceStatus | string }) {
  const color = status === 'Connected' || status === 'Approved' || status === 'Done' || status === 'Resolved' || status === 'Completed' || status === 'Success'
    ? 'success'
    : status === 'Syncing' || status === 'Pending' || status === 'In review' || status === 'Active' || status === 'In progress' || status === 'Partial'
      ? 'warning'
      : status === 'Error' || status === 'Blocked' || status === 'Rejected' || status === 'Failed'
        ? 'danger'
        : 'informative';
  return <Badge appearance="tint" color={color}>{status}</Badge>;
}

/** Renders **bold** markers in text. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>))}</>;
}

/**
 * Labelled group for several checkboxes. Not a Fluent <Field>: Field shares one control id
 * with every child, so clicking one checkbox's label would toggle the first checkbox.
 */
export function CheckGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="check-group">
      <div className="check-group-label">{label}</div>
      {children}
      {hint && <div className="small muted">{hint}</div>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function Tile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="panel tile">
      <div className="muted small">{label}</div>
      <div className="num">{value}</div>
      {hint && <div className="muted small">{hint}</div>}
    </div>
  );
}
