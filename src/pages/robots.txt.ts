import { launchReady, site } from '../../config/launch.mjs';
export function GET() {
  const body = launchReady && site
    ? `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`
    : 'User-agent: *\nAllow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
