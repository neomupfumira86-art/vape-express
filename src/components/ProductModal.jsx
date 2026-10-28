import { useEffect, useState } from 'react';
import Dialog from './Dialog.jsx';
import QtyControl from './QtyControl.jsx';
import { money } from '../lib/format.js';
import { showValue, puffLabel } from '../lib/catalogue.js';
import { waLink, productEnquiry } from '../lib/whatsapp.js';
import { WhatsAppIcon } from './Icons.jsx';

export default function ProductModal({ product, onClose, onAdd }) {
  const [flavour, setFlavour] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    setFlavour((product.flavours.find((f) => f.available) ?? product.flavours[0]).name);
    setQty(1);
  }, [product]);

  const p = product;
  const selected = p?.flavours.find((f) => f.name === flavour);
  const anyNicotine = p?.flavours.some((f) => f.nicotine != null);

  return (
    <Dialog
      open={Boolean(p)}
      onClose={onClose}
      title={p?.name ?? ''}
      footer={
        p && (
          <div className="pm__foot">
            <QtyControl value={qty} onChange={(v) => setQty(Math.max(1, v))} label="Quantity" />
            <button className="btn btn--primary" disabled={!selected?.available} onClick={() => { onAdd(p, flavour, qty); onClose(); }}>
              Add to cart · {p.price == null ? 'price TBC' : money(p.price * qty)}
            </button>
          </div>
        )
      }
    >
      {p && (
        <div className="pm">
          <div className="pm__media">
            <img src={p.image} alt={p.name} width="480" height="480" />
          </div>
          <div className="pm__info">
            <p className="card__meta">{p.brand}</p>
            <p className="pm__price">{money(p.price)}</p>
            {p.sample && <p className="notice notice--warn">Sample product — not real stock.</p>}
            {p.description && <p className="muted">{p.description}</p>}

            <dl className="specs">
              {p.category && (<><dt>Type</dt><dd>{p.category}</dd></>)}
              {puffLabel(p) && (<><dt>Puffs</dt><dd>{puffLabel(p).replace(' puffs', '')}</dd></>)}
              <dt>Availability</dt>
              <dd>Confirmed by the owner on WhatsApp</dd>
            </dl>

            <fieldset className="flavours">
              <legend className="field__label">Choose a flavour</legend>
              {p.flavours.map((f) => (
                <label key={f.name} className={`flavour ${!f.available ? 'is-out' : ''}`}>
                  <input type="radio" name="flavour" value={f.name} checked={flavour === f.name} disabled={!f.available} onChange={() => setFlavour(f.name)} />
                  <span className="flavour__name">{f.name}</span>
                  {anyNicotine && <span className="flavour__nic">{f.nicotine == null ? '—' : showValue(f.nicotine)}</span>}
                  {!f.available && <span className="flavour__nic">Out of stock</span>}
                </label>
              ))}
            </fieldset>
            {anyNicotine && <p className="small muted">Nicotine strength shown next to each flavour.</p>}

            <a className="btn btn--whatsapp btn--block" href={waLink(productEnquiry(p, flavour))} target="_blank" rel="noopener">
              <WhatsAppIcon /> Ask about this on WhatsApp
            </a>
          </div>
        </div>
      )}
    </Dialog>
  );
}
