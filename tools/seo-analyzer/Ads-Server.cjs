const http = require('http');
const { GoogleAdsApi } = require('google-ads-api');

// Credentials from the user's .env file
const client = new GoogleAdsApi({
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
    developer_token: 'YOUR_DEVELOPER_TOKEN'
});

// Using the MANAGER ID directly as it successfully bypassed the permission error!
const customer = client.Customer({
    customer_id: 'YOUR_CUSTOMER_ID',
    refresh_token: 'YOUR_REFRESH_TOKEN'
});

const htmlPage = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>أداة إير برو - Google Ads API الرسمية</title>
    <style>
        :root { --primary: #2563eb; --background: #f8fafc; --text: #1e293b; --border: #e2e8f0; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: var(--background); color: var(--text); padding: 40px 20px; display: flex; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 800px; }
        h1 { color: #1d4ed8; text-align: center; margin-top: 0; }
        .search-box { display: flex; gap: 15px; margin-bottom: 30px; }
        input { flex: 1; padding: 15px; font-size: 1.1rem; border: 2px solid var(--border); border-radius: 12px; }
        button { background: var(--primary); color: white; border: none; padding: 15px 30px; font-size: 1.1rem; font-weight: bold; border-radius: 12px; cursor: pointer; }
        button:hover { background: #1d4ed8; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: right; padding: 12px; border-bottom: 1px solid var(--border); }
        th { background: #f1f5f9; color: #475569; }
        .loading { text-align: center; color: #64748b; display: none; margin: 20px 0; font-size: 1.2rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 مخطط إعلانات جوجل (الأرقام الحقيقية)</h1>
        <p style="text-align:center; color:#64748b; margin-bottom:30px;">متصل بنجاح مع حسابك Manager ID: 1870866513</p>
        
        <div class="search-box">
            <input type="text" id="keyword" placeholder="اكتب الكلمة هنا للبحث بحرية..." onkeypress="if(event.key==='Enter') search()">
            <button onclick="search()">استخراج البيانات</button>
        </div>

        <div id="loading" class="loading">⏳ جاري الاتصال بخوادم Google Ads وسحب الأرقام...</div>
        
        <table id="resultsTable" style="display:none;">
            <thead>
                <tr>
                    <th>الكلمة المفتاحية</th>
                    <th>حجم البحث (شهرياً)</th>
                    <th>المنافسة</th>
                    <th>تكلفة النقرة (من - إلى) ج.م</th>
                </tr>
            </thead>
            <tbody id="resultsBody"></tbody>
        </table>
    </div>

    <script>
        async function search() {
            const kw = document.getElementById('keyword').value.trim();
            if(!kw) return;

            document.getElementById('loading').style.display = 'block';
            document.getElementById('resultsTable').style.display = 'none';
            document.getElementById('resultsBody').innerHTML = '';

            try {
                const res = await fetch('/api/search?q=' + encodeURIComponent(kw));
                const data = await res.json();
                
                document.getElementById('loading').style.display = 'none';
                
                if(data.error) {
                    alert('خطأ: ' + data.error);
                    return;
                }

                if(data.results.length === 0) {
                    alert('لم يتم العثور على بيانات لهذه الكلمة.');
                    return;
                }

                document.getElementById('resultsTable').style.display = 'table';
                const tbody = document.getElementById('resultsBody');
                
                data.results.forEach(item => {
                    const text = item.text || 'غير معروف';
                    const metrics = item.keyword_idea_metrics || {};
                    const volume = metrics.avg_monthly_searches || 0;
                    
                    let comp = metrics.competition || 'UNSPECIFIED';
                    if(comp==='LOW') comp = 'منخفضة 🟢';
                    if(comp==='MEDIUM') comp = 'متوسطة 🟡';
                    if(comp==='HIGH') comp = 'عالية 🔴';
                    if(comp==='UNSPECIFIED') comp = 'غير محدد';

                    const cpcLow = ((metrics.low_top_of_page_bid_micros || 0) / 1000000).toFixed(2);
                    const cpcHigh = ((metrics.high_top_of_page_bid_micros || 0) / 1000000).toFixed(2);

                    const tr = document.createElement('tr');
                    tr.innerHTML = \`
                        <td><strong>\${text}</strong></td>
                        <td style="color:#1d4ed8; font-weight:bold;">\${volume.toLocaleString()}</td>
                        <td>\${comp}</td>
                        <td style="color:#059669;">\${cpcLow} - \${cpcHigh}</td>
                    \`;
                    tbody.appendChild(tr);
                });
            } catch(e) {
                alert('فشل الاتصال بالخادم المحلي.');
                document.getElementById('loading').style.display = 'none';
            }
        }
    </script>
</body>
</html>
`;

const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlPage);
    } else if (req.url.startsWith('/api/search')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const q = urlParams.get('q');
        
        if (!q) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ error: 'Missing keyword' }));
        }

        try {
            // Call Google Ads API via the official SDK
            const results = await customer.keywordPlanIdeas.generateKeywordIdeas({
                customer_id: 'YOUR_CUSTOMER_ID',
                keyword_seed: { keywords: [q] },
                geo_target_constants: ['geoTargetConstants/2818'], // Egypt
                language: 'languageConstants/1019', // Arabic
                keyword_plan_network: 'GOOGLE_SEARCH'
            });

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            // Send top 15 results
            res.end(JSON.stringify({ results: results.slice(0, 15) }));
        } catch(e) {
            console.error('API Error:', e);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: e.message || 'Google Ads API Error' }));
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(8080, () => {
    console.log('Server running at http://localhost:8080/');
});
