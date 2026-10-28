import { business, delivery, CONFIRM } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { WhatsAppIcon, InstagramIcon, ArrowIcon } from './Icons.jsx';

const steps = [
  ['Choose', 'Browse the range, pick a flavour and add it to your cart.'],
  ['Send', 'Checkout opens WhatsApp with your order already written out. Just press send.'],
  ['Confirm', 'The owner confirms stock, payment and delivery with you directly on WhatsApp.'],
];

export function SectionHeader({ index, title, id, children, inverse = false }) {
  return (
    <div className="section__head section__head--split">
      <div>
        <p className={`section__index mono ${inverse ? 'section__index--inverse' : ''}`}>{index}</p>
        <h2 id={id} className="section__title">{title}</h2>
      </div>
      {children && <p className="section__aside">{children}</p>}
    </div>
  );
}

const Value = ({ v }) =>
  v === CONFIRM ? <span className="tbc mono" title="To be confirmed with the owner">{CONFIRM}</span> : v;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section section--ink" aria-labelledby="how-title">
      <div className="container">
        <SectionHeader index="(03) How it works" title="Three steps." id="how-title" inverse>
          No account and no online payment. Your order goes to the owner on WhatsApp, who confirms everything with you.
        </SectionHeader>
        <ol className="steps">
          {steps.map(([t, d], i) => (
            <li key={t} className="step">
              <span className="step__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="step__title">{t}</h3>
              <p className="step__text">{d}</p>
            </li>
          ))}
        </ol>
        <p className="steps__note mono">This website does not take or process payment.</p>
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
      <div className="container">
        <SectionHeader index="(04) Delivery" title={`Delivered around ${business.city}.`} id="delivery-title">
          {delivery.area} Send your area on WhatsApp and we’ll confirm the details for your order.
        </SectionHeader>
        <dl className="terms">
          {rows.map(([k, v], i) => (
            <div key={k} className="terms__row">
              <span className="terms__num mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
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
    <section id="contact" className="section section--contact" aria-labelledby="contact-title">
      <div className="container">
        <p className="section__index mono">(05) Contact</p>
        <h2 id="contact-title" className="contact__title">Questions? Message us.</h2>
        <div className="contact__links">
          <a className="contact__big" href={waLink('Hi Vape Express, I have a question.')} target="_blank" rel="noopener">
            <span className="mono">WhatsApp</span>
            <span className="contact__value"><WhatsAppIcon className="wa-icon" /> {business.whatsappDisplay}</span>
            <ArrowIcon className="contact__arrow" />
          </a>
          <a className="contact__big" href={business.instagramUrl} target="_blank" rel="noopener">
            <span className="mono">Instagram</span>
            <span className="contact__value"><InstagramIcon /> {business.instagramHandle}</span>
            <ArrowIcon className="contact__arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
