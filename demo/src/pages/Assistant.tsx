import {
  Badge, Button, Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, Textarea,
} from '@fluentui/react-components';
import { BotSparkle20Regular, Checkmark20Regular, LockClosed20Regular, Send20Filled } from '@fluentui/react-icons';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rich } from '../components/ui';
import { ask, suggestionsFor, type Answer } from '../lib/assistant';
import { useDemo, useViewer } from '../lib/store';

interface Msg { id: number; role: 'user' | 'ai'; text?: string; answer?: Answer; step: number; }

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

function AnswerView({ a }: { a: Answer }) {
  const navigate = useNavigate();
  return (
    <div className="stack" style={{ gap: 10 }}>
      {a.paragraphs.map((p, i) => <p key={i} style={{ margin: 0 }}><Rich text={p} /></p>)}
      {a.bullets && <ul className="bullets">{a.bullets.map((b, i) => <li key={i}><Rich text={b} /></li>)}</ul>}
      {a.tree && (
        <div className="tree">
          {a.tree.map((t, i) => (
            <div key={i} className="tree-row" style={{ paddingLeft: t.depth * 22 }}>
              {t.depth > 0 && <span className="tree-line">└</span>}
              <b>{t.text}</b> <span className="muted small">{t.sub}</span>
            </div>
          ))}
        </div>
      )}
      {a.table && (
        <div className="table-wrap">
          <Table size="small">
            <TableHeader><TableRow>{a.table.columns.map((c) => <TableHeaderCell key={c}><b>{c}</b></TableHeaderCell>)}</TableRow></TableHeader>
            <TableBody>
              {a.table.rows.map((r, i) => <TableRow key={i}>{r.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}</TableRow>)}
            </TableBody>
          </Table>
        </div>
      )}
      {(a.sources.length > 0 || a.actions.length > 0) && (
        <div className="row">
          {a.sources.map((s) => <Badge key={s} appearance="outline" color="informative">{s}</Badge>)}
          {a.actions.map((x) => <Button key={x.to} size="small" appearance="subtle" onClick={() => navigate(x.to)}>{x.label} →</Button>)}
        </div>
      )}
      {a.scope.length > 0 && (
        <div className="scope">
          <LockClosed20Regular style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Answered only from data you're allowed to see.
          {a.scope.map((s, i) => <div key={i}>• {s}</div>)}
        </div>
      )}
    </div>
  );
}

export default function Assistant() {
  const { state } = useDemo();
  const me = useViewer();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const busy = msgs.some((m) => m.role === 'ai' && m.answer && m.step < m.answer.steps.length);

  useEffect(() => { setMsgs([]); }, [me.id]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);

  const send = (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const answer = ask(state, me.id, q);
    const id = Date.now();
    setMsgs((m) => [...m, { id, role: 'user', text: q, step: 0 }, { id: id + 1, role: 'ai', answer, step: 0 }]);
    setText('');
    answer.steps.forEach((_, i) => {
      setTimeout(() => setMsgs((m) => m.map((x) => (x.id === id + 1 ? { ...x, step: i + 1 } : x))), 450 * (i + 1));
    });
  };

  const suggestions = suggestionsFor(state, me.id);

  return (
    <div className="chat-wrap">
      <div className="chat-log" ref={logRef}>
        {msgs.length === 0 && (
          <div className="chat-empty">
            <div className="chat-hero"><BotSparkle20Regular /></div>
            <h1>{greeting()}, {me.name.split(' ')[0]}</h1>
            <p className="muted">Ask me anything about your emails, chats, files, tasks, leaves, people or leads. I only use data your role allows you to see.</p>
            <div className="chip-row" style={{ justifyContent: 'center', marginTop: 16 }}>
              {suggestions.map((s) => <Button key={s} shape="circular" onClick={() => send(s)}>{s}</Button>)}
            </div>
          </div>
        )}
        {msgs.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="bubble-user">{m.text}</div>
          ) : (
            <div key={m.id} className="bubble-ai">
              {m.answer && m.step < m.answer.steps.length ? (
                <div className="stack" style={{ gap: 6 }}>
                  {m.answer.steps.map((st, i) => (
                    <div key={st} className={`step ${i < m.step ? 'done' : i === m.step ? 'now' : ''}`}>
                      {i < m.step ? <Checkmark20Regular /> : i === m.step ? <Spinner size="extra-tiny" /> : <span style={{ width: 20 }} />}
                      {st}
                    </div>
                  ))}
                </div>
              ) : m.answer && <AnswerView a={m.answer} />}
            </div>
          ),
        )}
      </div>
      {msgs.length > 0 && (
        <div className="chip-row" style={{ marginBottom: 8 }}>
          {suggestions.slice(0, 4).map((s) => <Button key={s} size="small" shape="circular" appearance="subtle" onClick={() => send(s)} disabled={busy}>{s}</Button>)}
        </div>
      )}
      <div className="composer">
        <Textarea
          value={text}
          onChange={(_, d) => setText(d.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text); } }}
          placeholder="Ask anything… e.g. “What's happening in Noida?”"
          resize="none"
          appearance="filled-lighter"
          style={{ flex: 1 }}
        />
        <Button appearance="primary" icon={<Send20Filled />} onClick={() => send(text)} disabled={!text.trim() || busy} aria-label="Send" />
      </div>
    </div>
  );
}
