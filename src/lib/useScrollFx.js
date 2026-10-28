import { useEffect, useRef } from 'react';

const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// One scroll loop for the whole page (a single rAF per frame, idle when nothing moves):
//  - --progress on <html> (header progress bar) and .is-scrolled (back-to-top)
//  - --p on each visible section .smoke (slide/drift plumes)
//  - --i on the page-wide .smoke-trail: rises with scroll speed, then decays;
//    data-tone says whether the screen centre is a dark or light section.
// Re-runs when `deps` change (e.g. on page navigation) so new sections are picked up.
export function useScrollFx(deps = []) {
  useEffect(() => {
    const root = document.documentElement;
    const motion = motionOK();
    root.classList.toggle('fx', motion);

    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      schedule();
    });
    document.querySelectorAll('.smoke').forEach((el) => io.observe(el));

    const trail = document.querySelector('.smoke-trail');
    let frame = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let intensity = 0;

    function tick(now) {
      frame = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const speed = Math.abs(y - lastY) / Math.max(16, now - lastT); // px per ms
      lastY = y;
      lastT = now;

      const max = root.scrollHeight - vh;
      root.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
      root.classList.toggle('is-scrolled', y > vh * 0.9);
      if (!motion) return;

      visible.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--p', Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(3));
      });

      if (trail) {
        intensity = Math.max(intensity * 0.93, Math.min(1, speed / 2.4));
        if (intensity < 0.005) intensity = 0;
        trail.style.setProperty('--i', intensity.toFixed(3));
        const under = document.elementFromPoint(window.innerWidth / 2, vh / 2)?.closest('.hero, .pagehead, .cta, .section, .footer, .ticker');
        trail.dataset.tone = under?.matches('.hero, .pagehead, .cta, .section--ink, .footer') ? 'dark' : 'light';
        if (intensity > 0) schedule(); // keep decaying after the scroll stops
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(tick);
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

// Fades an element up the first time it scrolls into view (only when motion is allowed;
// otherwise it is simply visible). Usage: <div ref={useReveal()} data-reveal>.
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOK() || !('IntersectionObserver' in window)) {
      el?.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
