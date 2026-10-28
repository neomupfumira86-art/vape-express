import ProductCard from './ProductCard.jsx';
import { SectionHeader } from './InfoSections.jsx';
import { Link } from '../lib/router.jsx';
import { ArrowIcon } from './Icons.jsx';

// Home page: the featured products as the first rows of the index, then a way into the full shop.
export default function HomePicks({ products, onOpen, onAdd }) {
  const picks = products.filter((p) => p.featured).slice(0, 3);
  const list = picks.length ? picks : products.slice(0, 3);
  if (!list.length) return null;
  return (
    <section className="section" aria-labelledby="picks-title">
      <div className="container">
        <SectionHeader index="(01) Top picks" title="Top picks." id="picks-title">
          A few favourites from the current range. Choose a flavour and add it to your cart, or browse everything in the shop.
        </SectionHeader>
        <div className="index">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onOpen={onOpen} onAdd={onAdd} eager={i === 0} />
          ))}
        </div>
        <Link className="more-link mono" to="/shop">
          View all {String(products.length).padStart(2, '0')} products <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
