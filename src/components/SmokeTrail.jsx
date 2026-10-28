// Page-wide smoke that billows in from both screen edges while the visitor scrolls,
// then settles. Driven by --i (scroll intensity) and data-tone from useScrollFx().
const plumes = [
  ['l', '/fx/smoke-1.webp', 'a'],
  ['r', '/fx/smoke-3.webp', 'b'],
  ['l', '/fx/smoke-2.webp', 'c'],
  ['r', '/fx/smoke-1.webp', 'd'],
];

export default function SmokeTrail() {
  return (
    <div className="smoke-trail" data-tone="dark" aria-hidden="true">
      {plumes.map(([side, src, id]) => (
        <span key={id} className={`smoke-trail__p smoke-trail__p--${side} smoke-trail__p--${id}`}>
          <img src={src} alt="" width="1100" height="760" decoding="async" />
        </span>
      ))}
    </div>
  );
}
