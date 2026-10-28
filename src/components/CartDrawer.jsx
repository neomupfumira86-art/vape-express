import { cloneElement, useState } from 'react';
import Dialog from './Dialog.jsx';
import QtyControl from './QtyControl.jsx';
import { money } from '../lib/format.js';
import { orderMessage, waLink } from '../lib/whatsapp.js';
import { navigate } from '../lib/router.jsx';
import { paymentMethods } from '../config.js';
import { WhatsAppIcon } from './Icons.jsx';

const methods = paymentMethods.filter((m) => m.enabled);
const empty = { name: '', phone: '', address: '', note: '', payment: '' };
const required = ['name', 'phone', 'address', 'payment'];

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your name so the owner knows who the order is for.';
  if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Enter a phone number with at least 9 digits, e.g. 077 123 4567.';
  if (f.address.trim().length < 3) e.address = 'Enter your delivery area or address in Harare.';
  if (!f.payment) e.payment = 'Choose how you’d prefer to pay.';
  return e;
}

export default function CartDrawer({ open, onClose, cart }) {
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState({});
  const [sentLink, setSentLink] = useState(null);

  // Errors show for fields the visitor has left (or after a send attempt), and update live.
  const allErrors = validate(form);
  const errors = Object.fromEntries(Object.entries(allErrors).filter(([k]) => touched[k]));

  const close = () => { onClose(); setStep('cart'); setSentLink(null); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  function submit(e) {
    e.preventDefault();
    setTouched(Object.fromEntries(required.map((k) => [k, true])));
    const first = required.find((k) => allErrors[k]);
    if (first) {
      e.currentTarget.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    const paymentLabel = methods.find((m) => m.id === form.payment)?.label ?? form.payment;
    const link = waLink(orderMessage({ items: cart.items, customer: form, paymentLabel }));
    const win = window.open(link, '_blank', 'noopener');
    setSentLink(link); // always show a manual link in case the popup was blocked
    setStep('sent');
    if (!win) console.info('WhatsApp popup blocked — showing manual link.');
  }

  const total = (
    <div className="totals">
      <span>Total</span>
      <strong>{money(cart.total)}</strong>
    </div>
  );

  let body, footer, title;
  if (step === 'sent') {
    title = 'Order ready to send';
    body = (
      <div className="sent">
        <p>WhatsApp should have opened with your order message. Press <strong>send</strong> in WhatsApp to submit it.</p>
        <p className="muted">If WhatsApp didn’t open, use this button:</p>
        <a className="btn btn--ink btn--block" href={sentLink} target="_blank" rel="noopener"><WhatsAppIcon /> Open WhatsApp with my order</a>
        <p className="small muted">The owner will confirm stock, payment and delivery with you on WhatsApp.</p>
      </div>
    );
    footer = (
      <div className="cart__foot">
        <button className="btn btn--line" onClick={() => setStep('cart')}>Back to cart</button>
        <button className="btn btn--ink" onClick={() => { cart.clear(); setForm(empty); setTouched({}); close(); }}>Done — clear cart</button>
      </div>
    );
  } else if (step === 'checkout') {
    title = 'Your details';
    body = (
      <form id="checkout" className="checkout" onSubmit={submit} noValidate>
        <p className="checkout__intro">We’ll prepare a WhatsApp message with your order. Fields marked <span className="req">Required</span> are needed.</p>
        <Field label="Your name" name="name" error={errors.name} required>
          <input name="name" autoComplete="name" value={form.name} onChange={set('name')} onBlur={touch('name')} />
        </Field>
        <Field label="Phone number" name="phone" error={errors.phone} required>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="e.g. 077 123 4567" value={form.phone} onChange={set('phone')} onBlur={touch('phone')} />
        </Field>
        <Field label="Delivery area / address in Harare" name="address" error={errors.address} required>
          <input name="address" autoComplete="street-address" placeholder="e.g. Avondale, near the shops" value={form.address} onChange={set('address')} onBlur={touch('address')} />
        </Field>
        <fieldset className="field" aria-describedby={errors.payment ? 'err-payment pay-note' : 'pay-note'} aria-required="true">
          <legend className="field__label">Preferred payment method <span className="req">Required</span></legend>
          <div className="paygrid">
            {methods.map((m) => (
              <label key={m.id} className="paychip">
                <input type="radio" name="payment" value={m.id} checked={form.payment === m.id} onChange={(e) => { set('payment')(e); touch('payment')(); }} />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
          {errors.payment && <p id="err-payment" className="field__error">{errors.payment}</p>}
          <p id="pay-note" className="notice">No payment is taken on this website. The owner confirms payment with you on WhatsApp — never share card details, PINs or passwords here.</p>
        </fieldset>
        <Field label="Order note" name="note" optional>
          <textarea name="note" rows="2" placeholder="Anything the owner should know" value={form.note} onChange={set('note')} />
        </Field>
      </form>
    );
    footer = (
      <div className="checkout__foot">
        {total}
        <div className="cart__foot">
          <button className="btn btn--line" onClick={() => setStep('cart')}>Back</button>
          <button className="btn btn--blue" type="submit" form="checkout"><WhatsAppIcon /> Send order on WhatsApp</button>
        </div>
      </div>
    );
  } else {
    title = `Your cart (${cart.count})`;
    body = cart.items.length === 0 ? (
      <div className="empty">
        <p>Your cart is empty.</p>
        <button className="btn btn--ink" onClick={() => { close(); navigate('/shop'); }}>Browse products</button>
      </div>
    ) : (
      <>
        <ul className="lines">
          {cart.items.map((i) => (
            <li key={i.key} className="line">
              <img src={i.image} alt="" width="64" height="64" />
              <div className="line__info">
                <strong>{i.name}</strong>
                <span className="muted small">{i.flavour}</span>
                <span className="small">{money(i.price)} each</span>
              </div>
              <div className="line__ctrl">
                <QtyControl value={i.qty} min={0} onChange={(v) => cart.setQty(i.key, v)} label={`Quantity of ${i.name}, ${i.flavour}`} />
                <button className="linkbtn" onClick={() => cart.remove(i.key)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
        {cart.hasUnpriced && <p className="small muted">Some items have a price to be confirmed by the owner.</p>}
      </>
    );
    footer = cart.items.length > 0 && (
      <div className="checkout__foot">
        {total}
        <div className="cart__foot">
          <button className="btn btn--blue btn--block" onClick={() => setStep('checkout')}>Checkout</button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={close} title={title} variant="drawer" footer={footer}>
      {body}
    </Dialog>
  );
}

function Field({ label, name, error, required = false, optional = false, children }) {
  const id = `f-${name}`;
  const child = cloneElement(children, {
    id,
    required,
    'aria-required': required || undefined,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `err-${name}` : undefined,
    className: 'input',
  });
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label} {required && <span className="req">Required</span>}{optional && <span className="opt">Optional</span>}
      </label>
      {child}
      {error && <p id={`err-${name}`} className="field__error" role="alert">{error}</p>}
    </div>
  );
}
