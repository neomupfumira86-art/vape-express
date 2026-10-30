// After `vite build`: copy index.html to 404.html. Hosts that ignore .htaccess
// (or don't support rewrites) usually serve 404.html for unknown addresses,
// so /shop, /admin etc. still open the site instead of an error page.
import { copyFileSync } from 'node:fs';
copyFileSync(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url));
console.log('postbuild: dist/404.html created');
