import { useEffect, useState } from 'react';
import AgeGate from './components/AgeGate.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Shop from './components/Shop.jsx';
import ProductModal from './components/ProductModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { HowItWorks, PaymentInfo, Delivery, Contact } from './components/InfoSections.jsx';
import Footer from './components/Footer.jsx';
import PageHead from './components/PageHead.jsx';
import HomePicks from './components/HomePicks.jsx';
import OrderCta from './components/OrderCta.jsx';
import Intro from './components/Intro.jsx';
import SmokeTrail from './components/SmokeTrail.jsx';
import MobileBar from './components/MobileBar.jsx';
import Ticker from './components/Ticker.jsx';
import { ArrowIcon } from './components/Icons.jsx';
import { loadStore } from './lib/catalogue.js';
import { applySettings } from './lib/settings.js';
import { useCart, reconcileCart } from './lib/useCart.js';
import { useScrollFx } from './lib/useScrollFx.js';
import { usePath, PAGES } from './lib/router.jsx';
import { business } from './config.js';

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
  const [attempt, setAttempt] = useState(0);
  const cart = useCart();
  const path = usePath();
  const showIntro = adult && intro;

  // Hold the hero entrance until the intro has gone.
  useEffect(() => {
    document.body.classList.toggle('is-intro', showIntro);
  }, [showIntro]);

  // New page: start at the top and name the tab.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${PAGES[path].title} | ${business.name}`;
  }, [path]);

  useScrollFx([adult, status, path]);

  function endIntro() {
    try { sessionStorage.setItem(INTRO_KEY, 'yes'); } catch { /* fine */ }
    setIntro(false);
  }

  // Products and settings come from the database on every visit, so changes made
  // in /admin show up without a redeploy.
  useEffect(() => {
    let live = true;
    setStatus('loading');
    loadStore()
      .then(({ products: list, settings, stale }) => {
        if (!live) return;
        applySettings(settings);
        setProducts(list);
        setStatus(stale ? 'stale' : 'ready');
      })
      .catch(() => live && setStatus('error'));
    return () => { live = false; };
  }, [attempt]);

  // A saved cart may hold old prices or products that have since been hidden or sold out.
  useEffect(() => {
    if (status !== 'ready') return;
    const { items, removed, changed } = reconcileCart(cart.items, products);
    if (changed) cart.replace(items);
    if (removed) setToast(`${removed} item${removed === 1 ? ' is' : 's are'} no longer available and ${removed === 1 ? 'was' : 'were'} removed from your cart`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, products]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
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
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  const tickerItems = [...brands, `Delivered around ${business.city}`, 'Order on WhatsApp', 'Adults 18+'];

  let page;
  if (path === '/shop') {
    page = (
      <>
        <PageHead index="02" label="Shop" title="The" accent="collection.">
          Every product, flavour and price in one place. Filter by brand, pick a flavour and add it to your cart — the owner confirms stock with you on WhatsApp.
        </PageHead>
        <Shop products={products} status={status} onOpen={setActive} onAdd={add} onRetry={() => setAttempt((n) => n + 1)} />
        <OrderCta title="Need a hand choosing?" />
      </>
    );
  } else if (path === '/how-it-works') {
    page = (
      <>
        <PageHead index="03" label="How to order" title="Order in" accent="three steps.">
          No account and no online payment. Build your cart, send it on WhatsApp, and the owner confirms stock, payment and delivery with you directly.
        </PageHead>
        <HowItWorks head={false} />
        <PaymentInfo />
        <OrderCta />
      </>
    );
  } else if (path === '/delivery') {
    page = (
      <>
        <PageHead index="04" label="Delivery" title="Delivered around" accent={`${business.city}.`}>
          Deliveries around {business.city}. Send your area on WhatsApp and we’ll confirm the details for your order.
        </PageHead>
        <Delivery head={false} />
        <OrderCta />
      </>
    );
  } else if (path === '/contact') {
    page = (
      <>
        <PageHead index="05" label="Contact" title="Questions?" accent="Message us.">
          The quickest way to reach Vape Express is WhatsApp — for orders, stock questions and delivery.
        </PageHead>
        <Contact head={false} />
      </>
    );
  } else {
    page = (
      <>
        <Hero featured={featured} products={products} onOpen={setActive} />
        {products.length > 0 && <Ticker items={tickerItems} />}
        <HomePicks products={products} onOpen={setActive} onAdd={add} />
        <HowItWorks more />
        <OrderCta />
      </>
    );
  }

  return (
    <>
      {showIntro && <Intro onDone={endIntro} />}
      <a href="#main" className="skip">Skip to content</a>
      {hasSamples && (
        <div className="devbanner" role="status">
          Preview: this store is showing <strong>sample products</strong>. Replace <code>public/products.json</code> before launch.
        </div>
      )}
      <Header count={cart.count} onCart={() => setCartOpen(true)} path={path} />
      <SmokeTrail />
      <main id="main" key={path} className="page">
        {page}
      </main>
      <Footer />

      <ProductModal product={active} onClose={() => setActive(null)} onAdd={add} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />

      <MobileBar path={path} count={cart.count} total={cart.total} onCart={() => setCartOpen(true)} />
      <button type="button" className="totop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <ArrowIcon style={{ transform: 'rotate(-90deg)' }} />
      </button>

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
