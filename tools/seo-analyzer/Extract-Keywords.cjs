const fs = require('fs');
const { GoogleAdsApi } = require('google-ads-api');

// Credentials from .env
const client = new GoogleAdsApi({
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    developer_token: 'YOUR_DEVELOPER_TOKEN'
});

const customer = client.Customer({
    customer_id: 'YOUR_CUSTOMER_ID', // Manager ID
    refresh_token: 'YOUR_REFRESH_TOKEN'
});

const seedKeywords = [
    'تركيب شفاط مطبخ',
    'مداخن مطاعم',
    'تنظيف مداخن المطاعم',
    'هود ستانلس ستيل',
    'تأسيس شفاط مخفي'
];

async function extractKeywords() {
    console.log('جاري الاتصال بـ Google Ads API لسحب الكلمات...');
    try {
        const results = await customer.keywordPlanIdeas.generateKeywordIdeas({
            customer_id: 'YOUR_CUSTOMER_ID',
            keyword_seed: { keywords: seedKeywords },
            geo_target_constants: ['geoTargetConstants/2818'], // Egypt
            language: 'languageConstants/1019', // Arabic
            keyword_plan_network: 'GOOGLE_SEARCH'
        });

        // Filter and map results
        let keywordsList = [];
        results.forEach(item => {
            const text = item.text;
            const metrics = item.keyword_idea_metrics || {};
            const volume = metrics.avg_monthly_searches || 0;
            const comp = metrics.competition || 'UNSPECIFIED';

            // Only keep keywords with actual search volume > 10 to ensure quality
            if (volume > 10) {
                keywordsList.push({
                    text: text,
                    volume: volume,
                    competition: comp
                });
            }
        });

        // Sort by volume descending
        keywordsList.sort((a, b) => b.volume - a.volume);

        // Format for Markdown
        let output = '# 🚀 تقرير الكلمات المفتاحية الرسمي من Google Ads\n\n';
        output += '| الكلمة المفتاحية | حجم البحث الشهري | المنافسة |\n';
        output += '|---|---|---|\n';

        keywordsList.forEach(k => {
            let compAr = k.competition;
            if(compAr === 'LOW') compAr = 'منخفضة 🟢';
            if(compAr === 'MEDIUM') compAr = 'متوسطة 🟡';
            if(compAr === 'HIGH') compAr = 'عالية 🔴';
            
            output += `| ${k.text} | **${k.volume}** | ${compAr} |\n`;
        });

        const outputPath = 'C:\\Users\\i7\\.gemini\\antigravity-ide\\scratch\\fans-installation-project\\tools\\seo-analyzer\\ads_extracted_keywords.md';
        fs.writeFileSync(outputPath, output, 'utf8');
        console.log(`✅ تم استخراج ${keywordsList.length} كلمة قوية وحفظها في الملف!`);

    } catch (e) {
        console.error('API Error:', e.message);
    }
}

extractKeywords();
