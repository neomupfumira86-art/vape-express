import { useState } from 'react';
import { supabase } from './supabase.js';
import { friendly } from './data.js';
import { Field } from './ui.jsx';
import Logo from '../components/Logo.jsx';

// Anyone can request an account here, but it has no rights until an existing
// admin approves it in the Team tab (enforced by the database, see README).
export function SignIn() {
  const [mode, setMode] = useState('signin'); // signin | signup | requested | reset | sent
  const [again, setAgain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter the email address of your admin account.');
    if (mode === 'signin' && !password) return setError('Enter your password.');
    if (mode === 'signup') {
      if (password.length < 10) return setError('Choose a password with at least 10 characters.');
      if (password !== again) return setError('The two passwords don’t match.');
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      } else if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
        if (err) throw err;
        // With email confirmation off Supabase signs the new account straight in;
        // the dashboard then shows "waiting for approval". Otherwise show it here.
        if (!data.session) setMode('requested');
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` });
        if (err) throw err;
        setMode('sent');
      }
    } catch (err) {
      const m = err?.message ?? '';
      setError(
        /invalid login credentials/i.test(m) ? 'That email and password don’t match an account.'
          : /email not confirmed/i.test(m) ? 'Your account is waiting for an admin to approve it. You’ll be able to sign in once they do.'
          : /already registered|already exists/i.test(m) ? 'There’s already an account with that email. Sign in instead, or reset the password.'
          : /signups? not allowed|signup.*disabled/i.test(m) ? 'New accounts are switched off for this store. Ask the store admin to invite you.'
          : /weak|pwned|leaked/i.test(m) ? 'That password is too easy to guess. Choose a longer one.'
          : /rate limit|too many/i.test(m) ? 'Too many attempts. Wait a few minutes and try again.'
          : friendly(err),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adm-auth">
      <form className="adm-auth__panel" onSubmit={submit} noValidate>
        <Logo height={56} />
        <p className="mono adm-kicker">Vape Express · Store admin</p>
        {(mode === 'signin' || mode === 'signup') && (
          <div className="adm-switcher" role="tablist" aria-label="Sign in or create an account">
            <button type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setError(''); }}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setError(''); }}>Sign up</button>
          </div>
        )}
        <h1 className="adm-auth__title">
          {{ signin: 'Sign in', signup: 'Create an admin account', requested: 'Request sent', reset: 'Reset password', sent: 'Check your email' }[mode]}
        </h1>

        {mode === 'requested' ? (
          <>
            <p className="adm-muted">Your account for <strong>{email.trim()}</strong> has been created and is <strong>waiting for approval</strong>. An existing admin will approve it, then you can sign in here with the password you chose.</p>
            <p className="adm-hint">You may also get a confirmation email from Supabase. Clicking it is optional.</p>
          </>
        ) : mode === 'sent' ? (
          <p className="adm-muted">If <strong>{email.trim()}</strong> belongs to an admin account, a link to set a new password is on its way. Open it on this device.</p>
        ) : (
          <>
            {mode === 'reset' && <p className="adm-muted">Enter your admin email and we’ll send you a link to choose a new password.</p>}
            {mode === 'signup' && <p className="adm-muted">For the store owner and staff. New accounts can’t change anything until an existing admin approves them.</p>}
            <Field id="email" label="Email">
              {(a) => <input {...a} className="adm-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />}
            </Field>
            {(mode === 'signin' || mode === 'signup') && (
              <Field id="password" label="Password" hint={mode === 'signup' ? 'At least 10 characters. A short sentence works well.' : undefined}>
                {(a) => <input {...a} className="adm-input" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />}
              </Field>
            )}
            {mode === 'signup' && (
              <Field id="password-again" label="Type the password again">
                {(a) => <input {...a} className="adm-input" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />}
              </Field>
            )}
            {error && <p className="adm-alert" role="alert">{error}</p>}
            <button className="btn btn--ink btn--lg btn--block" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : { signin: 'Sign in', signup: 'Create account', reset: 'Send reset link' }[mode]}
            </button>
          </>
        )}

        <div className="adm-row adm-row--between">
          {mode === 'signin' ? (
            <button type="button" className="linkbtn" onClick={() => { setMode('reset'); setError(''); }}>Forgot password?</button>
          ) : mode !== 'signup' ? (
            <button type="button" className="linkbtn" onClick={() => { setMode('signin'); setError(''); }}>Back to sign in</button>
          ) : <span />}
          <a className="linkbtn" href="/">View store</a>
        </div>
        <p className="adm-hint">This area is for the store owner and approved staff only.</p>
      </form>
    </main>
  );
}

// Shown after an invite or password-reset link.
// Shown after an invite/reset link, for a temporary password set by the site
// administrator (must_change_password), or from "Change password" in the dashboard.
export function SetPassword({ email, invited, temporary, onDone, onCancel }) {
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
    const { error: err } = await supabase.auth.updateUser({ password, data: { must_change_password: false } });
    setBusy(false);
    if (err) return setError(/weak|pwned|leaked/i.test(err.message) ? 'That password is too easy to guess. Choose a longer one.' : friendly(err));
    onDone();
  }

  return (
    <main className="adm-auth">
      <form className="adm-auth__panel" onSubmit={submit} noValidate>
        <Logo height={56} />
        <h1 className="adm-auth__title">{invited ? 'Welcome — choose a password' : temporary ? 'Choose your own password' : 'Choose a new password'}</h1>
        {temporary && <p className="adm-muted">You signed in with a temporary password. Choose your own now — the temporary one stops working once you save.</p>}
        <p className="adm-muted">For {email}. Use at least 10 characters; a short sentence is easy to remember and hard to guess.</p>
        <Field id="new-password" label="New password">
          {(a) => <input {...a} className="adm-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Field>
        <Field id="new-password-2" label="Type it again">
          {(a) => <input {...a} className="adm-input" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />}
        </Field>
        {error && <p className="adm-alert" role="alert">{error}</p>}
        <button className="btn btn--ink btn--lg btn--block" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
        {onCancel && <button type="button" className="linkbtn" onClick={onCancel}>Cancel — keep my current password</button>}
      </form>
    </main>
  );
}
