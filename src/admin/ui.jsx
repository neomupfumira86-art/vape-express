import { navigate } from '../lib/router.jsx';
import Dialog from '../components/Dialog.jsx';

export const go = (to) => {
  navigate(to);
  window.scrollTo({ top: 0, behavior: 'instant' });
};

// Labelled form field with hint and error text wired up for screen readers.
export function Field({ id, label, hint, error, optional, children, className = '' }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`adm-field ${className}`}>
      <label className="adm-label" htmlFor={id}>
        {label} {optional && <span className="adm-opt">Optional</span>}
      </label>
      {hint && <p className="adm-hint" id={`${id}-hint`}>{hint}</p>}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? 'true' : undefined })}
      {error && <p className="adm-error" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

export function Loading({ text = 'Loading…' }) {
  return <p className="adm-loading" role="status"><span className="adm-spinner" aria-hidden="true" /> {text}</p>;
}

export function ConfirmDialog({ open, title, children, confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      footer={
        <div className="adm-row adm-row--end">
          <button className="btn btn--line" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn adm-btn--danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button>
        </div>
      }
    >
      {children}
    </Dialog>
  );
}
