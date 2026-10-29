import { useEffect, useMemo, useState } from 'react';

const KEY = 'vx-cart-v1';

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Each product + flavour combination is its own cart line.
export function useCart() {
  const [items, setItems] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage blocked — cart still works for this visit */
    }
  }, [items]);

  const api = useMemo(() => {
    const key = (id, flavour) => `${id}::${flavour}`;
    return {
      add(product, flavour, qty = 1) {
        setItems((prev) => {
          const k = key(product.id, flavour);
          const hit = prev.find((i) => i.key === k);
          if (hit) return prev.map((i) => (i.key === k ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
          return [...prev, { key: k, id: product.id, name: product.name, image: product.image, price: product.price, flavour, qty }];
        });
      },
      setQty(k, qty) {
        setItems((prev) => (qty <= 0 ? prev.filter((i) => i.key !== k) : prev.map((i) => (i.key === k ? { ...i, qty: Math.min(99, qty) } : i))));
      },
      remove(k) {
        setItems((prev) => prev.filter((i) => i.key !== k));
      },
      clear() {
        setItems([]);
      },
      replace(next) {
        setItems(next);
      },
    };
  }, []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const hasUnpriced = items.some((i) => i.price == null);

  return { items, count, total, hasUnpriced, ...api };
}

// Brings a saved cart in line with the live catalogue: current names, images and
// prices, and drops lines whose product is hidden/deleted or whose flavour is sold out.
export function reconcileCart(items, products) {
  let removed = 0;
  let changed = false;
  const next = [];
  for (const i of items) {
    const p = products.find((x) => x.id === i.id);
    const f = p?.flavours.find((x) => x.name === i.flavour);
    if (!p || !f?.available) {
      removed += 1;
      changed = true;
      continue;
    }
    if (i.price !== p.price || i.name !== p.name || i.image !== p.image) changed = true;
    next.push({ ...i, price: p.price, name: p.name, image: p.image });
  }
  return { items: next, removed, changed };
}
