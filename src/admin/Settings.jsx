import { useEffect, useRef, useState } from 'react';
import { getSettings, saveSettings, slugify, CONFIRM } from './data.js';
import { Field, Loading } from './ui.jsx';
import { business as defaults, delivery as deliveryDefaults, paymentMethods as methodDefaults } from '../config.js';

const DELIVERY = [
  ['fees', 'Delivery fees', 'e.g. US$2 within Harare CBD, US$3–5 to suburbs'],
  ['areas', 'Areas covered', 'e.g. All Harare suburbs, Chitungwiza on request'],
  ['times', 'Delivery times', 'e.g. Same day for orders before 4pm'],
  ['collection', 'Collection', 'e.g. Collection available in Avondale by arrangement'],
  ['minimumOrder', 'Minimum order', 'e.g. No minimum'],
  ['openingHours', 'Opening hours', 'e.g. Mon–Sat 9am–7pm'],
  ['returns', 'Returns', 'e.g. Faulty devices replaced within 24 hours'],
  ['warranty', 'Warranty', 'e.g. No warranty on disposables'],
];

let keySeq = 0;
const toForm = (s) => {
  const b = { ...defaults, ...(s?.business ?? {}) };
  const d = { ...deliveryDefaults, ...(s?.delivery ?? {}) };
  const methods = Array.isArray(s?.payment_methods) && s.payment_methods.length ? s.payment_methods : methodDefaults;
  return {
    tagline: b.tagline ?? '',
    whatsappDisplay: b.whatsappDisplay ?? '',
    instagramHandle: b.instagramHandle ?? '',
    instagramUrl: b.instagramUrl ?? '',
    area: d.area === CONFIRM ? '' : d.area ?? '',
    delivery: Object.fromEntries(DELIVERY.map(([k]) => [k, { text: d[k] === CONFIRM ? '' : d[k] ?? '', unconfirmed: !d[k] || d[k] === CONFIRM }])),
    methods: methods.map((m) => ({ key: ++keySeq, id: m.id, label: m.label, enabled: m.enabled !== false, confirmed: Boolean(m.confirmed) })),
  };
};
const snapshot = (f) => JSON.stringify({ ...f, methods: f.methods.map(({ key, ...m }) => m) });
const waDigits = (v) => v.replace(/\D/g, '');

function validate(f) {
  const e = {};
  const digits = waDigits(f.whatsappDisplay);
  if (digits.length < 11 || digits.length > 15) e.whatsappDisplay = 'Enter the full number with the country code, like +263 78 024 7322.';
  else if (digits.startsWith('0')) e.whatsappDisplay = 'Start with the country code (263 for Zimbabwe), not 0.';
  if (f.instagramUrl && !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/.test(f.instagramUrl.trim()))
    e.instagramUrl = 'Paste the full profile link, like https://www.instagram.com/vapeexpresszw/';
  if (f.instagramHandle && !/^@?[A-Za-z0-9._]{1,30}$/.test(f.instagramHandle.trim())) e.instagramHandle = 'Use the handle only, like @vapeexpresszw.';
  if (f.tagline.length > 80) e.tagline = 'Keep the tagline under 80 characters.';
  if (!f.area.trim()) e.area = 'Add one short sentence about where you deliver.';
  for (const [k, label] of DELIVERY) {
    const v = f.delivery[k];
    if (!v.unconfirmed && !v.text.trim()) e[`d-${k}`] = `Enter the ${label.toLowerCase()}, or tick “Not confirmed yet”.`;
    if (v.text.length > 300) e[`d-${k}`] = 'Keep this under 300 characters.';
  }
  f.methods.forEach((m) => {
    if (!m.label.trim()) e[`m-${m.key}`] = 'Enter a name for this payment option or remove it.';
  });
  if (!f.methods.some((m) => m.enabled && m.label.trim())) e.methods = 'Show at least one payment option at checkout.';
  return e;
}

