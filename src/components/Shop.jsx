import { useMemo, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { SearchIcon } from './Icons.jsx';
import { puffCount } from '../lib/catalogue.js';
import { waLink } from '../lib/whatsapp.js';

const puffRanges = {
  all: ['All puffs', () => true],
  low: ['Up to 10,000 puffs', (n) => n != null && n <= 10000],
  mid: ['10,000–30,000 puffs', (n) => n != null && n > 10000 && n <= 30000],
  high: ['Over 30,000 puffs', (n) => n != null && n > 30000],
};

const sorts = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order,
  'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  'price-desc': (a, b) => (b.price ?? -1) - (a.price ?? -1),
  'puffs-desc': (a, b) => (puffCount(b) ?? -1) - (puffCount(a) ?? -1),
  name: (a, b) => a.name.localeCompare(b.name),
};

export default function Shop({ products, status, onOpen, onAdd, onRetry }) {
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('all');
  const [puffs, setPuffs] = useState('all');
  const [sort, setSort] = useState('featured');

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))], [products]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products
      .filter((p) => brand === 'all' || p.brand === brand)
      .filter((p) => puffRanges[puffs][1](puffCount(p)))
      .filter((p) => !term || [p.name, p.brand, p.category, ...p.flavours.map((f) => f.name)].join(' ').toLowerCase().includes(term))
      .sort(sorts[sort]);
  }, [products, q, brand, puffs, sort]);

  const filtersOn = q || brand !== 'all' || puffs !== 'all';
  const countFor = (b) => (b === 'all' ? products.length : products.filter((p) => p.brand === b).length);

  return (
    <section id="shop" className="section section--shop" aria-label="Products">
      <div className="container">

        {brands.length > 1 && (
          <div className="chips" role="group" aria-label="Filter by brand">
            {['all', ...brands].map((b) => (
              <button key={b} type="button" className="chip" aria-pressed={brand === b} onClick={() => setBrand(b)}>
                {b === 'all' ? 'All products' : b}
                <span className="chip__n">{String(countFor(b)).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        )}

        <div className="filters" role="search">
          <label className="search">
            <span className="sr-only">Search products or flavours</span>
            <SearchIcon />
            <input type="search" placeholder="Search products or flavours" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label className="filters__item">
            <span className="sr-only">Puff count</span>
            <select className="select" value={puffs} onChange={(e) => setPuffs(e.target.value)}>
              {Object.entries(puffRanges).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
          <label className="filters__item">
            <span className="sr-only">Sort by</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="puffs-desc">Most puffs</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>

        <p className="filters__count mono" aria-live="polite">
          {status === 'loading' ? 'Loading products…' : status === 'error' ? '' : `${shown.length} product${shown.length === 1 ? '' : 's'}`}
        </p>

        {status === 'error' && (
          <div className="notice notice--action" role="alert">
            <p>We couldn’t load the products just now. Check your connection and try again, or message us and we’ll help you order.</p>
            <div className="notice__actions">
              <button type="button" className="btn btn--ink" onClick={onRetry}>Try again</button>
              <a className="btn btn--line" href={waLink('Hi Vape Express, I would like to place an order.')} target="_blank" rel="noopener">Order on WhatsApp</a>
            </div>
          </div>
        )}
        {status === 'stale' && (
          <p className="notice" role="status">
            We’re having trouble reaching the store right now, so you’re seeing the last saved list. Prices and stock are confirmed on WhatsApp before anything is final.{' '}
            <button type="button" className="linkbtn" onClick={onRetry}>Refresh</button>
          </p>
        )}

        <div className="index">
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onOpen={onOpen} onAdd={onAdd} eager={i < 2} />
          ))}
        </div>

        {(status === 'ready' || status === 'stale') && shown.length === 0 && (
          <div className="empty">
            <p>No products match that search.</p>
            {filtersOn && (
              <button className="btn btn--line" onClick={() => { setQ(''); setBrand('all'); setPuffs('all'); }}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
