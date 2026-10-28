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
    };
  }, []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const hasUnpriced = items.some((i) => i.price == null);

  return { items, count, total, hasUnpriced, ...api };
}

// Keeps the product catalogue in sync with any cart prices that changed since the visit was saved.
export function syncPrices(items, products) {
  return items.map((i) => {
    const p = products.find((x) => x.id === i.id);
    return p ? { ...i, price: p.price, name: p.name, image: p.image } : i;
  });
}