function toPatch(f) {
  const digits = waDigits(f.whatsappDisplay);
  const handle = f.instagramHandle.trim();
  const ids = new Set();
  return {
    business: {
      tagline: f.tagline.trim(),
      whatsappDisplay: f.whatsappDisplay.trim(),
      whatsappNumber: digits,
      instagramHandle: handle && !handle.startsWith('@') ? `@${handle}` : handle,
      instagramUrl: f.instagramUrl.trim(),
    },
    delivery: {
      area: f.area.trim(),
      ...Object.fromEntries(DELIVERY.map(([k]) => [k, f.delivery[k].unconfirmed ? CONFIRM : f.delivery[k].text.trim()])),
    },
    payment_methods: f.methods.map((m) => {
      let id = m.id || slugify(m.label);
      while (ids.has(id)) id = `${id}-2`;
      ids.add(id);
      return { id, label: m.label.trim(), enabled: m.enabled, confirmed: m.confirmed };
    }),
  };
}

export default function Settings({ notify }) {
  const [form, setForm] = useState(null);
  const [base, setBase] = useState('');
  const [loadError, setLoadError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const ref = useRef(null);

  const load = () => {
    setLoadError('');
    getSettings()
      .then((s) => {
        if (!s) throw new Error('The settings row is missing. Run supabase/seed.sql once (see README).');
        const f = toForm(s);
        setForm(f);
        setBase(snapshot(f));
        setUpdatedAt(s.updated_at);
      })
      .catch((e) => setLoadError(e.message));
  };
  useEffect(load, []);

  const dirty = form && snapshot(form) !== base;
  // Clear the "fix the highlighted fields" message once everything is valid again.
  useEffect(() => {
    if (form && showErrors && !Object.keys(validate(form)).length) setSaveError('');
  }, [form, showErrors]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (loadError) return <p className="adm-alert" role="alert">{loadError} <button className="linkbtn" onClick={load}>Try again</button></p>;
  if (!form) return <Loading text="Loading settings…" />;

  const errors = showErrors ? validate(form) : {};
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setDelivery = (k, patch) => setForm((f) => ({ ...f, delivery: { ...f.delivery, [k]: { ...f.delivery[k], ...patch } } }));
  const setMethod = (key, patch) => setForm((f) => ({ ...f, methods: f.methods.map((m) => (m.key === key ? { ...m, ...patch } : m)) }));
  const digits = waDigits(form.whatsappDisplay);

  async function save(e) {
    e.preventDefault();
    setSaveError('');
    setShowErrors(true);
    const found = validate(form);
    const first = Object.keys(found)[0];
    if (first) {
      ref.current?.querySelector(`#${first === 'methods' ? 'add-method' : first}`)?.focus();
      setSaveError('Please fix the highlighted fields before saving.');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveSettings(toPatch(form));
      const f = toForm(saved);
      setForm(f);
      setBase(snapshot(f));
      setUpdatedAt(saved.updated_at);
      setShowErrors(false);
      notify('Settings saved — the store is up to date');
    } catch (e2) {
      setSaveError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={ref} className="adm-editor" onSubmit={save} noValidate>
      <div className="adm-pagehead">
        <div>
          <h1 className="adm-title">Store settings</h1>
          <p className="adm-muted">Contact details, delivery terms and payment options shown on the website.{updatedAt && ` Last saved ${new Date(updatedAt).toLocaleString()}.`}</p>
        </div>
      </div>

      <section className="adm-card" aria-labelledby="sec-contact">
        <h2 className="adm-card__title" id="sec-contact">Contact</h2>
        <Field id="whatsappDisplay" label="WhatsApp order number" hint="Every order and “Ask on WhatsApp” button goes to this number. Include the country code." error={errors.whatsappDisplay}>
          {(a) => <input {...a} className="adm-input" type="tel" inputMode="tel" value={form.whatsappDisplay} onChange={set('whatsappDisplay')} />}
        </Field>
        {digits.length >= 11 && (
          <p className="adm-hint">
            Orders will open: <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener">wa.me/{digits}</a> — tap to check it’s the right chat.
          </p>
        )}
        <div className="adm-grid2">
          <Field id="instagramHandle" label="Instagram handle" optional error={errors.instagramHandle}>
            {(a) => <input {...a} className="adm-input" value={form.instagramHandle} onChange={set('instagramHandle')} placeholder="@vapeexpresszw" />}
          </Field>
          <Field id="instagramUrl" label="Instagram profile link" optional error={errors.instagramUrl}>
            {(a) => <input {...a} className="adm-input" type="url" value={form.instagramUrl} onChange={set('instagramUrl')} placeholder="https://www.instagram.com/…" />}
          </Field>
        </div>
        <Field id="tagline" label="Tagline" hint="Shown in the intro, hero and footer." error={errors.tagline}>
          {(a) => <input {...a} className="adm-input" value={form.tagline} onChange={set('tagline')} maxLength={80} />}
        </Field>
      </section>

      <section className="adm-card" aria-labelledby="sec-delivery">
        <h2 className="adm-card__title" id="sec-delivery">Delivery</h2>
        <p className="adm-hint">Anything ticked “Not confirmed yet” shows on the Delivery page as “Confirm with owner”, so customers know to ask. Only enter terms you actually offer.</p>
        <Field id="area" label="Where you deliver (one sentence)" error={errors.area}>
          {(a) => <input {...a} className="adm-input" value={form.area} onChange={set('area')} maxLength={160} />}
        </Field>
        {DELIVERY.map(([k, label, example]) => {
          const v = form.delivery[k];
          return (
            <div key={k} className="adm-field adm-term">
              <div className="adm-term__head">
                <label className="adm-label" htmlFor={`d-${k}`}>{label}</label>
                <label className="adm-check">
                  <input type="checkbox" checked={v.unconfirmed} onChange={(e) => setDelivery(k, { unconfirmed: e.target.checked })} />
                  <span>Not confirmed yet</span>
                </label>
              </div>
              <textarea
                id={`d-${k}`}
                className="adm-input adm-textarea"
                rows={2}
                placeholder={example}
                value={v.text}
                disabled={v.unconfirmed}
                maxLength={300}
                aria-invalid={errors[`d-${k}`] ? 'true' : undefined}
                aria-describedby={errors[`d-${k}`] ? `d-${k}-err` : undefined}
                onChange={(e) => setDelivery(k, { text: e.target.value })}
              />
              {errors[`d-${k}`] && <p className="adm-error" id={`d-${k}-err`}>{errors[`d-${k}`]}</p>}
            </div>
          );
        })}
      </section>

      <section className="adm-card" aria-labelledby="sec-pay">
        <h2 className="adm-card__title" id="sec-pay">Payment preferences</h2>
        <p className="adm-hint">Customers pick one at checkout so you know how they’d like to pay. The website never takes payment or asks for card details. Tick “Confirmed” once you’re sure you accept it — otherwise it shows “Confirm with owner”.</p>
        {errors.methods && <p className="adm-error">{errors.methods}</p>}
        <ul className="adm-methods">
          {form.methods.map((m, i) => (
            <li key={m.key} className="adm-method">
              <label className="adm-method__name">
                <span className="sr-only">Payment option {i + 1}</span>
                <input
                  id={`m-${m.key}`}
                  className="adm-input"
                  value={m.label}
                  maxLength={60}
                  placeholder="e.g. EcoCash"
                  aria-invalid={errors[`m-${m.key}`] ? 'true' : undefined}
                  onChange={(e) => setMethod(m.key, { label: e.target.value })}
                />
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={m.enabled} onChange={(e) => setMethod(m.key, { enabled: e.target.checked })} />
                <span>Show at checkout</span>
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={m.confirmed} onChange={(e) => setMethod(m.key, { confirmed: e.target.checked })} />
                <span>Confirmed</span>
              </label>
              <button type="button" className="btn btn--icon btn--line" aria-label={`Remove ${m.label || 'payment option'}`} onClick={() => setForm((f) => ({ ...f, methods: f.methods.filter((x) => x.key !== m.key) }))}>✕</button>
              {errors[`m-${m.key}`] && <p className="adm-error adm-method__err">{errors[`m-${m.key}`]}</p>}
            </li>
          ))}
        </ul>
        <button type="button" id="add-method" className="btn btn--line" onClick={() => setForm((f) => ({ ...f, methods: [...f.methods, { key: ++keySeq, id: '', label: '', enabled: true, confirmed: false }] }))}>
          + Add payment option
        </button>
      </section>

      <div className="adm-savebar">
        <div className="adm-savebar__inner">
          <p className="adm-savebar__state" role="status">
            {saving ? 'Saving…' : saveError ? <span className="adm-error-text">{saveError}</span> : dirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          <button type="submit" className="btn btn--ink" disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save settings'}</button>
        </div>
      </div>
    </form>
  );
}
