import { useEffect, useState } from 'react';

// Five-page site without a router dependency: History API + one popstate listener.
// vercel.json rewrites every extension-less path to index.html, so deep links work.
export const PAGES = {
  '/': { title: 'Premium Vapes Delivered in Harare' },
  '/shop': { title: 'Shop' },
  '/how-it-works': { title: 'How to order' },
  '/delivery': { title: 'Delivery' },
  '/contact': { title: 'Contact' },
};

const normalise = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

export function usePath() {
  const [path, setPath] = useState(() => normalise(window.location.pathname));
  useEffect(() => {
    const onPop = () => setPath(normalise(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return PAGES[path] ? path : '/';
}

export function navigate(to) {
  if (to !== window.location.pathname) window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// <a> that navigates in-app for plain left clicks and behaves normally otherwise.
export function Link({ to, onClick, ...props }) {
  return (
    <a
      href={to}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
    />
  );
}
