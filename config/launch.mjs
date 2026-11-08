const value = process.env.SITE_URL?.trim();
/** @type {string | undefined} */
let site;
if (value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('SITE_URL must be the final HTTPS origin, without a path or credentials.');
  }
  site = url.origin;
}
const launchReady = process.env.SITE_LAUNCH_READY === 'true';
if (launchReady && !site) throw new Error('Set SITE_URL before enabling SITE_LAUNCH_READY.');
export { site, launchReady };
