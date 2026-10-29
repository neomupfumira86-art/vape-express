import { useEffect, useMemo, useState } from 'react';
import { listProducts, updateProduct, deleteProduct } from './data.js';
import { go, Loading, ConfirmDialog } from './ui.jsx';
import { money } from '../lib/format.js';

const STATUS = {
  all: ['All products', () => true],
  visible: ['Visible in store', (p) => p.active],
  hidden: ['Hidden', (p) => !p.active],
  out: ['Out of stock', (p) => !p.in_stock || (p.flavours ?? []).every((f) => f.available === false)],
  featured: ['Featured (top picks)', (p) => p.featured],
  new: ['Marked new', (p) => p.is_new],
};

export default function ProductList({ notify }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setError('');
    listProducts().then(setRows).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const brands = useMemo(() => [...new Set((rows ?? []).map((p) => p.brand).filter(Boolean))].sort(), [rows]);
  const categories = useMemo(() => [...new Set((rows ?? []).map((p) => p.category).filter(Boolean))].sort(), [rows]);
  const filtered = q || brand !== 'all' || category !== 'all' || status !== 'all';

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (rows ?? [])
      .filter((p) => brand === 'all' || p.brand === brand)
      .filter((p) => category === 'all' || p.category === category)
      .filter(STATUS[status][1])
      .filter((p) => !term || [p.name, p.brand, p.category, ...(p.flavours ?? []).map((f) => f.name)].join(' ').toLowerCase().includes(term));
  }, [rows, q, brand, category, status]);

  async function patch(p, change, message) {
    setBusyId(p.id);
    try {
      const saved = await updateProduct(p.id, change);
      setRows((list) => list.map((x) => (x.id === p.id ? saved : x)));
      notify(message);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  // Swap display order with the neighbour (only offered when the full list is shown).
  async function move(i, dir) {
    const a = rows[i];
    const b = rows[i + dir];
    if (!a || !b) return;
    setBusyId(a.id);
    try {
      let [oa, ob] = [b.sort_order, a.sort_order];
      if (oa === ob) [oa, ob] = dir < 0 ? [a.sort_order - 1, a.sort_order] : [a.sort_order + 1, a.sort_order];
      const [sa, sb] = await Promise.all([updateProduct(a.id, { sort_order: oa }), updateProduct(b.id, { sort_order: ob })]);
      setRows((list) => {
        const next = list.map((x) => (x.id === sa.id ? sa : x.id === sb.id ? sb : x));
        return next.sort((x, y) => x.sort_order - y.sort_order || x.name.localeCompare(y.name));
      });
      notify(`Moved ${a.name} ${dir < 0 ? 'up' : 'down'}`);
    } catch (e) {
      notify(e.message, 'error');
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteProduct(toDelete, rows);
      setRows((list) => list.filter((x) => x.id !== toDelete.id));
      notify(`Deleted ${toDelete.name}`);
      setToDelete(null);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="adm-pagehead">
        <div>
          <h1 className="adm-title">Products</h1>
          <p className="adm-muted">{rows ? `${rows.filter((p) => p.active).length} visible in the store · ${rows.length} in total` : 'Loading…'}</p>
        </div>
        <button className="btn btn--ink btn--lg" onClick={() => go('/admin/products/new')}>+ Add product</button>
      </div>

      <div className="adm-filters" role="search">
        <label className="adm-filters__search">
          <span className="sr-only">Search products or flavours</span>
          <input className="adm-input" type="search" placeholder="Search products or flavours" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label>
          <span className="sr-only">Brand</span>
          <select className="adm-input adm-select" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="all">All brands</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Category</span>
          <select className="adm-input adm-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All types</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select className="adm-input adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
      </div>

      {error && (
        <div className="adm-alert" role="alert">
          {error} <button className="linkbtn" onClick={load}>Try again</button>
        </div>
      )}
      {!rows && !error && <Loading text="Loading products…" />}

      {rows && (
        <>
          <p className="adm-count mono" aria-live="polite">
            {filtered ? `${shown.length} of ${rows.length} products` : `${rows.length} products — shown in store order`}
            {filtered && <button className="linkbtn" onClick={() => { setQ(''); setBrand('all'); setCategory('all'); setStatus('all'); }}>Clear filters</button>}
          </p>
          {shown.length === 0 && <p className="adm-empty">{rows.length ? 'No products match these filters.' : 'No products yet. Add your first one.'}</p>}
          <ul className="adm-list">
            {shown.map((p) => {
              const i = rows.indexOf(p);
              const soldOut = !p.in_stock || (p.flavours ?? []).every((f) => f.available === false);
              const busy = busyId === p.id;
              return (
                <li key={p.id} className={`adm-prod ${p.active ? '' : 'is-hidden'}`} aria-busy={busy || undefined}>
                  <img className="adm-prod__img" src={p.image || '/brand/logo.webp'} alt="" width="72" height="72" loading="lazy" />
                  <div className="adm-prod__main">
                    <h2 className="adm-prod__name">
                      <a href={`/admin/products/${p.id}`} onClick={(e) => { e.preventDefault(); go(`/admin/products/${p.id}`); }}>{p.name}</a>
                    </h2>
                    <p className="adm-prod__meta">{[p.brand, p.category].filter(Boolean).join(' · ') || 'No brand or type yet'}</p>
                    <p className="adm-prod__meta">
                      <strong>{p.price == null ? 'Price to confirm' : money(Number(p.price))}</strong> · {(p.flavours ?? []).length} flavour{(p.flavours ?? []).length === 1 ? '' : 's'}
                    </p>
                    <div className="adm-badges">
                      {p.active ? <span className="adm-badge adm-badge--ok">Visible</span> : <span className="adm-badge adm-badge--off">Hidden</span>}
                      {soldOut ? <span className="adm-badge adm-badge--warn">Out of stock</span> : <span className="adm-badge">In stock</span>}
                      {p.featured && <span className="adm-badge adm-badge--blue">Featured</span>}
                      {p.is_new && <span className="adm-badge adm-badge--blue">New</span>}
                    </div>
                  </div>
                  <div className="adm-prod__actions">
                    <button className="btn btn--ink" onClick={() => go(`/admin/products/${p.id}`)} aria-label={`Edit ${p.name}`}>Edit</button>
                    <button className="btn btn--line" disabled={busy} onClick={() => patch(p, { active: !p.active }, p.active ? `${p.name} is now hidden from the store` : `${p.name} is now visible in the store`)} aria-label={`${p.active ? 'Hide' : 'Show'} ${p.name}`}>
                      {p.active ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn btn--line" onClick={() => go(`/admin/products/new?from=${p.id}`)} aria-label={`Duplicate ${p.name}`}>Duplicate</button>
                    <button className="btn btn--line adm-btn--danger-line" onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`}>Delete</button>
                    {!filtered && (
                      <span className="adm-move">
                        <button className="btn btn--icon btn--line" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${p.name} up`}>↑</button>
                        <button className="btn btn--icon btn--line" disabled={busy || i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${p.name} down`}>↓</button>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product?"
        confirmLabel="Delete product"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        {toDelete && (
          <>
            <p><strong>{toDelete.name}</strong> will be removed from the store and from this dashboard. This can’t be undone.</p>
            <p className="adm-muted">To take it down for a while instead, cancel and use <strong>Hide</strong>.</p>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
