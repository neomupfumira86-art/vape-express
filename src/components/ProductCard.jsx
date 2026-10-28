import { useState } from 'react';
import { money } from '../lib/format.js';
import { puffLabel, nicotineSummary } from '../lib/catalogue.js';
import { waLink, productEnquiry } from '../lib/whatsapp.js';
import { WhatsAppIcon } from './Icons.jsx';

export default function ProductCard({ product, onOpen, onAdd, eager = false }) {
  const firstAvailable = product.flavours.find((f) => f.available) ?? product.flavours[0];
  const [flavour, setFlavour] = useState(firstAvailable.name);
  const selected = product.flavours.find((f) => f.name === flavour);
  const soldOut = product.flavours.every((f) => !f.available);
  const selectId = `flv-${product.id}`;
  const specs = [puffLabel(product), nicotineSummary(product)].filter(Boolean);

  return (
    <article className="card">
      <button className="card__media" onClick={() => onOpen(product)} aria-label={`View details for ${product.name}`}>
        <img src={product.image} alt={product.name} loading={eager ? 'eager' : 'lazy'} width="320" height="320" />
        {(product.sample || product.isNew) && (
          <span className="card__badges">
            {product.sample && <span className="badge badge--warn">Sample</span>}
            {product.isNew && <span className="badge">New</span>}
          </span>
        )}
      </button>

      <div className="card__body">
        <div className="card__head">
          <div>
            <p className="card__brand">{product.brand}</p>
            <h3 className="card__title">
              <button onClick={() => onOpen(product)}>{product.name}</button>
            </h3>
          </div>
          <p className="card__price"><span className="sr-only">Price </span>{money(product.price)}</p>
        </div>
        {specs.length > 0 && <p className="card__specs">{specs.join(' · ')}</p>}

        <label className="field__label" htmlFor={selectId}>Flavour</label>
        <select id={selectId} className="select" value={flavour} onChange={(e) => setFlavour(e.target.value)}>
          {product.flavours.map((f) => (
            <option key={f.name} value={f.name} disabled={!f.available}>
              {f.name}{f.available ? '' : ' — out of stock'}
            </option>
          ))}
        </select>

        <div className="card__actions">
          <button className="btn btn--primary" disabled={soldOut || !selected?.available} onClick={() => onAdd(product, flavour)}>
            {soldOut ? 'Out of stock' : 'Add to cart'}
          </button>
          <a
            className="btn btn--icon btn--secondary"
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
