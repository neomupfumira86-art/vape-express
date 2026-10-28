// Electric-blue brand band between the hero and the shop. The track holds the list
// twice so the loop is seamless; decorative only (the same facts appear elsewhere).
export default function Ticker({ items }) {
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {row.map((t, i) => (
          <span key={i} className="ticker__item">
            {t}
            <span className="ticker__dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
