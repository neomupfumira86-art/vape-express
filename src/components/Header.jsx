import Logo from './Logo.jsx';
import { BagIcon } from './Icons.jsx';

const links = [
  ['#shop', 'Shop'],
  ['#how-it-works', 'How it works'],
  ['#delivery', 'Delivery'],
  ['#contact', 'Contact'],
];

export default function Header({ count, onCart }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#top" className="header__brand" aria-label="Vape Express — back to top">
          <Logo height={48} />
        </a>
        <nav aria-label="Main" className="header__nav">
          {links.map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
        <button className="cartbtn" onClick={onCart} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
          <BagIcon />
          <span className="cartbtn__label">Cart</span>
          <span className="cartbtn__count" aria-hidden="true">{count}</span>
        </button>
      </div>
      <nav aria-label="Sections" className="header__subnav container">
        {links.map(([href, label]) => (
          <a key={href} href={href}>{label}</a>
        ))}
      </nav>
    </header>
  );
}
