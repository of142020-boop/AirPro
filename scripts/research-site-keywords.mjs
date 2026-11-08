import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(process.argv[2] || '../SEO-Keyword-Analyzer');
const requireAnalyzer = createRequire(join(root, 'package.json'));
const credentials = requireAnalyzer('dotenv').parse(await readFile(join(root, '.env')));
const clusters = [
 { id: 'home', seeds: ['تركيب شفاط مطبخ', 'تأسيس شفاط المطبخ', 'تركيب شفاط بلت ان', 'تركيب شفاط هرمي', 'تركيب شفاط مسطح', 'تركيب شفاط توشيبا'], suggest: ['تأسيس شفاط المطبخ', 'تركيب شفاط بلت ان'] },
 { id: 'bathroom', seeds: ['تركيب شفاط حمام', 'تأسيس شفاط حمام', 'شفاط سقف حمام', 'شفاط حمام بدون شباك', 'شفاط حمام مركزي'], suggest: ['تركيب شفاط حمام', 'شفاط حمام سقف'] },
 { id: 'restaurant', seeds: ['هود مطاعم', 'مداخن مطاعم', 'شفاطات مطاعم', 'تهوية المطاعم', 'تصنيع هود مطاعم', 'تركيب هود مطاعم'], suggest: ['مداخن مطاعم', 'هود مطاعم'] },
 { id: 'blowers', seeds: ['بلاور شفط', 'بلاور مطاعم', 'شفاط صناعي', 'شفاطات مصانع', 'شفاط مركزي', 'بلاور طرد مركزي', 'تركيب بلاور'], suggest: ['بلاور شفط', 'شفاط صناعي'] },
 { id: 'ducts', seeds: ['دكت شفاط', 'دكت تهوية', 'تصنيع دكت', 'تركيب دكت', 'مواسير شفاط المطبخ', 'دكت صاج'], suggest: ['دكت تهوية', 'دكت شفاط'] },
 { id: 'maintenance', seeds: ['تنظيف مداخن المطاعم', 'تنظيف هود المطاعم', 'صيانة شفاطات', 'صيانة بلاور', 'تنظيف شفاط المطبخ', 'صيانة شفاط المطبخ'], suggest: ['تنظيف مداخن المطاعم', 'صيانة بلاور'] },
 { id: 'ac', seeds: ['دكت تكييف', 'تركيب دكت تكييف', 'تصنيع دكت تكييف', 'عزل دكت التكييف', 'مجاري الهواء'], suggest: ['دكت تكييف', 'عزل دكت'] }
];
const outputPath = resolve('docs/site-keyword-research-2026-10-30.json');
/** @type {Record<string, any>} */
const output = { checkedAt: new Date().toISOString(), country: 'Egypt', language: 'Arabic', network: 'GOOGLE_SEARCH', apiVersion: 'v26', source: 'User-specified SEO-Keyword-Analyzer credentials; read-only Google Ads keyword planning and Google Suggest', clusters: [], seedMetrics: [], suggestionMetrics: [] };
await mkdir(resolve('docs'), { recursive: true });
const save = async () => { for (let attempt = 0; attempt < 4; attempt++) { try { await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n'); return; } catch (error) { if (attempt === 3) throw error; await new Promise(resolve => setTimeout(resolve, 200)); } } };
try { const previous = JSON.parse(await readFile(outputPath, 'utf8')); if (previous.country === output.country && previous.checkedAt?.startsWith(new Date().toISOString().slice(0,10))) { output.seedMetrics = previous.seedMetrics || []; output.clusters = (previous.clusters || []).filter(c => c.status === 'success'); } } catch {}
let stage = 'oauth';
const safeCode = error => String(error.code || error.name || 'REQUEST_FAILED').slice(0, 100);
const normalize = rows => (rows || []).map(row => { const m = row.keywordMetrics || row.keywordIdeaMetrics || {}; return { keyword: row.text, closeVariants: row.closeVariants || [], monthlySearches: m.avgMonthlySearches == null ? null : Number(m.avgMonthlySearches), advertisingCompetition: m.competition ?? null, advertisingCompetitionIndex: m.competitionIndex == null ? null : Number(m.competitionIndex), months: m.monthlySearchVolumes || [] }; });
try {
 const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: credentials.GOOGLE_ADS_CLIENT_ID, client_secret: credentials.GOOGLE_ADS_CLIENT_SECRET, refresh_token: credentials.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }), signal: AbortSignal.timeout(12000) });
 const token = await tokenResponse.json();
 if (!tokenResponse.ok || !token.access_token) throw Object.assign(new Error('OAuth failed'), { code: token.error || tokenResponse.status });
 const headers = { Authorization: 'Bearer ' + token.access_token, 'developer-token': credentials.GOOGLE_ADS_DEVELOPER_TOKEN, 'Content-Type': 'application/json' };
 const targeting = { language: 'languageConstants/1019', geoTargetConstants: ['geoTargetConstants/2818'], keywordPlanNetwork: 'GOOGLE_SEARCH' };
 const request = async (method, body) => {
  const response = await fetch('https://googleads.googleapis.com/v26/customers/' + credentials.GOOGLE_ADS_CUSTOMER_ID.replaceAll('-', '') + ':' + method, { method: 'POST', headers, body: JSON.stringify({ ...targeting, ...body }), signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error('Google Ads failed'), { code: data.error?.details?.flatMap(d => d.errors || []).map(e => Object.values(e.errorCode || {}).join(':')).join(',') || data.error?.status || response.status });
  return data;
 };
 const additionalSeeds = ['تركيب شفاطات', 'تأسيس شفاطات', 'تركيب شفاط المطبخ على الشباك', 'بلاور شفط وطرد', 'تصليح شفاط مطبخ', 'شفاط مركزي للمطبخ', 'مقاس ماسورة شفاط المطبخ', 'حساب قدرة شفاط المطبخ', 'صيانة بلاورات', 'تنظيف هود مطاعم', 'تركيب شفاط حمام في السقف'];
 const seeds = [...new Set([...clusters.flatMap(c => c.seeds), ...additionalSeeds])];
 stage = 'seed-metrics';
 if (!output.seedMetrics.some(row => row.keyword === 'تركيب شفاطات')) output.seedMetrics = normalize((await request('generateKeywordHistoricalMetrics', { keywords: seeds })).results);
 await save();
 for (let start = 0; start < clusters.length; start += 2) {
  const batch = clusters.slice(start, start + 2).filter(c => !output.clusters.some(done => done.id === c.id));
  if (!batch.length) continue;
  stage = batch.map(c => c.id).join(',');
  const results = await Promise.allSettled(batch.map(async cluster => {
   const data = await request('generateKeywordIdeas', { keywordSeed: { keywords: cluster.seeds }, pageSize: 150 });
   const suggestions = await Promise.all(cluster.suggest.map(async query => {
    try {
     const url = new URL('https://suggestqueries.google.com/complete/search');
     for (const [key, value] of Object.entries({ client: 'chrome', hl: 'ar', gl: 'eg', q: query })) url.searchParams.set(key, value);
     const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
     if (!response.ok) throw new Error();
     const data = JSON.parse(new TextDecoder(response.headers.get('content-type')?.match(/charset=([^; ]+)/i)?.[1] || 'utf-8').decode(await response.arrayBuffer()));
     return { query, keywords: data[1] || [] };
    } catch (error) { return { query, status: 'failed', code: safeCode(error) }; }
   }));
   return { ...cluster, status: 'success', ideas: normalize(data.results), hasMoreIdeas: !!data.nextPageToken, suggestions };
  }));
  results.forEach((result, index) => output.clusters.push(result.status === 'fulfilled' ? result.value : { ...batch[index], status: 'failed', code: safeCode(result.reason) }));
  await save();
 }
 const suggestionKeywords = [...new Set(output.clusters.flatMap(c => (c.suggestions || []).flatMap(s => s.keywords || [])))];
 if (suggestionKeywords.length) {
  try { output.suggestionMetrics = normalize((await request('generateKeywordHistoricalMetrics', { keywords: suggestionKeywords })).results); }
  catch (error) { output.suggestionMetricsError = safeCode(error); }
 }
 output.completedAt = new Date().toISOString();
} catch (error) { output.error = safeCode(error); output.failedStage = stage; }
await save();
console.log(JSON.stringify({ file: outputPath, error: output.error, seedCount: output.seedMetrics.length, suggestionMetricsCount: output.suggestionMetrics.length, clusters: output.clusters.map(c => ({ id: c.id, status: c.status, ideaCount: c.ideas?.length, hasMoreIdeas: c.hasMoreIdeas, top: [...(c.ideas || [])].sort((a,b)=>(b.monthlySearches||0)-(a.monthlySearches||0)).slice(0,6).map(({keyword,monthlySearches})=>({keyword,monthlySearches})) })) }, null, 2));
process.exitCode = output.error ? 1 : 0;
