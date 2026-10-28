import { useEffect, useState } from 'react';
import AgeGate from './components/AgeGate.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Shop from './components/Shop.jsx';
import ProductModal from './components/ProductModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { HowItWorks, Delivery, Contact } from './components/InfoSections.jsx';
import Footer from './components/Footer.jsx';
import { WhatsAppIcon } from './components/Icons.jsx';
import { loadCatalogue } from './lib/catalogue.js';
import { useCart } from './lib/useCart.js';
import { waLink } from './lib/whatsapp.js';
import Intro from './components/Intro.jsx';
import { useScrollSmoke } from './lib/useScrollSmoke.js';

const AGE_KEY = 'vx-age-ok';
const readAge = () => { try { return localStorage.getItem(AGE_KEY) === 'yes'; } catch { return false; } };
const INTRO_KEY = 'vx-intro-seen';
// The intro plays once per browser session, never for reduced-motion users.
const wantIntro = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return sessionStorage.getItem(INTRO_KEY) !== 'yes'; } catch { return true; }
};

export default function App() {
  const [adult, setAdult] = useState(readAge);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [active, setActive] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [intro, setIntro] = useState(wantIntro);
  const cart = useCart();
  const showIntro = adult && intro;

  // Hold the hero entrance until the intro has gone.
  useEffect(() => {
    document.body.classList.toggle('is-intro', showIntro);
  }, [showIntro]);

  useScrollSmoke([adult, status]);

  function endIntro() {
    try { sessionStorage.setItem(INTRO_KEY, 'yes'); } catch { /* fine */ }
    setIntro(false);
  }

  useEffect(() => {
    loadCatalogue()
      .then((list) => { setProducts(list); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  function accept() {
    try { localStorage.setItem(AGE_KEY, 'yes'); } catch { /* still allow this visit */ }
    setAdult(true);
  }

  function add(product, flavour, qty = 1) {
    cart.add(product, flavour, qty);
    setToast(`Added ${product.name} — ${flavour}`);
  }

  if (!adult) return <AgeGate onAccept={accept} />;

  const featured = products.find((p) => p.featured) ?? products[0];
  const hasSamples = products.some((p) => p.sample);

  return (
    <>
      {showIntro && <Intro onDone={endIntro} />}
      <a href="#shop" className="skip">Skip to products</a>
      {hasSamples && (
        <div className="devbanner" role="status">
          Preview: this store is showing <strong>sample products</strong>. Replace <code>public/products.json</code> before launch.
        </div>
      )}
      <Header count={cart.count} onCart={() => setCartOpen(true)} />
      <main>
        <Hero featured={featured} products={products} />
        <Shop products={products} status={status} onOpen={setActive} onAdd={add} />
        <HowItWorks />
        <Delivery />
        <Contact />
      </main>
      <Footer />

      <ProductModal product={active} onClose={() => setActive(null)} onAdd={add} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />

      <a className="fab" href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener" aria-label="Order on WhatsApp">
        <WhatsAppIcon width={26} height={26} className="wa-icon" />
      </a>

      <div className="toast" role="status" aria-live="polite">
        {toast && (
          <span>
            {toast} · <button className="linkbtn" onClick={() => setCartOpen(true)}>View cart</button>
          </span>
        )}
      </div>
    </>
  );
}
