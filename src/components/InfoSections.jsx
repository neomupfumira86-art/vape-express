import { business, delivery, CONFIRM } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { WhatsAppIcon, InstagramIcon, InfoIcon } from './Icons.jsx';

const steps = [
  ['Choose your product', 'Browse the range, pick a flavour and add it to your cart.'],
  ['Send your order on WhatsApp', 'Checkout opens WhatsApp with your order already written out. Just press send.'],
  ['Arrange payment and delivery', 'The owner confirms stock, payment and delivery with you directly on WhatsApp.'],
];

export function SectionHeader({ label, title, id, children }) {
  return (
    <div className="section__head">
      <p className="label">{label}</p>
      <h2 id={id} className="section__title">{title}</h2>
      {children && <p className="section__intro">{children}</p>}
    </div>
  );
}

const Value = ({ v }) =>
  v === CONFIRM ? <span className="chip-confirm" title="To be confirmed with the owner">{CONFIRM}</span> : v;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section section--tint" aria-labelledby="how-title">
      <div className="container">
        <SectionHeader label="How it works" title="Three steps to your order" id="how-title" />
        <ol className="timeline">
          {steps.map(([t, d], i) => (
            <li key={t} className="timeline__step">
              <span className="timeline__num" aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className="timeline__title">{t}</h3>
                <p className="timeline__text">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="callout">
          <InfoIcon />
          <span>This website does not take or process payment. Your order is a request: the owner confirms it with you on WhatsApp.</span>
        </p>
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
      <div className="container split">
        <SectionHeader label="Delivery" title={`Delivered around ${business.city}`} id="delivery-title">
          {delivery.area} Send your area on WhatsApp and we’ll confirm the details for your order.
        </SectionHeader>
        <dl className="infopanel">
          {rows.map(([k, v]) => (
            <div key={k} className="infopanel__row">
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
    <section id="contact" className="section section--navy" aria-labelledby="contact-title">
      <div className="container contact">
        <div>
          <p className="label label--inverse">Contact</p>
          <h2 id="contact-title" className="section__title">Questions? Message us.</h2>
          <p className="contact__text">
            Orders and enquiries on WhatsApp: <a href={waLink()} target="_blank" rel="noopener">{business.whatsappDisplay}</a>
          </p>
        </div>
        <div className="contact__actions">
          <a className="btn btn--light btn--lg" href={waLink('Hi Vape Express, I have a question.')} target="_blank" rel="noopener">
            <WhatsAppIcon className="wa-icon" /> Chat on WhatsApp
          </a>
          <a className="btn btn--outline-light btn--lg" href={business.instagramUrl} target="_blank" rel="noopener">
            <InstagramIcon /> {business.instagramHandle}
          </a>
        </div>
      </div>
    </section>
  );
}
