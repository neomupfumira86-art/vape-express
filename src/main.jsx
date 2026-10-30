import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applySettings, readCache } from './lib/settings.js';
import './styles.css';

// The admin dashboard is a separate bundle: shoppers never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));
// admin.yourdomain.com opens the dashboard directly (same files as the main site).
const onAdminHost = /^admin\./i.test(window.location.hostname);
if (onAdminHost && !/^\/admin(\/|$)/.test(window.location.pathname)) {
  window.location.replace('/admin' + window.location.search + window.location.hash);
}
const isAdmin = onAdminHost || /^\/admin(\/|$)/.test(window.location.pathname);

// Show the last known contact details straight away; fresh ones load with the products.
if (!isAdmin) applySettings(readCache()?.settings);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={<div className="adm-boot" role="status">Loading admin…</div>}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
