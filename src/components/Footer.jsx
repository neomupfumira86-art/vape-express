import Logo from './Logo.jsx';
import { business, nicotineWarning } from '../config.js';
import { waLink } from '../lib/whatsapp.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="warning" role="note">{nicotineWarning}</p>
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo height={56} />
            <p>{business.tagline}<br />{business.city}, {business.country}.</p>
          </div>
          <nav aria-label="Footer">
            <p className="footer__heading">Shop</p>
            <ul className="footer__links">
              <li><a href="#shop">Products</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#delivery">Delivery</a></li>
            </ul>
          </nav>
          <div>
            <p className="footer__heading">Contact</p>
            <ul className="footer__links">
              <li><a href={waLink()} target="_blank" rel="noopener">WhatsApp {business.whatsappDisplay}</a></li>
              <li><a href={business.instagramUrl} target="_blank" rel="noopener">Instagram {business.instagramHandle}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <span className="badge18" aria-hidden="true">18+</span>
          <p>Sales to adults aged 18 and over only. Prices in USD. © {new Date().getFullYear()} {business.name}.</p>
        </div>
      </div>
    </footer>
  );
}
