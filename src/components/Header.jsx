import Logo from './Logo.jsx';
import { business } from '../config.js';
import { waLink } from '../lib/whatsapp.js';

const links = [
  ['#shop', 'Shop'],
  ['#how-it-works', 'How it works'],
  ['#delivery', 'Delivery'],
  ['#contact', 'Contact'],
];

export default function Header({ count, onCart }) {
  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <span>Deliveries around {business.city}</span>
          <span className="topbar__mid">Adults 18+ only</span>
          <a href={waLink()} target="_blank" rel="noopener">WhatsApp {business.whatsappDisplay}</a>
        </div>
      </div>
      <header className="header">
        <div className="container header__inner">
          <a href="#top" className="header__brand" aria-label="Vape Express, back to top">
            <Logo height={40} />
          </a>
          <nav aria-label="Main" className="header__nav">
            {links.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>
          <button className="cartbtn" onClick={onCart} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
            Cart <span className="cartbtn__count" aria-hidden="true">({String(count).padStart(2, '0')})</span>
          </button>
        </div>
        <nav aria-label="Sections" className="header__subnav container">
          {links.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </header>
    </>
  );
}
