import Logo from './Logo.jsx';
import { business, nicotineWarning } from '../config.js';
import { waLink } from '../lib/whatsapp.js';
import { Link } from '../lib/router.jsx';
import { NAV } from './Header.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="warning" role="note">{nicotineWarning}</p>
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo height={64} />
            <p>{business.tagline}<br />{business.city}, {business.country}.</p>
          </div>
          <nav aria-label="Footer">
            <p className="footer__heading mono">Pages</p>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              {NAV.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
            </ul>
          </nav>
          <div>
            <p className="footer__heading mono">Contact</p>
            <ul className="footer__links">
              <li><a href={waLink()} target="_blank" rel="noopener">WhatsApp {business.whatsappDisplay}</a></li>
              <li><a href={business.instagramUrl} target="_blank" rel="noopener">Instagram {business.instagramHandle}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__legal mono">
          <span className="badge18" aria-hidden="true">18+</span>
          <p>Sales to adults aged 18 and over only. Prices in USD. © {new Date().getFullYear()} {business.name}.</p>
          {/* Plain link (full page load): the admin area is a separate bundle. Access is protected by sign-in, not by hiding this. */}
          <a className="footer__admin" href="/admin" rel="nofollow">Admin only</a>
        </div>
      </div>
    </footer>
  );
}
