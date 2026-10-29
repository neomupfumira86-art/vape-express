import { useEffect, useMemo, useRef, useState } from 'react';
import { getProduct, listProducts, createProduct, updateProduct, uploadImage, removeImagesIfUnused, storagePath, IMAGE_ACCEPT } from './data.js';
import { go, Field, Loading } from './ui.jsx';

let keySeq = 0;
const flavourRow = (f = {}) => ({ key: ++keySeq, name: f.name ?? '', nicotine: f.nicotine ?? '', available: f.available !== false });

const toForm = (p, notes = '') => ({
  name: p.name ?? '',
  brand: p.brand ?? '',
  category: p.category ?? '',
  description: p.description ?? '',
  price: p.price == null ? '' : String(Number(p.price)),
  puffs: p.puffs == null ? '' : String(p.puffs),
  nicotine: p.nicotine ?? '',
  flavours: (p.flavours?.length ? p.flavours : [{}]).map(flavourRow),
  image: p.image ?? '',
  hero_image: p.hero_image ?? '',
  in_stock: p.in_stock ?? true,
  active: p.active ?? true,
  featured: p.featured ?? false,
  is_new: p.is_new ?? false,
  sort_order: String(p.sort_order ?? 0),
  notes,
});

// Comparable snapshot for "unsaved changes" (ignores React keys).
const snapshot = (f) => JSON.stringify({ ...f, flavours: f.flavours.map(({ key, ...rest }) => rest) });

const cleanPrice = (v) => v.replace(/[$\s,]|us\$?|usd/gi, '');

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Enter the product name.';
  else if (f.name.trim().length > 120) e.name = 'Keep the name under 120 characters.';
  if (f.brand.length > 60) e.brand = 'Keep the brand under 60 characters.';
  if (f.category.length > 80) e.category = 'Keep the type under 80 characters.';
  if (f.description.length > 1200) e.description = 'Keep the description under 1,200 characters.';
  const price = cleanPrice(f.price);
  if (price && !/^\d{1,5}(\.\d{1,2})?$/.test(price)) e.price = 'Enter a price in US dollars, like 15 or 12.50.';
  else if (price && Number(price) <= 0) e.price = 'The price must be more than 0. Leave it empty if it isn’t confirmed yet.';
  const puffs = f.puffs.replace(/[,\s]/g, '');
  if (puffs && (!/^\d{1,6}$/.test(puffs) || Number(puffs) <= 0)) e.puffs = 'Enter the puff count as a whole number, like 12000.';
  if (f.nicotine.length > 30) e.nicotine = 'Keep this short, like 5% or 2%.';
  const names = f.flavours.map((x) => x.name.trim().toLowerCase());
  if (!f.flavours.length) e.flavours = 'Add at least one flavour.';
  f.flavours.forEach((x, i) => {
    if (!x.name.trim()) e[`flv-${x.key}`] = 'Enter the flavour name or remove this row.';
    else if (names.indexOf(names[i]) !== i) e[`flv-${x.key}`] = 'This flavour is listed twice.';
    else if (x.nicotine.length > 30) e[`flv-${x.key}`] = 'Keep the nicotine value short, like 5%.';
  });
  if (!/^-?\d{1,6}$/.test(f.sort_order.trim())) e.sort_order = 'Enter a whole number, like 10.';
  if (f.notes.length > 2000) e.notes = 'Keep notes under 2,000 characters.';
  return e;
}

const toRow = (f) => ({
  name: f.name.trim(),
  brand: f.brand.trim(),
  category: f.category.trim(),
  description: f.description.trim(),
  price: cleanPrice(f.price) ? Number(cleanPrice(f.price)) : null,
  puffs: f.puffs.replace(/[,\s]/g, '') ? Number(f.puffs.replace(/[,\s]/g, '')) : null,
  nicotine: f.nicotine.trim(),
  flavours: f.flavours.map((x) => ({ name: x.name.trim(), nicotine: x.nicotine.trim() || null, available: x.available })),
  image: f.image,
  hero_image: f.hero_image || null,
  in_stock: f.in_stock,
  active: f.active,
  featured: f.featured,
  is_new: f.is_new,
  sort_order: Number(f.sort_order.trim()),
});

