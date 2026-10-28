export const money = (n) => (n == null ? 'Price on request' : `US$${n.toFixed(2).replace(/\.00$/, '')}`);
