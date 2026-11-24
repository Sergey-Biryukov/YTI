import { build as viteBuild } from 'vite';
import { cp, readFile, rm } from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await viteBuild({build:{outDir:'dist/client'}});
await cp('dist/client/index.html', 'dist/client/404.html');
// GitHub Pages serves /contact from contact.html with HTTP 200 (no redirect), so give every
// app route its own copy of the SPA shell instead of relying on the 404.html fallback.
const appSource = await readFile('src/App.tsx','utf8');
const routes = [...appSource.matchAll(/<Route\s+path="([a-z0-9-]+)"/g)].map(m=>m[1]);
if (!routes.length) throw new Error('No routes found in src/App.tsx');
for (const route of routes) await cp('dist/client/index.html', `dist/client/${route}.html`);
console.log(`Static route pages: ${routes.join(', ')}`);
