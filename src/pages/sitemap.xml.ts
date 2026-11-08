import { launchReady, site } from '../../config/launch.mjs';
const routes = Object.keys(import.meta.glob('./**/*.astro'))
  .map(path => path.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/index$/, '') || '/')
  .filter(path => !['/portfolio', '/404'].includes(path));
export function GET() {
  const urls = launchReady && site ? routes.map(route => `<url><loc>${new URL(route, site).href}</loc></url>`).join('') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
