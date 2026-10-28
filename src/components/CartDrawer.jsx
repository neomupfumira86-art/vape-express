import { cloneElement, useState } from 'react';
import Dialog from './Dialog.jsx';
import QtyControl from './QtyControl.jsx';
import { money } from '../lib/format.js';
import { orderMessage, waLink } from '../lib/whatsapp.js';
import { paymentMethods } from '../config.js';
import { WhatsAppIcon } from './Icons.jsx';

const methods = paymentMethods.filter((m) => m.enabled);
const empty = { name: '', phone: '', address: '', note: '', payment: '' };

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your name.';
  if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Please enter a phone number we can reach you on.';
  if (f.address.trim().length < 3) e.address = 'Please enter your delivery area or address in Harare.';
  if (!f.payment) e.payment = 'Please choose a payment preference.';
  return e;
}

export default function CartDrawer({ open, onClose, cart }) {
  const [step, setStep] = useState('cart');
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sentLink, setSentLink] = useState(null);

  const close = () => { onClose(); setStep('cart'); setSentLink(null); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      e.currentTarget.querySelector(`[name="${Object.keys(errs)[0]}"]`)?.focus();
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
        <a className="btn btn--primary btn--block" href={sentLink} target="_blank" rel="noopener"><WhatsAppIcon /> Open WhatsApp with my order</a>
        <p className="small muted">The owner will confirm stock, payment and delivery with you on WhatsApp.</p>
      </div>
    );
    footer = (
      <div className="cart__foot">
        <button className="btn btn--secondary" onClick={() => setStep('cart')}>Back to cart</button>
        <button className="btn btn--primary" onClick={() => { cart.clear(); setForm(empty); close(); }}>Done — clear cart</button>
      </div>
    );
  } else if (step === 'checkout') {
    title = 'Your details';
    body = (
      <form id="checkout" className="checkout" onSubmit={submit} noValidate>
        <Field label="Your name" name="name" error={errors.name}>
          <input name="name" autoComplete="name" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Phone number" name="phone" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="e.g. 077 123 4567" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Delivery area / address in Harare" name="address" error={errors.address}>
          <input name="address" autoComplete="street-address" value={form.address} onChange={set('address')} />
        </Field>
        <fieldset className="field" aria-describedby={errors.payment ? 'err-payment' : undefined}>
          <legend className="field__label">Preferred payment method</legend>
          <div className="paygrid">
            {methods.map((m) => (
              <label key={m.id} className="paychip">
                <input type="radio" name="payment" value={m.id} checked={form.payment === m.id} onChange={set('payment')} />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
          {errors.payment && <p id="err-payment" className="field__error">{errors.payment}</p>}
        </fieldset>
        <Field label="Order note (optional)" name="note">
          <textarea name="note" rows="2" value={form.note} onChange={set('note')} />
        </Field>
        <p className="notice">Payment is arranged with the owner on WhatsApp. This website does not take or process payment — never share card details or PINs here.</p>
        {total}
      </form>
    );
    footer = (
      <div className="cart__foot">
        <button className="btn btn--secondary" onClick={() => setStep('cart')}>Back</button>
        <button className="btn btn--primary" type="submit" form="checkout"><WhatsAppIcon /> Send order on WhatsApp</button>
      </div>
    );
  } else {
    title = `Your cart (${cart.count})`;
    body = cart.items.length === 0 ? (
      <div className="empty">
        <p>Your cart is empty.</p>
        <a className="btn btn--primary" href="#shop" onClick={close}>Browse products</a>
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
        {total}
        {cart.hasUnpriced && <p className="small muted">Some items have a price to be confirmed by the owner.</p>}
      </>
    );
    footer = cart.items.length > 0 && (
      <div className="cart__foot">
        <button className="btn btn--primary btn--block" onClick={() => setStep('checkout')}>Checkout</button>
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={close} title={title} variant="drawer" footer={footer}>
      {body}
    </Dialog>
  );
}

function Field({ label, name, error, children }) {
  const id = `f-${name}`;
  const child = cloneElement(children, { id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `err-${name}` : undefined, className: 'input' });
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      {child}
      {error && <p id={`err-${name}`} className="field__error">{error}</p>}
    </div>
  );
}
