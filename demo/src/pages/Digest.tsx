import {
  Badge, Button, Checkbox, Dropdown, Field, MessageBar, MessageBarBody, Option, Radio, RadioGroup, Switch,
} from '@fluentui/react-components';
import { Send20Regular, Sparkle20Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckGroup, PageHeader } from '../components/ui';
import { CHANNEL_LABEL, DIGEST_SECTIONS, TIME_ZONE } from '../data/agents';
import type { DigestChannel, DigestSettings } from '../data/types';
import { availableSections, buildDigest, digestSettingsFor } from '../lib/digest';
import { useDemo, useViewer } from '../lib/store';

export const TIMES = Array.from({ length: 31 }, (_, i) => {
  const m = 6 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}); // 06:00 … 21:00

/** Demo "today" is Saturday 10 Oct 2026. */
const nextDelivery = (d: DigestSettings) => (d.days === 'weekdays' ? 'Monday 12 Oct' : 'Sunday 11 Oct');

export default function DigestPage() {
  const { state, update } = useDemo();
  const me = useViewer();
  const settings = digestSettingsFor(state, me.id);
  const available = availableSections(state, me.id);
  const allowed = state.digestPolicy.allowedChannels;
  const agentOn = state.agents.find((a) => a.id === 'a-digest')?.enabled ?? false;
  const [sent, setSent] = useState(false);

  const save = (p: Partial<DigestSettings>) => update((s) => ({ ...s, digest: { ...s.digest, [me.id]: { ...digestSettingsFor(s, me.id), ...p } } }));
  const toggle = <T extends string>(list: T[], v: T, on: boolean) => (on ? Array.from(new Set([...list, v])) : list.filter((x) => x !== v));

  const preview = buildDigest(state, me.id, settings.sections);

  return (
    <>
      <PageHeader title="My daily digest" subtitle="A short AI summary of what needs your attention, delivered at the time you choose." />
      {!agentOn && (
        <MessageBar intent="warning" layout="multiline" style={{ marginBottom: 16 }}>
          <MessageBarBody>The Admin has turned off the Daily digest agent, so no digests are being sent right now.</MessageBarBody>
        </MessageBar>
      )}
      <div className="digest-grid">
        <div className="panel stack">
          <Switch
            checked={settings.enabled}
            label={settings.enabled ? 'Daily digest is on' : 'Daily digest is off'}
            onChange={(_, d) => save({ enabled: d.checked })}
          />
          <div className={settings.enabled ? 'stack' : 'stack muted-block'}>
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <Field label="Time">
                <Dropdown value={settings.time} selectedOptions={[settings.time]} onOptionSelect={(_, d) => d.optionValue && save({ time: d.optionValue })} disabled={!settings.enabled} style={{ minWidth: 120 }}>
                  {TIMES.map((t) => <Option key={t} value={t}>{t}</Option>)}
                </Dropdown>
              </Field>
              <Field label="Days">
                <RadioGroup layout="horizontal" value={settings.days} onChange={(_, d) => save({ days: d.value as DigestSettings['days'] })} disabled={!settings.enabled}>
                  <Radio value="weekdays" label="Weekdays" />
                  <Radio value="everyday" label="Every day" />
                </RadioGroup>
              </Field>
            </div>
            <div className="small muted">Time zone: <b>{TIME_ZONE[me.location]}</b>, taken from your Microsoft 365 settings.</div>

            <CheckGroup label="Deliver to">
              <div className="row">
                {(Object.keys(CHANNEL_LABEL) as DigestChannel[]).map((c) => (
                  <Checkbox key={c} label={CHANNEL_LABEL[c] + (allowed.includes(c) ? '' : ' (turned off by Admin)')} disabled={!settings.enabled || !allowed.includes(c)}
                    checked={settings.channels.includes(c) && allowed.includes(c)} onChange={(_, d) => save({ channels: toggle(settings.channels, c, !!d.checked) })} />
                ))}
              </div>
            </CheckGroup>

            <CheckGroup label="Include" hint="Only sections that your access allows are listed.">
              <div className="stack" style={{ gap: 0 }}>
                {DIGEST_SECTIONS.filter((x) => available.includes(x.id)).map((x) => (
                  <Checkbox key={x.id} label={x.label} disabled={!settings.enabled} checked={settings.sections.includes(x.id)}
                    onChange={(_, d) => save({ sections: toggle(settings.sections, x.id, !!d.checked) })} />
                ))}
              </div>
            </CheckGroup>
          </div>
          {settings.enabled && (
            <MessageBar intent="success" layout="multiline">
              <MessageBarBody>
                Next digest: <b>{nextDelivery(settings)}, {settings.time}</b> by {settings.channels.filter((c) => allowed.includes(c)).map((c) => CHANNEL_LABEL[c]).join(' + ') || 'no channel selected'}.
              </MessageBarBody>
            </MessageBar>
          )}
        </div>

        <div className="panel digest-preview">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}><Sparkle20Regular style={{ verticalAlign: 'middle' }} /> Preview</h3>
            <Button icon={<Send20Regular />} onClick={() => { setSent(true); setTimeout(() => setSent(false), 4000); }}>Send me a test now</Button>
          </div>
          {sent && (
            <MessageBar intent="success" style={{ marginBottom: 8 }}>
              <MessageBarBody>Test digest sent to {me.email} (demo: nothing is really sent).</MessageBarBody>
            </MessageBar>
          )}
          <div className="mail">
            <div className="mail-head">
              <b>Your Second Brain digest</b> · {nextDelivery(settings)}
              <div className="small muted">From: Second Brain &lt;secondbrain@unifycloud.com&gt; · To: {me.email}</div>
            </div>
            <p style={{ marginTop: 12 }}><b>{preview.headline}</b></p>
            {preview.sections.map((sec) => (
              <div key={sec.id} className="mail-section">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b>{sec.title}</b>
                  {sec.to && <Link className="small" to={sec.to}>Open →</Link>}
                </div>
                <ul className="bullets">{sec.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
              </div>
            ))}
            <div className="small muted" style={{ marginTop: 12 }}>
              Built only from data you're allowed to see. <Badge appearance="tint" size="small">Daily digest agent</Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