export default function ProductEditor({ id, copyFrom, notify }) {
  const isNew = !id;
  const [form, setForm] = useState(null);
  const [base, setBase] = useState('');
  const [original, setOriginal] = useState(null);
  const [all, setAll] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const uploads = useRef(new Set()); // images uploaded in this session but not saved yet
  const formRef = useRef(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const list = await listProducts();
        let f;
        if (id) {
          const { product, notes } = await getProduct(id);
          if (!product) throw new Error('This product doesn’t exist any more. It may have been deleted.');
          setOriginal(product);
          f = toForm(product, notes);
        } else if (copyFrom) {
          const { product, notes } = await getProduct(copyFrom);
          if (!product) throw new Error('The product you tried to duplicate doesn’t exist any more.');
          f = { ...toForm(product, notes), name: `${product.name} (copy)`, active: false, sort_order: String(product.sort_order + 1) };
        } else {
          f = toForm({ sort_order: Math.max(0, ...list.map((p) => p.sort_order)) + 10, flavours: [{}] });
        }
        if (!live) return;
        setAll(list);
        setForm(f);
        setBase(isNew ? '' : snapshot(f));
      } catch (e) {
        if (live) setLoadError(e.message);
      }
    })();
    return () => { live = false; };
  }, [id, copyFrom, isNew]);

  const dirty = form && snapshot(form) !== base;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Live re-validation once a save has been attempted.
  useEffect(() => {
    if (!form || !showErrors) return;
    const found = validate(form);
    setErrors(found);
    if (!Object.keys(found).length) setSaveError('');
  }, [form, showErrors]);

  const brands = useMemo(() => [...new Set(all.map((p) => p.brand).filter(Boolean))].sort(), [all]);
  const categories = useMemo(() => [...new Set(all.map((p) => p.category).filter(Boolean))].sort(), [all]);

  if (loadError) {
    return (
      <div className="adm-stack">
        <p className="adm-alert" role="alert">{loadError}</p>
        <button className="btn btn--line" onClick={() => go('/admin')}>Back to products</button>
      </div>
    );
  }
  if (!form) return <Loading text="Loading product…" />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setFlavour = (key, k, v) => setForm((f) => ({ ...f, flavours: f.flavours.map((x) => (x.key === key ? { ...x, [k]: v } : x)) }));
  const err = (k) => (showErrors ? errors[k] : undefined);

  async function cancel() {
    if (dirty && !window.confirm('Leave without saving? Your changes to this product will be lost.')) return;
    await removeImagesIfUnused([...uploads.current], all);
    uploads.current.clear();
    go('/admin');
  }

  async function save(e) {
    e.preventDefault();
    setSaveError('');
    const found = validate(form);
    setErrors(found);
    setShowErrors(true);
    const first = Object.keys(found)[0];
    if (first) {
      const el = formRef.current?.querySelector(`#${first === 'flavours' ? 'add-flavour' : first}`);
      el?.focus();
      setSaveError(`Please fix ${Object.keys(found).length === 1 ? 'the highlighted field' : `the ${Object.keys(found).length} highlighted fields`} before saving.`);
      return;
    }
    setSaving(true);
    try {
      const row = toRow(form);
      const saved = isNew ? await createProduct(row, form.notes) : await updateProduct(id, row, form.notes);
      // Clean up photos this product no longer uses (only dashboard uploads, never the site's own images).
      const kept = new Set([saved.image, saved.hero_image]);
      const stale = [...uploads.current, original?.image, original?.hero_image].filter((u) => u && !kept.has(u));
      await removeImagesIfUnused(stale, [...all.filter((p) => p.id !== saved.id), saved]);
      uploads.current.clear();
      const next = toForm(saved, form.notes);
      setForm(next);
      setBase(snapshot(next));
      setOriginal(saved);
      setShowErrors(false);
      notify(isNew ? `Added ${saved.name}${saved.active ? ' — it’s live in the store' : ' (hidden until you show it)'}` : `Saved ${saved.name}${saved.active ? ' — the store is up to date' : ''}`);
      if (isNew) go(`/admin/products/${saved.id}`);
    } catch (e2) {
      setSaveError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  const errorCount = showErrors ? Object.keys(errors).length : 0;

  return (
    <form ref={formRef} className="adm-editor" onSubmit={save} noValidate>
      <div className="adm-pagehead">
        <div>
          <button type="button" className="linkbtn" onClick={cancel}>← All products</button>
          <h1 className="adm-title">{isNew ? (copyFrom ? 'Duplicate product' : 'Add product') : form.name || 'Edit product'}</h1>
          {copyFrom && <p className="adm-muted">This copy starts hidden. Change what’s different, save, then switch on “Show in store”.</p>}
        </div>
      </div>

      <section className="adm-card" aria-labelledby="sec-basics">
        <h2 className="adm-card__title" id="sec-basics">Basics</h2>
        <Field id="name" label="Product name" error={err('name')}>
          {(a) => <input {...a} className="adm-input" value={form.name} onChange={set('name')} maxLength={120} />}
        </Field>
        <div className="adm-grid2">
          <Field id="brand" label="Brand" hint="Pick an existing brand or type a new one." error={err('brand')}>
            {(a) => <input {...a} className="adm-input" list="brand-list" value={form.brand} onChange={set('brand')} maxLength={60} />}
          </Field>
          <Field id="category" label="Type" hint="For example Disposable, Refill pod, Starter kit." error={err('category')}>
            {(a) => <input {...a} className="adm-input" list="category-list" value={form.category} onChange={set('category')} maxLength={80} />}
          </Field>
        </div>
        <datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist>
        <datalist id="category-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        <Field id="description" label="Description" optional hint="Shown in the product details window. Keep it factual — no health claims." error={err('description')}>
          {(a) => <textarea {...a} className="adm-input adm-textarea" rows={3} value={form.description} onChange={set('description')} maxLength={1200} />}
        </Field>
      </section>

      <section className="adm-card" aria-labelledby="sec-price">
        <h2 className="adm-card__title" id="sec-price">Price and details</h2>
        <div className="adm-grid3">
          <Field id="price" label="Price (US$)" hint="Leave empty to show “Price on request”." error={err('price')}>
            {(a) => <input {...a} className="adm-input" inputMode="decimal" placeholder="e.g. 15" value={form.price} onChange={set('price')} />}
          </Field>
          <Field id="puffs" label="Puffs" optional hint="Whole number, e.g. 12000." error={err('puffs')}>
            {(a) => <input {...a} className="adm-input" inputMode="numeric" value={form.puffs} onChange={set('puffs')} />}
          </Field>
          <Field id="nicotine" label="Nicotine" optional hint="Applies to every flavour unless a flavour says otherwise. Type CONFIRM if unverified." error={err('nicotine')}>
            {(a) => <input {...a} className="adm-input" placeholder="e.g. 5%" value={form.nicotine} onChange={set('nicotine')} maxLength={30} />}
          </Field>
        </div>
      </section>

      <section className="adm-card" aria-labelledby="sec-photo">
        <h2 className="adm-card__title" id="sec-photo">Photos</h2>
        <div className="adm-grid2">
          <ImageField
            id="image"
            label="Product photo"
            hint="Square photos look best. JPG, PNG or WebP — it’s resized automatically."
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            onUploaded={(url) => uploads.current.add(url)}
          />
          <ImageField
            id="hero_image"
            label="Large home-page photo"
            optional
            hint="Only used when this is the first featured product. Uses the product photo if empty."
            value={form.hero_image}
            onChange={(url) => setForm((f) => ({ ...f, hero_image: url }))}
            onUploaded={(url) => uploads.current.add(url)}
          />
        </div>
      </section>

      <section className="adm-card" aria-labelledby="sec-flavours">
        <h2 className="adm-card__title" id="sec-flavours">Flavours</h2>
        <p className="adm-hint">Untick “In stock” for a flavour that’s sold out — customers still see it but can’t choose it. Leave nicotine empty to use the product’s nicotine ({form.nicotine || 'none set'}).</p>
        {err('flavours') && <p className="adm-error">{err('flavours')}</p>}
        <ol className="adm-flavours">
          {form.flavours.map((x, i) => (
            <li key={x.key} className="adm-flavour">
              <span className="adm-flavour__n mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="adm-flavour__fields">
                <label className="adm-flavour__name">
                  <span className="sr-only">Flavour {i + 1} name</span>
                  <input
                    id={`flv-${x.key}`}
                    className="adm-input"
                    placeholder="Flavour name"
                    value={x.name}
                    maxLength={80}
                    aria-invalid={err(`flv-${x.key}`) ? 'true' : undefined}
                    aria-describedby={err(`flv-${x.key}`) ? `flv-${x.key}-err` : undefined}
                    onChange={(e) => setFlavour(x.key, 'name', e.target.value)}
                  />
                </label>
                <label className="adm-flavour__nic">
                  <span className="sr-only">Flavour {i + 1} nicotine</span>
                  <input className="adm-input" placeholder={form.nicotine ? `Nicotine (${form.nicotine})` : 'Nicotine'} value={x.nicotine} maxLength={30} onChange={(e) => setFlavour(x.key, 'nicotine', e.target.value)} />
                </label>
                <label className="adm-check">
                  <input type="checkbox" checked={x.available} onChange={(e) => setFlavour(x.key, 'available', e.target.checked)} />
                  <span>In stock</span>
                </label>
                <button
                  type="button"
                  className="btn btn--icon btn--line"
                  aria-label={`Remove flavour ${x.name || i + 1}`}
                  disabled={form.flavours.length === 1}
                  onClick={() => setForm((f) => ({ ...f, flavours: f.flavours.filter((y) => y.key !== x.key) }))}
                >
                  ✕
                </button>
              </div>
              {err(`flv-${x.key}`) && <p className="adm-error" id={`flv-${x.key}-err`}>{err(`flv-${x.key}`)}</p>}
            </li>
          ))}
        </ol>
        <button
          type="button"
          id="add-flavour"
          className="btn btn--line"
          onClick={() => {
            const row = flavourRow();
            setForm((f) => ({ ...f, flavours: [...f.flavours, row] }));
            requestAnimationFrame(() => document.getElementById(`flv-${row.key}`)?.focus());
          }}
        >
          + Add flavour
        </button>
      </section>

      <section className="adm-card" aria-labelledby="sec-status">
        <h2 className="adm-card__title" id="sec-status">Status and order</h2>
        <div className="adm-switches">
          <Switch id="active" checked={form.active} onChange={set('active')} label="Show in store" hint="Off = hidden from customers, kept here for later." />
          <Switch id="in_stock" checked={form.in_stock} onChange={set('in_stock')} label="In stock" hint="Off = shown as out of stock; nobody can add it to the cart." />
          <Switch id="featured" checked={form.featured} onChange={set('featured')} label="Featured" hint="Shown in “Top picks” on the home page (first 3 featured)." />
          <Switch id="is_new" checked={form.is_new} onChange={set('is_new')} label="Mark as new" hint="Adds a “New” tag on the product." />
        </div>
        <Field id="sort_order" label="Display order" hint="Lower numbers appear first. You can also use the ↑ ↓ buttons on the product list." error={err('sort_order')} className="adm-field--narrow">
          {(a) => <input {...a} className="adm-input" inputMode="numeric" value={form.sort_order} onChange={set('sort_order')} />}
        </Field>
      </section>

      <section className="adm-card" aria-labelledby="sec-notes">
        <h2 className="adm-card__title" id="sec-notes">Private notes</h2>
        <Field id="notes" label="Notes for the owner" optional hint="Never shown on the website. Use it for things to check, suppliers, etc." error={err('notes')}>
          {(a) => <textarea {...a} className="adm-input adm-textarea" rows={3} value={form.notes} onChange={set('notes')} maxLength={2000} />}
        </Field>
      </section>

      <div className="adm-savebar">
        <div className="adm-savebar__inner">
          <p className="adm-savebar__state" role="status">
            {saving ? 'Saving…' : saveError ? <span className="adm-error-text">{saveError}</span> : errorCount ? `${errorCount} field${errorCount === 1 ? '' : 's'} to fix` : dirty ? 'Unsaved changes' : isNew ? '' : 'All changes saved'}
          </p>
          <button type="button" className="btn btn--line" onClick={cancel} disabled={saving}>{dirty ? 'Cancel' : 'Back'}</button>
          <button type="submit" className="btn btn--ink" disabled={saving || (!dirty && !isNew)}>{saving ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}</button>
        </div>
      </div>
    </form>
  );
}

function Switch({ id, checked, onChange, label, hint }) {
  return (
    <label className="adm-switch" htmlFor={id}>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={onChange} aria-describedby={`${id}-hint`} />
      <span className="adm-switch__track" aria-hidden="true" />
      <span className="adm-switch__text">
        <strong>{label}</strong>
        <span id={`${id}-hint`} className="adm-hint">{hint}</span>
      </span>
    </label>
  );
}

function ImageField({ id, label, hint, optional, value, onChange, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef(null);

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adm-field">
      <span className="adm-label" id={`${id}-label`}>{label} {optional && <span className="adm-opt">Optional</span>}</span>
      <p className="adm-hint" id={`${id}-hint`}>{hint}</p>
      <div className="adm-image" aria-busy={busy || undefined}>
        <div className="adm-image__preview">
          {value ? <img src={value} alt={`Current ${label.toLowerCase()}`} /> : <span className="adm-muted">No photo yet</span>}
          {busy && <span className="adm-image__busy"><span className="adm-spinner" aria-hidden="true" /> Uploading…</span>}
        </div>
        <div className="adm-row">
          <input ref={input} id={id} type="file" accept={IMAGE_ACCEPT} className="sr-only" onChange={pick} aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} tabIndex={-1} />
          <button type="button" className="btn btn--line" disabled={busy} onClick={() => input.current.click()}>
            {value ? 'Replace photo' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" className="btn btn--line" disabled={busy} onClick={() => onChange('')}>Remove</button>
          )}
        </div>
        {value && !storagePath(value) && <p className="adm-hint">This photo is part of the website itself. Replacing it here won’t delete the original.</p>}
      </div>
      {error && <p className="adm-error" role="alert">{error}</p>}
    </div>
  );
}
