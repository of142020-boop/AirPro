import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parse } from 'parse5';
import { launchReady, site } from '../config/launch.mjs';
const root = resolve(process.env.SEO_DIST || 'dist');
const files = [];
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes:true })) { const path=join(dir,entry.name); if(entry.isDirectory()) await walk(path); else if(path.endsWith('.html')) files.push(path); } }
await walk(root);
const pages = new Map();
const errors = [];
const titles = new Map(), descriptions = new Map();
const attr = (node,key) => node.attrs?.find(item=>item.name===key)?.value;
const txt = node => node.nodeName==='#text' ? node.value : (node.childNodes||[]).map(txt).join('');
for (const file of files) {
 const html=await readFile(file,'utf8'); const nodes=[];
 function visit(node) { nodes.push(node); for(const child of node.childNodes||[]) visit(child); }
 visit(parse(html));
 const route='/'+file.slice(root.length+1).replaceAll('\\','/').replace(/(?:^|\/)index\.html$/, '').replace(/\.html$/, '').replace(/\/$/,'');
 const ids=nodes.map(n=>attr(n,'id')).filter(Boolean);
 const fail=message=>errors.push(`${route}: ${message}`);
 for(const tag of ['title','h1']) if(nodes.filter(n=>n.tagName===tag).length!==1) fail(`Expected one ${tag}`);
 const title=txt(nodes.find(n=>n.tagName==='title')||{}).trim();
 const desc=attr(nodes.find(n=>n.tagName==='meta'&&attr(n,'name')==='description')||{},'content');
 if(!desc) fail('Missing description');
 for(const [map,value,label] of [[titles,title,'title'],[descriptions,desc,'description']]) { if(map.has(value)) fail(`Duplicate ${label} with ${map.get(value)}`); map.set(value,route); }
 if(new Set(ids).size!==ids.length) fail('Duplicate IDs');
 const robots=attr(nodes.find(n=>n.tagName==='meta'&&attr(n,'name')==='robots')||{},'content');
 const excluded=['/404','/portfolio'].includes(route);
 if(robots!==((launchReady&&site&&!excluded)?'index,follow':'noindex,follow')) fail('Incorrect robots mode');
 const canonical=nodes.filter(n=>n.tagName==='link'&&attr(n,'rel')==='canonical');
 if(site ? canonical.length!==1 || attr(canonical[0],'href')!==new URL(route==='/'?'/':route,site).href : canonical.length!==0) fail('Incorrect canonical');
 for(const node of nodes.filter(n=>n.tagName==='script'&&attr(n,'type')==='application/ld+json')) { try {JSON.parse(txt(node));} catch {fail('Invalid JSON-LD');} }
 for(const image of nodes.filter(n=>n.tagName==='img')) if(!attr(image,'alt')) fail('Missing image alt');
 for(const node of nodes.filter(n=>n.tagName==='a')) {const href=attr(node,'href'); if(!href||href==='#') fail('Empty link'); if(href?.startsWith('tel:')&&href!=='tel:+201101219418') fail(`Unexpected phone ${href}`);}
 if(/images\.unsplash|tel:19418|تم إرسال رسالتك بنجاح/.test(html)) fail('Placeholder content or false submission claim');
 pages.set(route,{nodes,ids,html,fail});
}
for(const [route,page] of pages) {
 for(const node of page.nodes) {
  const ref=node.tagName==='a'?attr(node,'href'):['img','script'].includes(node.tagName)?attr(node,'src'):node.tagName==='link'&&attr(node,'rel')!=='canonical'?attr(node,'href'):null;
  if(!ref||/^(?:[a-z]+:|\/\/)/i.test(ref)) continue;
  const url=new URL(ref,'https://local.invalid'+route);
  const pathname=decodeURIComponent(url.pathname).replace(/\/$/,'')||'/';
  const target=pages.get(pathname);
  if(node.tagName==='a' && target) {if(url.hash&&!target.ids.includes(decodeURIComponent(url.hash.slice(1)))) page.fail(`Broken fragment ${ref}`);}
  else {try {const file=resolve(root,'.'+url.pathname); if(!file.startsWith(root+'\\')&&!file.startsWith(root+'/')) throw new Error(); if(!(await stat(file)).isFile()) throw new Error();} catch {page.fail(`Missing local target ${ref}`);}}
 }
}
// Verify the keyword plan against the generated pages, not only the source JSON.
const keywordPlan = JSON.parse(await readFile(resolve('src/data/keyword-map.json'), 'utf8'));
const normalized = value => value.normalize('NFKC').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/[ً-ٟ]/g, '').replace(/\s+/g, ' ').trim();
const primaryOwners = new Map();
for (const target of keywordPlan) {
 const page = pages.get(target.path);
 if (!page) { errors.push('Missing planned page ' + target.path); continue; }
 const key = normalized(target.primary);
 if (primaryOwners.has(key)) page.fail('Primary keyword already assigned to ' + primaryOwners.get(key));
 primaryOwners.set(key, target.path);
 const title = txt(page.nodes.find(n => n.tagName === 'title')).trim();
 const heading = txt(page.nodes.find(n => n.tagName === 'h1')).trim();
 const description = attr(page.nodes.find(n => n.tagName === 'meta' && attr(n, 'name') === 'description'), 'content');
 if (title !== target.title || heading !== target.h1 || description !== target.description) page.fail('Rendered metadata differs from keyword plan');
 if (title.length >= 60 || description.length >= 155) page.fail('Planned metadata exceeds editorial character limits');
 if (!normalized(heading).includes(key)) page.fail('Primary keyword missing from H1');
 for (const link of target.related) if (!page.nodes.some(n => n.tagName === 'a' && attr(n, 'href') === link.href)) page.fail('Missing planned internal link ' + link.href);
 if (target.path !== '/' && ![...pages.values()].some(other => other !== page && other.nodes.some(n => n.tagName === 'a' && attr(n, 'href')?.split('#')[0] === target.path))) page.fail('Planned page has no inbound internal link');
 const schemas = page.nodes.filter(n => n.tagName === 'script' && attr(n, 'type') === 'application/ld+json').flatMap(n => { try { const data = JSON.parse(txt(n)); return data['@graph'] || [data]; } catch { return []; } });
 if (site && target.path.startsWith('/services/')) {
  if (!schemas.some(n => n['@type'] === 'Service')) page.fail('Missing Service schema');
  const faq = schemas.find(n => n['@type'] === 'FAQPage');
  const visible = page.nodes.filter(n => n.tagName === 'details');
  if (!faq || faq.mainEntity?.length !== visible.length) page.fail('FAQ schema count differs from visible questions');
  else faq.mainEntity.forEach((question, index) => { const details = visible[index]; if (question.name !== txt(details.childNodes.find(n => n.tagName === 'summary')) || question.acceptedAnswer?.text !== txt(details.childNodes.find(n => n.tagName === 'p'))) page.fail('FAQ schema text differs from visible content'); });
 }
 if (site && target.path.startsWith('/blog/') && !schemas.some(n => n['@type'] === 'Article' && n.headline === target.h1)) page.fail('Missing or mismatched Article schema');
}
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
const robots=await readFile(join(root,'robots.txt'),'utf8');
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
const expected=[...pages.keys()].filter(route=>!['/404','/portfolio'].includes(route));
if(launchReady&&site) {for(const route of expected) if(!locs.includes(new URL(route,site).href)) errors.push(`Missing sitemap URL ${route}`); if(locs.length!==expected.length) errors.push('Unexpected sitemap URL count'); if(!robots.includes(`Sitemap: ${site}/sitemap.xml`)) errors.push('Missing sitemap declaration');}
else if(locs.length||robots.includes('Sitemap:')) errors.push('Draft must not advertise sitemap URLs');
if(errors.length) {console.error(errors.join('\n'));process.exit(1);}
console.log(`SEO checks passed: ${pages.size} pages; ${launchReady?'launch':'draft'} mode; local links, metadata, phones, fragments and sitemap valid.`);
