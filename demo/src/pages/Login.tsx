import { Avatar, Badge, Button, Spinner } from '@fluentui/react-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personById } from '../data/people';
import { PERSONAS } from '../data/setup';
import { rolesOf } from '../lib/access';
import { useDemo } from '../lib/store';

function MsLogo() {
  return (
    <span className="ms-logo" aria-hidden>
      <i style={{ background: '#f25022' }} /><i style={{ background: '#7fba00' }} />
      <i style={{ background: '#00a4ef' }} /><i style={{ background: '#ffb900' }} />
    </span>
  );
}

export default function Login() {
  const { state, update } = useDemo();
  const navigate = useNavigate();
  const [picking, setPicking] = useState(false);
  const [signingIn, setSigningIn] = useState<string | null>(null);

  const signIn = (id: string) => {
    setSigningIn(id);
    setTimeout(() => {
      update((s) => ({ ...s, userId: id }));
      navigate('/');
    }, 700);
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="row" style={{ gap: 10, marginBottom: 20 }}>
          <MsLogo />
          <span style={{ fontWeight: 600, color: '#5e5e5e' }}>Microsoft</span>
        </div>
        {!picking ? (
          <>
            <h2>UnifyCloud Second Brain</h2>
            <p className="muted" style={{ marginBottom: 24 }}>
              Your company's AI-powered second brain. Sign in with your UnifyCloud Microsoft work account.
            </p>
            <Button appearance="primary" size="large" icon={<MsLogo />} onClick={() => setPicking(true)} style={{ width: '100%' }}>
              Sign in with Microsoft
            </Button>
            <p className="muted small" style={{ marginTop: 16 }}>
              In the real app this is automatic: if you're already signed in to Microsoft 365 in this browser, you go straight in (single sign-on).
            </p>
          </>
        ) : (
          <>
            <h2>Pick an account</h2>
            <p className="muted small" style={{ marginBottom: 12 }}>Demo: choose who you want to be. Each person has different access.</p>
            <div className="stack" style={{ gap: 4 }}>
              {PERSONAS.map(({ id, story }) => {
                const p = personById(id)!;
                const roles = rolesOf(state, id).filter((r) => !r.everyone);
                return (
                  <button key={id} className="account" onClick={() => signIn(id)} disabled={!!signingIn}>
                    <Avatar name={p.name} size={36} color="colorful" />
                    <span className="account-text">
                      <span className="row" style={{ gap: 6 }}>
                        <b>{p.name}</b>
                        {(roles.length ? roles : [{ id: 'employee', name: 'Employee' }]).map((r) => (
                          <Badge key={r.id} appearance="tint" size="small" color={r.id === 'admin' ? 'danger' : 'brand'}>{r.name}</Badge>
                        ))}
                      </span>
                      <span className="muted small">{p.jobTitle} · {p.location} · {p.email}</span>
                      <span className="small">{story}</span>
                    </span>
                    {signingIn === id && <Spinner size="tiny" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
