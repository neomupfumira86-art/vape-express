import { business, delivery, CONFIRM } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { WhatsAppIcon, InstagramIcon } from './Icons.jsx';

const steps = [
  ['Choose your product', 'Browse the range, pick a flavour and add it to your cart.'],
  ['Send your order on WhatsApp', 'Checkout opens WhatsApp with your order written out — just press send.'],
  ['Arrange payment & delivery', 'The owner confirms stock, payment and delivery with you directly.'],
];

const Value = ({ v }) => (v === CONFIRM ? <span className="placeholder">{CONFIRM}</span> : v);

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section section--alt" aria-labelledby="how-title">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="section__title">Three steps to your order</h2>
        </div>
        <ol className="steps">
          {steps.map(([t, d], i) => (
            <li key={t} className="step">
              <span className="step__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Delivery() {
  const rows = [
    ['Delivery fees', delivery.fees],
    ['Areas covered', delivery.areas],
    ['Delivery times', delivery.times],
    ['Collection', delivery.collection],
    ['Minimum order', delivery.minimumOrder],
    ['Opening hours', delivery.openingHours],
    ['Returns', delivery.returns],
    ['Warranty', delivery.warranty],
  ];
  return (
    <section id="delivery" className="section" aria-labelledby="delivery-title">
      <div className="container delivery">
        <div>
          <p className="eyebrow">Delivery</p>
          <h2 id="delivery-title" className="section__title">Delivered around {business.city}</h2>
          <p className="muted">{delivery.area} Send us your area on WhatsApp and we’ll confirm the details for your order.</p>
        </div>
        <dl className="terms">
          {rows.map(([k, v]) => (
            <div key={k} className="terms__row">
              <dt>{k}</dt>
              <dd><Value v={v} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 id="contact-title" className="section__title">Questions? Message us.</h2>
            <p className="muted">Orders and enquiries on WhatsApp: <a href={waLink()} target="_blank" rel="noopener">{business.whatsappDisplay}</a></p>
          </div>
          <div className="contact__actions">
            <a className="btn btn--whatsapp btn--lg" href={waLink('Hi Vape Express, I have a question.')} target="_blank" rel="noopener">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
            <a className="btn btn--ghost btn--lg" href={business.instagramUrl} target="_blank" rel="noopener">
              <InstagramIcon /> {business.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
