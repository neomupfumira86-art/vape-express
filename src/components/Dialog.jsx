import { useEffect, useRef } from 'react';
import { CloseIcon } from './Icons.jsx';

// Accessible modal / drawer built on the native <dialog> element
// (focus trapping, Escape to close and inert background come for free).
export default function Dialog({ open, onClose, title, variant = 'modal', children, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    // Lock the page behind the dialog so only the dialog scrolls (no double scrollbars).
    document.documentElement.classList.toggle('has-dialog', open);
    return () => document.documentElement.classList.remove('has-dialog');
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${variant}`}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="dialog__inner">
          <div className="dialog__head">
            <h2 id="dialog-title" className="dialog__title">{title}</h2>
            <button className="btn btn--icon btn--line" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          <div className="dialog__body">{children}</div>
          {footer && <div className="dialog__foot">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
