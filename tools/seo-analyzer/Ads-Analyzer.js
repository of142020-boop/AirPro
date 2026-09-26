const https = require('https');
const readline = require('readline');
const querystring = require('querystring');

// Credentials from .env
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';
const DEVELOPER_TOKEN = 'YOUR_DEVELOPER_TOKEN';
const MANAGER_ID = 'YOUR_MANAGER_ID';
const CUSTOMER_ID = 'YOUR_CUSTOMER_ID';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('===========================================================');
console.log('   🔥 أداة إير برو الاحترافية (متصلة بـ Google Ads API) 🔥  ');
console.log('      (تجلب حجم البحث الدقيق، المنافسة، وسعر النقرة)      ');
console.log('===========================================================\n');

function getAccessToken() {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token'
        });

        const options = {
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const parsed = JSON.parse(data);
                if (parsed.access_token) resolve(parsed.access_token);
                else reject('فشل الحصول على Access Token');
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function fetchKeywordIdeas(accessToken, keyword) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            keywordSeed: {
                keywords: [keyword]
            },
            geoTargetConstants: ['geoTargetConstants/2818'], // Egypt
            language: 'languageConstants/1019', // Arabic
            keywordPlanNetwork: 'GOOGLE_SEARCH'
        });

        const options = {
            hostname: 'googleads.googleapis.com',
            path: `/v17/customers/${CUSTOMER_ID}:generateKeywordIdeas`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': DEVELOPER_TOKEN,
                'login-customer-id': MANAGER_ID,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const parsed = JSON.parse(data);
                if (parsed.error) reject(parsed.error.message);
                else resolve(parsed.results || []);
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function askKeyword() {
    rl.question('👉 أدخل الكلمة التي تريد تحليلها (أو "خروج" للإغلاق): ', async (query) => {
        if (query.trim() === 'خروج') {
            console.log('👋 وداعاً!');
            rl.close();
            return;
        }
        if (!query.trim()) return askKeyword();

        console.log(`\n⏳ جاري الاتصال بخوادم Google Ads لسحب بيانات كلمة: "${query}"...\n`);

        try {
            const token = await getAccessToken();
            const results = await fetchKeywordIdeas(token, query);

            if (results.length === 0) {
                console.log('❌ لم يتم العثور على بيانات إعلانية لهذه الكلمة في مصر.');
            } else {
                console.log('✅ النتائج الرسمية من جوجل:\n');
                
                // Show top 10 results
                const topResults = results.slice(0, 10);
                
                topResults.forEach((item, index) => {
                    const text = item.keywordIdeaMetrics ? item.text : "غير معروف";
                    const metrics = item.keywordIdeaMetrics || {};
                    const volume = metrics.avgMonthlySearches || 0;
                    const comp = metrics.competition || "UNKNOWN";
                    const cpcLow = (metrics.lowTopOfPageBidMicros / 1000000).toFixed(2);
                    const cpcHigh = (metrics.highTopOfPageBidMicros / 1000000).toFixed(2);

                    // Translate competition
                    let compAr = comp;
                    if(comp === 'LOW') compAr = 'منخفضة 🟢';
                    if(comp === 'MEDIUM') compAr = 'متوسطة 🟡';
                    if(comp === 'HIGH') compAr = 'عالية 🔴';
                    if(comp === 'UNSPECIFIED') compAr = 'غير محدد';

                    console.log(`[${index + 1}] الكلمة: "${text}"`);
                    console.log(`    📊 حجم البحث الشهري: ${volume} عملية بحث`);
                    console.log(`    ⚔️ مستوى المنافسة: ${compAr}`);
                    console.log(`    💰 سعر النقرة المتوقع: من ${cpcLow} إلى ${cpcHigh} ج.م`);
                    console.log('-------------------------------------------');
                });
            }
        } catch (err) {
            console.log('❌ حدث خطأ:', err);
        }

        console.log('\n');
        askKeyword();
    });
}

askKeyword();
