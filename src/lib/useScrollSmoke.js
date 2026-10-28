import { useEffect } from 'react';

// Writes each visible .smoke element's scroll progress (0 = entering from below,
// 1 = leaving at the top) to the CSS variable --p. One rAF per scroll frame,
// visible elements only; does nothing when the user prefers reduced motion.
export function useScrollSmoke(deps = []) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [...document.querySelectorAll('.smoke')];
    if (!els.length) return;

    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      schedule();
    });
    els.forEach((el) => io.observe(el));

    let frame = 0;
    function update() {
      frame = 0;
      const vh = window.innerHeight;
      visible.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty('--p', p.toFixed(3));
      });
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
