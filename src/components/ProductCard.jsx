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

  return (
    <article className="card">
      <button className="card__media" onClick={() => onOpen(product)} aria-label={`View details for ${product.name}`}>
        <img src={product.image} alt={product.name} loading={eager ? 'eager' : 'lazy'} width="320" height="320" />
        <span className="card__badges">
          {product.sample && <span className="badge badge--warn">Sample</span>}
          {product.isNew && <span className="badge badge--new">New</span>}
        </span>
        <span className="pricepill" aria-hidden="true">{money(product.price)}</span>
      </button>

      <div className="card__body">
        <p className="card__meta">{product.brand}</p>
        <h3 className="card__title">
          <button onClick={() => onOpen(product)}>{product.name}</button>
        </h3>
        <p className="card__specs">
          {[puffLabel(product), nicotineSummary(product)].filter(Boolean).map((s) => <span key={s}>{s}</span>)}
        </p>
        <p className="sr-only">Price {money(product.price)}</p>

        <label className="field__label" htmlFor={selectId}>Flavour</label>
        <select id={selectId} className="select" value={flavour} onChange={(e) => setFlavour(e.target.value)}>
          {product.flavours.map((f) => (
            <option key={f.name} value={f.name} disabled={!f.available}>
              {f.name}{f.available ? '' : ' — out of stock'}
            </option>
          ))}
        </select>

        <div className="card__actions">
          <button
            className="btn btn--primary"
            disabled={soldOut || !selected?.available}
            onClick={() => onAdd(product, flavour)}
          >
            {soldOut ? 'Out of stock' : 'Add to cart'}
          </button>
          <a
            className="btn btn--icon btn--whatsapp"
            href={waLink(productEnquiry(product, flavour))}
            target="_blank"
            rel="noopener"
            aria-label={`Ask about ${product.name}, ${flavour}, on WhatsApp`}
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>
    </article>
  );
}
