import { useMemo, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { SearchIcon } from './Icons.jsx';
import { puffCount } from '../lib/catalogue.js';
import Smoke from './Smoke.jsx';

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

export default function Shop({ products, status, onOpen, onAdd }) {
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

  return (
    <section id="shop" className="section" aria-labelledby="shop-title">
      <Smoke tone="dark" density={2} />
      <div className="container">
        <div className="section__head section__head--split">
          <div>
            <p className="section__index mono">(02) Shop</p>
            <h2 id="shop-title" className="section__title">The range</h2>
          </div>
          <p className="section__aside">
            Pick a flavour, add it to your cart and send the order on WhatsApp. The owner confirms stock and delivery with you before anything is paid.
          </p>
        </div>

        <div className="filters" role="search">
          <label className="search">
            <span className="sr-only">Search products or flavours</span>
            <SearchIcon />
            <input type="search" placeholder="Search products or flavours" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {brands.length > 1 && (
            <label className="filters__item">
              <span className="sr-only">Brand</span>
              <select className="select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="all">All brands</option>
                {brands.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
          )}
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
          {status === 'loading' ? 'Loading products…' : `${shown.length} product${shown.length === 1 ? '' : 's'}`}
        </p>

        {status === 'error' && <p className="notice">We couldn’t load the catalogue. Please refresh, or order directly on WhatsApp.</p>}

        <div className="index">
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onOpen={onOpen} onAdd={onAdd} eager={i < 2} />
          ))}
        </div>

        {status === 'ready' && shown.length === 0 && (
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
