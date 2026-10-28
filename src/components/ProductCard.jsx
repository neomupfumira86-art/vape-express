import { useState } from 'react';
import { money } from '../lib/format.js';
import { puffLabel, nicotineSummary } from '../lib/catalogue.js';
import { waLink, productEnquiry } from '../lib/whatsapp.js';
import { WhatsAppIcon, ArrowIcon } from './Icons.jsx';

// One entry in the numbered product index (editorial row, not a card grid).
export default function ProductCard({ product, index, onOpen, onAdd, eager = false }) {
  const firstAvailable = product.flavours.find((f) => f.available) ?? product.flavours[0];
  const [flavour, setFlavour] = useState(firstAvailable.name);
  const selected = product.flavours.find((f) => f.name === flavour);
  const soldOut = product.flavours.every((f) => !f.available);
  const selectId = `flv-${product.id}`;
  const specs = [puffLabel(product), nicotineSummary(product)].filter(Boolean);

  return (
    <article className="item">
      <span className="item__num mono" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>

      <button className="item__media" onClick={() => onOpen(product)} aria-label={`View details for ${product.name}`}>
        <img src={product.image} alt={product.name} loading={eager ? 'eager' : 'lazy'} width="400" height="400" />
        {(product.sample || product.isNew) && (
          <span className="item__tag mono">{product.sample ? 'Sample' : 'New'}</span>
        )}
      </button>

      <div className="item__main">
        <p className="item__brand mono">{[product.brand, product.category].filter(Boolean).join(' — ')}</p>
        <h3 className="item__title">
          <button onClick={() => onOpen(product)}>{product.name}</button>
        </h3>
        {specs.length > 0 && <p className="item__specs mono">{specs.join(' / ')}</p>}
        <button className="item__more mono" onClick={() => onOpen(product)}>
          All {product.flavours.length} flavours <ArrowIcon width={16} height={16} />
        </button>
      </div>

      <div className="item__buy">
        <p className="item__price"><span className="sr-only">Price </span>{money(product.price)}</p>
        <label className="field__label mono" htmlFor={selectId}>Flavour</label>
        <select id={selectId} className="select" value={flavour} onChange={(e) => setFlavour(e.target.value)}>
          {product.flavours.map((f) => (
            <option key={f.name} value={f.name} disabled={!f.available}>
              {f.name}{f.available ? '' : ' — out of stock'}
            </option>
          ))}
        </select>
        <div className="item__actions">
          <button className="btn btn--ink" disabled={soldOut || !selected?.available} onClick={() => onAdd(product, flavour)}>
            {soldOut ? 'Out of stock' : 'Add to cart'}
          </button>
          <a
            className="btn btn--icon btn--line"
            href={waLink(productEnquiry(product, flavour))}
            target="_blank"
            rel="noopener"
            aria-label={`Ask about ${product.name}, ${flavour}, on WhatsApp`}
          >
            <WhatsAppIcon className="wa-icon" />
          </a>
        </div>
      </div>
    </article>
  );
}
