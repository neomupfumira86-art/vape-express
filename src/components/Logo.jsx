import { useState } from 'react';
import { business } from '../config.js';

// Shows the supplied logo file (/public/brand/logo.webp).
// Until that file exists, falls back to the plain business name — never a redrawn logo.
export default function Logo({ className = '', height = 40, hideFallback = false }) {
  const [failed, setFailed] = useState(false);
  if (failed && hideFallback) return null;
  if (failed) return <span className={`logo-fallback ${className}`}>{business.name}</span>;
  return (
    <img
      className={`logo ${className}`}
      src="/brand/logo.webp"
      alt={business.name}
      style={{ height }}
      onError={() => setFailed(true)}
    />
  );
}
