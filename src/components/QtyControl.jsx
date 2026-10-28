import { MinusIcon, PlusIcon } from './Icons.jsx';

export default function QtyControl({ value, onChange, label, min = 1 }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <MinusIcon width={16} height={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= 99} aria-label="Increase quantity">
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
