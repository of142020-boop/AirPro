import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

// Reuse the user's analyzer and credentials without modifying it or logging secrets.
const analyzerRoot = resolve(process.argv[2] || '../SEO-Keyword-Analyzer');
const requireAnalyzer = createRequire(join(analyzerRoot, 'package.json'));
const dotenv = requireAnalyzer('dotenv');
const credentials = dotenv.parse(await readFile(join(analyzerRoot, '.env')));
const keywords = ['تركيب شفاط مطبخ', 'تأسيس شفاط المطبخ', 'تأسيس دكت شفاط المطبخ', 'تركيب مدخنة شفاط مطبخ', 'فني تركيب شفاط المطبخ', 'تركيب شفاط المطبخ بدون مدخنة', 'تركيب شفاطات بلت ان', 'تركيب شفاط مطبخ القاهرة', 'تركيب شفاط مطبخ التجمع الخامس', 'تركيب شفاط مطبخ الشيخ زايد', 'مواسير شفاط المطبخ', 'مقاس ماسورة شفاط المطبخ', 'ضعف شفط شفاط المطبخ', 'صوت شفاط المطبخ عالي'];
const output = { checkedAt: new Date().toISOString(), language: 'ar', country: 'Egypt', geoTarget: '2818', keywords, ads: { status: 'pending' }, suggestions: [] };
const timer = setTimeout(() => { console.error('Keyword research timed out.'); process.exit(1); }, 55000);
try {
  const required = ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID', 'GOOGLE_ADS_REFRESH_TOKEN'];
  if (required.some(key => !credentials[key] || /YOUR_|PLACEHOLDER|اكتب/i.test(credentials[key]))) {
    output.ads = { status: 'unavailable', reason: 'Analyzer credentials are incomplete or placeholders.' };
  } else {
    // REST avoids the retired v17 transport bundled with the supplied analyzer.
    const oauth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: credentials.GOOGLE_ADS_CLIENT_ID, client_secret: credentials.GOOGLE_ADS_CLIENT_SECRET, refresh_token: credentials.GOOGLE_ADS_REFRESH_TOKEN, grant_type: 'refresh_token' }), signal: AbortSignal.timeout(12000) });
    const token = await oauth.json();
    if (!oauth.ok || !token.access_token) throw Object.assign(new Error('OAuth failed'), { code: token.error || oauth.status });
    const headers = { Authorization: 'Bearer ' + token.access_token, 'developer-token': credentials.GOOGLE_ADS_DEVELOPER_TOKEN, 'Content-Type': 'application/json' };
    const manager = credentials.GOOGLE_ADS_LOGIN_CUSTOMER_ID || credentials.GOOGLE_ADS_MANAGER_ID;
    if (manager) headers['login-customer-id'] = manager.replaceAll('-', '');
    const targeting = { language: 'languageConstants/1019', geoTargetConstants: ['geoTargetConstants/2818'], keywordPlanNetwork: 'GOOGLE_SEARCH' };
    const request = async (method, body) => {
      const response = await fetch('https://googleads.googleapis.com/v26/customers/' + credentials.GOOGLE_ADS_CUSTOMER_ID.replaceAll('-', '') + ':' + method, { method: 'POST', headers, body: JSON.stringify({ ...targeting, ...body }), signal: AbortSignal.timeout(12000) });
      const data = await response.json();
      if (!response.ok) throw Object.assign(new Error('Google Ads request failed'), { code: data.error?.details?.flatMap(d => d.errors || []).map(e => Object.values(e.errorCode || {}).join(':')).join(',') || data.error?.status || response.status });
      return data;
    };
    let response;
    try { response = await request('generateKeywordHistoricalMetrics', { keywords }); } catch (error) {
      if (!String(error.code).includes('USER_PERMISSION_DENIED') || !headers['login-customer-id']) throw error;
      delete headers['login-customer-id'];
      response = await request('generateKeywordHistoricalMetrics', { keywords });
    }
    const normalizeRest = rows => (rows || []).map(row => { const m = row.keywordMetrics || row.keywordIdeaMetrics || {}; return { keyword: row.text, closeVariants: row.closeVariants || [], monthlySearches: m.avgMonthlySearches == null ? null : Number(m.avgMonthlySearches), advertisingCompetition: m.competition ?? null, months: m.monthlySearchVolumes || [] }; });
    output.ads = { status: 'success', apiVersion: 'v26', historicalMetrics: normalizeRest(response.results) };
    try { const ideas = await request('generateKeywordIdeas', { keywordSeed: { keywords: keywords.slice(0, 5) }, pageSize: 100 }); output.ads.ideas = normalizeRest(ideas.results); } catch { output.ads.ideasStatus = 'unavailable'; }
  }
} catch (error) {
  // API errors can include account details; retain only a non-sensitive code.
  output.ads = { status: 'failed', code: error.code || 'API_CONNECTION_OR_AUTH_ERROR', reason: 'Live Google Ads request did not complete successfully; no new volumes verified.' };
}
for (const query of ['تركيب شفاط المطبخ', 'تأسيس شفاط المطبخ', 'مواسير شفاط المطبخ', 'فني تركيب شفاط']) {
  try {
    const url = new URL('https://suggestqueries.google.com/complete/search');
    for (const [key, value] of Object.entries({ client: 'chrome', hl: 'ar', gl: 'eg', q: query })) url.searchParams.set(key, value);
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error();
    const data = JSON.parse(new TextDecoder(response.headers.get('content-type')?.match(/charset=([^; ]+)/i)?.[1] || 'utf-8').decode(await response.arrayBuffer()));
    output.suggestions.push({ query, keywords: data[1] || [] });
  } catch { output.suggestions.push({ query, status: 'unavailable' }); }
}
clearTimeout(timer);
await mkdir(resolve('docs'), { recursive: true });
await writeFile(resolve('docs/keyword-research-2026-10-30.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ status: output.ads.status, code: output.ads.code, historicalMetrics: output.ads.historicalMetrics?.map(({ keyword, monthlySearches }) => ({ keyword, monthlySearches })), ideaCount: output.ads.ideas?.length, suggestionCount: output.suggestions.reduce((sum, item) => sum + (item.keywords?.length || 0), 0), output: 'docs/keyword-research-2026-10-30.json' }, null, 2));
process.exit(0);
