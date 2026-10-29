import { useCallback, useEffect, useState } from 'react';
import { supabase, arrivedVia } from './supabase.js';
import { go } from './ui.jsx';
import Logo from '../components/Logo.jsx';
import ProductList from './ProductList.jsx';
import ProductEditor from './ProductEditor.jsx';
import Settings from './Settings.jsx';
import Team from './Team.jsx';
import { SignIn, SetPassword } from './Auth.jsx';
import './admin.css';

// Admin pages: /admin, /admin/products/new, /admin/products/:id, /admin/settings, /admin/team
function useAdminRoute() {
  const read = () => {
    const { pathname, search } = window.location;
    const path = pathname.replace(/\/+$/, '') || '/admin';
    const m = path.match(/^\/admin\/products\/([a-z0-9-]+)$/);
    if (path === '/admin/settings') return { page: 'settings' };
    if (path === '/admin/team') return { page: 'team' };
    if (m?.[1] === 'new') return { page: 'new', from: new URLSearchParams(search).get('from') };
    if (m) return { page: 'edit', id: m[1] };
    return { page: 'list' };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  return route;
}

function Toast({ toast }) {
  return (
    <div className="adm-toast" role="status" aria-live="polite">
      {toast && <span className={toast.tone === 'error' ? 'is-error' : ''}>{toast.text}</span>}
    </div>
  );
}

export default function AdminApp() {
  useEffect(() => {
    document.title = 'Admin | Vape Express';
    document.body.classList.add('adm-body');
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!supabase) return <NotConfigured />;
  return <Gate />;
}

function Gate() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [access, setAccess] = useState('checking'); // checking | admin | pending | denied | error
  const [needsPassword, setNeedsPassword] = useState(Boolean(arrivedVia));
  const [toast, setToast] = useState(null);
  const route = useAdminRoute();

  const notify = useCallback((text, tone = 'ok') => setToast({ text, tone, at: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.tone === 'error' ? 6000 : 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s ?? null);
      if (event === 'PASSWORD_RECOVERY') setNeedsPassword(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Signed in is not enough: the account must be listed in public.admins.
  const uid = session?.user?.id;
  useEffect(() => {
    if (!uid) return;
    let live = true;
    setAccess('checking');
    Promise.all([
      supabase.from('admins').select('user_id').eq('user_id', uid).maybeSingle(),
      supabase.from('admin_requests').select('user_id').eq('user_id', uid).maybeSingle(),
    ]).then(([a, r]) => {
      if (!live) return;
      if (a.error) return setAccess('error');
      setAccess(a.data ? 'admin' : r.data ? 'pending' : 'denied');
    });
    return () => { live = false; };
  }, [uid]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setNeedsPassword(false);
    go('/admin');
  };

  if (session === undefined) return <Splash text="Checking your sign-in…" />;
  if (!session) return <SignIn />;
  if (needsPassword) return <SetPassword email={session.user.email} invited={arrivedVia === 'invite'} onDone={() => { setNeedsPassword(false); notify('Password saved'); }} />;
  if (access === 'checking') return <Splash text="Checking admin access…" />;
  if (access !== 'admin') {
    return (
      <main className="adm-auth">
        <div className="adm-auth__panel">
          <Logo height={56} />
          <h1 className="adm-auth__title">{{ error: 'Couldn’t check access', pending: 'Waiting for approval', denied: 'No admin access' }[access]}</h1>
          <p className="adm-muted">
            {access === 'error'
              ? 'We couldn’t reach the database to check this account. Check your connection and reload the page.'
              : access === 'pending'
                ? `Your account (${session.user.email}) has been created. An existing admin needs to approve it in the Team tab before you can manage the store. Check back here afterwards.`
                : `${session.user.email} is signed in, but it isn’t an admin account for this store. Ask the store admin to approve it.`}
          </p>
          <div className="adm-row">
            {access !== 'denied' && <button className="btn btn--ink" onClick={() => window.location.reload()}>{access === 'pending' ? 'Check again' : 'Reload'}</button>}
            <button className="btn btn--line" onClick={signOut}>Sign out</button>
            <a className="btn btn--line" href="/">View store</a>
          </div>
        </div>
      </main>
    );
  }

  const tab = route.page === 'settings' || route.page === 'team' ? route.page : 'products';
  return (
    <div className="adm">
      <header className="adm-head">
        <div className="adm-wrap adm-head__inner">
          <a href="/admin" className="adm-head__brand" onClick={(e) => { e.preventDefault(); go('/admin'); }}>
            <Logo height={36} />
            <span className="mono">Store admin</span>
          </a>
          <div className="adm-head__actions">
            <a className="adm-head__link mono" href="/" target="_blank" rel="noopener">View store ↗</a>
            <button className="adm-head__link mono" onClick={signOut}>Sign out</button>
          </div>
        </div>
        <nav className="adm-wrap adm-tabs" aria-label="Admin sections">
          <a href="/admin" aria-current={tab === 'products' ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go('/admin'); }}>Products</a>
          <a href="/admin/settings" aria-current={tab === 'settings' ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go('/admin/settings'); }}>Store settings</a>
          <a href="/admin/team" aria-current={tab === 'team' ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go('/admin/team'); }}>Team</a>
        </nav>
      </header>

      <main className="adm-wrap adm-main" id="main">
        {route.page === 'list' && <ProductList notify={notify} />}
        {route.page === 'new' && <ProductEditor key={`new-${route.from ?? ''}`} copyFrom={route.from} notify={notify} />}
        {route.page === 'edit' && <ProductEditor key={route.id} id={route.id} notify={notify} />}
        {route.page === 'settings' && <Settings notify={notify} />}
        {route.page === 'team' && <Team notify={notify} me={session.user.id} />}
      </main>
      <p className="adm-wrap adm-foot mono">Signed in as {session.user.email}</p>
      <Toast toast={toast} />
    </div>
  );
}

export function Splash({ text }) {
  return (
    <main className="adm-auth" aria-busy="true">
      <p className="adm-loading" role="status"><span className="adm-spinner" aria-hidden="true" /> {text}</p>
    </main>
  );
}

function NotConfigured() {
  return (
    <main className="adm-auth">
      <div className="adm-auth__panel">
        <Logo height={56} />
        <h1 className="adm-auth__title">Admin isn’t connected yet</h1>
        <p className="adm-muted">
          This copy of the website doesn’t have its database settings. Add <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> in Vercel (Project → Settings → Environment Variables) and redeploy once.
          The README has step-by-step instructions.
        </p>
        <a className="btn btn--line" href="/">View store</a>
      </div>
    </main>
  );
}
