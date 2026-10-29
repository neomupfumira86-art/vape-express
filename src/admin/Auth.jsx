import { useState } from 'react';
import { supabase } from './supabase.js';
import { friendly } from './data.js';
import { Field } from './ui.jsx';
import Logo from '../components/Logo.jsx';

// No sign-up form on purpose: admin accounts are created by the site administrator (see README).
export function SignIn() {
  const [mode, setMode] = useState('signin'); // signin | reset | sent
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter the email address of your admin account.');
    if (mode === 'signin' && !password) return setError('Enter your password.');
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` });
        if (err) throw err;
        setMode('sent');
      }
    } catch (err) {
      setError(/invalid login credentials/i.test(err?.message) ? 'That email and password don’t match an admin account.' : /rate limit|too many/i.test(err?.message) ? 'Too many attempts. Wait a few minutes and try again.' : friendly(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adm-auth">
      <form className="adm-auth__panel" onSubmit={submit} noValidate>
        <Logo height={56} />
        <p className="mono adm-kicker">Vape Express · Store admin</p>
        <h1 className="adm-auth__title">{mode === 'signin' ? 'Sign in' : mode === 'reset' ? 'Reset password' : 'Check your email'}</h1>

        {mode === 'sent' ? (
          <p className="adm-muted">If <strong>{email.trim()}</strong> belongs to an admin account, a link to set a new password is on its way. Open it on this device.</p>
        ) : (
          <>
            {mode === 'reset' && <p className="adm-muted">Enter your admin email and we’ll send you a link to choose a new password.</p>}
            <Field id="email" label="Email">
              {(a) => <input {...a} className="adm-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />}
            </Field>
            {mode === 'signin' && (
              <Field id="password" label="Password">
                {(a) => <input {...a} className="adm-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
              </Field>
            )}
            {error && <p className="adm-alert" role="alert">{error}</p>}
            <button className="btn btn--ink btn--lg btn--block" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Send reset link'}
            </button>
          </>
        )}

        <div className="adm-row adm-row--between">
          {mode === 'signin' ? (
            <button type="button" className="linkbtn" onClick={() => { setMode('reset'); setError(''); }}>Forgot password?</button>
          ) : (
            <button type="button" className="linkbtn" onClick={() => { setMode('signin'); setError(''); }}>Back to sign in</button>
          )}
          <a className="linkbtn" href="/">View store</a>
        </div>
        <p className="adm-hint">This area is for the store owner only. There is no public sign-up.</p>
      </form>
    </main>
  );
}

// Shown after an invite or password-reset link.
export function SetPassword({ email, invited, onDone }) {
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 10) return setError('Use at least 10 characters.');
    if (password !== again) return setError('The two passwords don’t match.');
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(/weak|pwned|leaked/i.test(err.message) ? 'That password is too easy to guess. Choose a longer one.' : friendly(err));
    onDone();
  }

  return (
    <main className="adm-auth">
      <form className="adm-auth__panel" onSubmit={submit} noValidate>
        <Logo height={56} />
        <h1 className="adm-auth__title">{invited ? 'Welcome — choose a password' : 'Choose a new password'}</h1>
        <p className="adm-muted">For {email}. Use at least 10 characters; a short sentence is easy to remember and hard to guess.</p>
        <Field id="new-password" label="New password">
          {(a) => <input {...a} className="adm-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Field>
        <Field id="new-password-2" label="Type it again">
          {(a) => <input {...a} className="adm-input" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />}
        </Field>
        {error && <p className="adm-alert" role="alert">{error}</p>}
        <button className="btn btn--ink btn--lg btn--block" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </main>
  );
}
