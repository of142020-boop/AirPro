const fs = require('fs');
const xlsx = require('xlsx');
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

// A huge list of seed keywords covering all services
const seedKeywords = [
    // الاساسيات والخدمات العامة
    'تركيب شفاط مطبخ', 'تأسيس شفاط', 'تأسيس دكت', 'مداخن مطاعم', 'تنظيف مداخن المطاعم',
    'تصنيع هود', 'هود ستانلس ستيل', 'تأسيس شفاط مخفي', 'صيانة شفاطات المطابخ',
    'فني شفاطات', 'تصليح شفاط المطبخ', 'تنظيف هود المطبخ', 'مداخن ستانلس', 'مراوح شفط',
    'شفاطات صناعية', 'تهوية المطاعم', 'دكت تكييف', 'صيانة مداخن', 'شفاطات كربون',
    'شركة تركيب شفاطات مطاعم', 'معلم تركيب مداخن', 'صنايعي تركيب مداخن',
    
    // الانواع والماركات الشائعة
    'شفاط بلت ان', 'شفاط هرمي', 'شفاط مسطح', 'شفاط توشيبا', 'شفاط فريش', 'شفاط تورنيدو',
    'شفاط مطبخ بمدخنة', 'شفاط مطبخ بدون مدخنة', 'شفاط حمام', 'شفاط مركزي', 'مروحة شفط',
    'شفاط جزيرة', 'هود مطبخ', 'شفاط زجاج', 'شفاط مطبخ ايطالي',
    
    // مشاكل وتصليح
    'اعطال شفاط المطبخ', 'شفاط المطبخ مش بيسحب', 'صوت شفاط المطبخ عالي', 
    'تغيير فلاتر الشفاط', 'تنظيف دهون الشفاط', 'شفاط المطبخ بينقط زيت',
    'موتور شفاط المطعم', 'تصليح موتور شفاط', 'تغيير سير الشفاط', 'دفاع مدني',
    
    // الادوات والمكونات
    'تخريم كور', 'تخريم خرسانة للشفاط', 'مواسيير شفاط', 'دكت صاج', 'فلاتر كربونية',
    'جريلات تكييف', 'فريش اير', 'شفط وطرد', 'مراوح طرد مركزية', 'بلاورات'
];

async function extractKeywords() {
    console.log('جاري سحب مئات الكلمات من قاعدة بيانات جوجل...');
    try {
        let allResults = [];
        
        // Google Ads API allows max 20 keywords per request
        for (let i = 0; i < seedKeywords.length; i += 20) {
            const chunk = seedKeywords.slice(i, i + 20);
            try {
                const results = await customer.keywordPlanIdeas.generateKeywordIdeas({
                    customer_id: 'YOUR_CUSTOMER_ID',
                    keyword_seed: { keywords: chunk },
                    geo_target_constants: ['geoTargetConstants/2818'],
                    language: 'languageConstants/1019',
                    keyword_plan_network: 'GOOGLE_SEARCH'
                });
                allResults = allResults.concat(results);
            } catch (err) {
                console.error('Error fetching chunk:', err.message || err);
            }
        }

        let keywordsList = [];
        let seen = new Set();
        
        allResults.forEach(item => {
            const text = item.text;
            if (seen.has(text)) return;
            seen.add(text);

            const metrics = item.keyword_idea_metrics || {};
            const volume = metrics.avg_monthly_searches || 0;
            const comp = metrics.competition || 'غير محدد';
            
            const cpcLow = metrics.low_top_of_page_bid_micros ? ((metrics.low_top_of_page_bid_micros) / 1000000).toFixed(2) : '0.00';
            const cpcHigh = metrics.high_top_of_page_bid_micros ? ((metrics.high_top_of_page_bid_micros) / 1000000).toFixed(2) : '0.00';

            // Filter out keywords with 0 volume to only keep useful ones
            if (volume > 0) {
                let compAr = comp;
                if(comp === 'LOW') compAr = 'منخفضة';
                if(comp === 'MEDIUM') compAr = 'متوسطة';
                if(comp === 'HIGH') compAr = 'عالية';

                keywordsList.push({
                    "الكلمة المفتاحية": text,
                    "حجم البحث الشهري": volume,
                    "مستوى المنافسة": compAr,
                    "أقل تكلفة للنقرة (ج.م)": cpcLow,
                    "أعلى تكلفة للنقرة (ج.م)": cpcHigh,
                    "النية (مقترح)": volume > 500 ? "مقال مدونة (معلوماتي)" : "خدمة (بيعي)"
                });
            }
        });

        // Sort by volume descending
        keywordsList.sort((a, b) => b["حجم البحث الشهري"] - a["حجم البحث الشهري"]);

        // Create Excel Workbook
        const worksheet = xlsx.utils.json_to_sheet(keywordsList);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "كلمات السيو");

        // Set column widths for better Excel UI
        worksheet['!cols'] = [
            { wch: 40 }, // Keyword
            { wch: 20 }, // Volume
            { wch: 15 }, // Competition
            { wch: 25 }, // CPC Low
            { wch: 25 }, // CPC High
            { wch: 25 }  // Intent
        ];

        const desktopPath = 'C:\\Users\\i7\\Desktop\\كلمات_فنيين_إير_برو.xlsx';
        xlsx.writeFile(workbook, desktopPath);
        
        console.log(`✅ تم استخراج ${keywordsList.length} كلمة قوية وحفظها في شيت إكسيل على سطح المكتب!`);

    } catch (e) {
        console.error('API Error:', e.message);
    }
}

extractKeywords();
