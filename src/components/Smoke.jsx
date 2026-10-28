// Decorative smoke plumes that roll in from the left and right edges of a section.
// Drop <Smoke /> inside any `position: relative` section; useScrollSmoke() (App) feeds
// each one a 0→1 scroll progress as --p, and CSS turns that into slide/drift/opacity.
const plumes = [
  { src: '/fx/smoke-1.webp', side: 'l', cls: 'smoke__plume--a' },
  { src: '/fx/smoke-2.webp', side: 'r', cls: 'smoke__plume--b' },
  { src: '/fx/smoke-3.webp', side: 'l', cls: 'smoke__plume--c' },
  { src: '/fx/smoke-1.webp', side: 'r', cls: 'smoke__plume--d' },
];

export default function Smoke({ tone = 'light', density = 4 }) {
  return (
    <div className={`smoke smoke--${tone}`} aria-hidden="true">
      {plumes.slice(0, density).map((p) => (
        <span key={p.cls} className={`smoke__plume smoke__plume--${p.side} ${p.cls}`}>
          <img src={p.src} alt="" width="1100" height="760" loading="lazy" decoding="async" />
        </span>
      ))}
    </div>
  );
}
