import Logo from './Logo.jsx';
import { business, nicotineWarning } from '../config.js';
import { waLink } from '../lib/whatsapp.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="warning" role="note">
        <p>{nicotineWarning}</p>
      </div>
      <div className="container footer__inner">
        <div>
          <Logo height={72} />
          <p className="muted small">{business.tagline} {business.city}, {business.country}.</p>
        </div>
        <ul className="footer__links">
          <li><a href="#shop">Shop</a></li>
          <li><a href="#delivery">Delivery</a></li>
          <li><a href={waLink()} target="_blank" rel="noopener">WhatsApp {business.whatsappDisplay}</a></li>
          <li><a href={business.instagramUrl} target="_blank" rel="noopener">Instagram {business.instagramHandle}</a></li>
        </ul>
        <p className="small muted footer__legal">
          <span className="badge18">18+</span> Sales to adults aged 18 and over only. Prices in USD.
          © {new Date().getFullYear()} {business.name}.
        </p>
      </div>
    </footer>
  );
}
