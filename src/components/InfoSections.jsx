import { business, delivery, paymentMethods, CONFIRM } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { Link } from '../lib/router.jsx';
import { WhatsAppIcon, InstagramIcon, ArrowIcon, InfoIcon } from './Icons.jsx';
import Smoke from './Smoke.jsx';
import { useReveal } from '../lib/useScrollFx.js';

const steps = [
  ['Choose', 'Browse the range, pick a flavour and add it to your cart.'],
  ['Send', 'Checkout opens WhatsApp with your order already written out. Just press send.'],
  ['Confirm', 'The owner confirms stock, payment and delivery with you directly on WhatsApp.'],
];

export function SectionHeader({ index, title, id, children, inverse = false }) {
  const ref = useReveal();
  return (
    <div className="section__head section__head--split" ref={ref} data-reveal>
      <div>
        <p className={`section__index mono ${inverse ? 'section__index--inverse' : ''}`}>{index}</p>
        <h2 id={id} className="section__title">{title}</h2>
      </div>
      {children && <p className="section__aside">{children}</p>}
    </div>
  );
}

const Value = ({ v }) =>
  v === CONFIRM ? <span className="tbc mono" title="To be confirmed with the owner">Confirm with owner</span> : v;

// `head` = false when the page already has a PageHead with the same title.
export function HowItWorks({ head = true, index = '(02) How it works', more = false }) {
  return (
    <section id="how-it-works" className="section section--ink" aria-labelledby="how-title" aria-label={head ? undefined : 'Three steps to order'}>
      <Smoke />
      <div className="container">
        {head && (
          <SectionHeader index={index} title="Three steps." id="how-title" inverse>
            No account and no online payment. Your order goes to the owner on WhatsApp, who confirms everything with you.
          </SectionHeader>
        )}
        <ol className="steps">
          {steps.map(([t, d], i) => (
            <li key={t} className="step">
              <span className="step__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="step__title">{t}</h3>
              <p className="step__text">{d}</p>
            </li>
          ))}
        </ol>
        <div className="steps__foot">
          <p className="steps__note mono">This website does not take or process payment.</p>
          {more && (
            <Link className="more-link more-link--light mono" to="/how-it-works">
              How ordering works <ArrowIcon />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function PaymentInfo() {
  const methods = paymentMethods.filter((m) => m.enabled);
  return (
    <section className="section" aria-labelledby="pay-title">
      <div className="container">
        <SectionHeader index="Payment" title="Paying for your order." id="pay-title">
          At checkout you tell us how you’d prefer to pay. Nothing is charged on this website; the owner confirms the available options with you on WhatsApp.
        </SectionHeader>
        <ul className="paylist">
          {methods.map((m, i) => (
            <li key={m.id}>
              <span className="mono paylist__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="paylist__name">{m.label}</span>
              {!m.confirmed && <span className="tbc mono">Confirm with owner</span>}
            </li>
          ))}
        </ul>
        <p className="callout">
          <InfoIcon />
          <span>Never share card numbers, PINs or passwords on this website. Payment details are only arranged directly with the owner.</span>
        </p>
      </div>
    </section>
  );
}

export function Delivery({ head = true }) {
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
    <section id="delivery" className="section" aria-labelledby={head ? 'delivery-title' : undefined} aria-label={head ? undefined : 'Delivery details'}>
      <div className="container">
        {head && (
          <SectionHeader index="Delivery" title={`Delivered around ${business.city}.`} id="delivery-title">
            {delivery.area} Send your area on WhatsApp and we’ll confirm the details for your order.
          </SectionHeader>
        )}
        <dl className="terms">
          {rows.map(([k, v], i) => (
            <div key={k} className="terms__row">
              <span className="terms__num mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <dt>{k}</dt>
              <dd><Value v={v} /></dd>
            </div>
          ))}
        </dl>
        <p className="terms__note">
          Details marked “Confirm with owner” are being finalised. Message us on WhatsApp with your area and we’ll confirm them for your order.
        </p>
      </div>
    </section>
  );
}

export function Contact({ head = true }) {
  const ref = useReveal();
  return (
    <section id="contact" className="section section--contact" aria-labelledby={head ? 'contact-title' : undefined} aria-label={head ? undefined : 'Contact details'}>
      <div className="container">
        {head && (
          <h2 id="contact-title" className="contact__title" ref={ref} data-reveal>Questions? Message us.</h2>
        )}
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
        <p className="contact__fine">
          Orders and questions are answered on WhatsApp. Based in {business.city}, {business.country}. For adults aged 18 and over only.
        </p>
      </div>
    </section>
  );
}
