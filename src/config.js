// ─────────────────────────────────────────────────────────────
// Vape Express — site settings.
// The owner can edit this file safely. Anything written as
// '[CONFIRM WITH OWNER]' is shown on the site as a visible placeholder
// until a real value is entered.
// ─────────────────────────────────────────────────────────────

export const CONFIRM = '[CONFIRM WITH OWNER]';

export const business = {
  name: 'Vape Express',
  tagline: 'Your Vape. Delivered.',
  city: 'Harare',
  country: 'Zimbabwe',
  whatsappDisplay: '+263 78 024 7322',
  whatsappNumber: '263780247322', // digits only, international format, no "+"
  instagramHandle: '@vapeexpresszw',
  // Profile URL not yet verified with the owner — check it opens the right account before launch.
  instagramUrl: 'https://www.instagram.com/vapeexpresszw/',
  currency: 'USD',
};

// Payment preferences shown at checkout. The website does NOT process payment;
// this only tells the owner how the customer would like to pay.
// Set `enabled: false` to hide a method. Every method still needs owner confirmation.
export const paymentMethods = [
  { id: 'ecocash', label: 'EcoCash', enabled: true },
  // Owner wrote "Imbax" — assumed to mean InnBucks. Confirm spelling/provider before launch.
  { id: 'innbucks', label: 'InnBucks', enabled: true },
  { id: 'bank', label: 'Bank transfer', enabled: true },
  { id: 'cash', label: 'USD cash on arrival', enabled: true },
];

// Delivery and policy terms. Replace each CONFIRM value once the owner confirms it.
export const delivery = {
  area: 'Deliveries around Harare.',
  fees: CONFIRM,
  areas: CONFIRM,
  times: CONFIRM,
  collection: CONFIRM,
  minimumOrder: CONFIRM,
  openingHours: CONFIRM,
  returns: CONFIRM,
  warranty: CONFIRM,
};

// Optional hero background video (e.g. exported from Higgsfield).
// Drop files into /public/media with these names. If they are missing, the hero
// automatically falls back to the animated CSS background — nothing breaks.
export const heroVideo = {
  enabled: true,
  mp4: '/media/hero.mp4',
  webm: '/media/hero.webm',
  poster: '/media/hero-poster.jpg',
};

export const nicotineWarning = 'This product contains nicotine. Nicotine is an addictive chemical.';
