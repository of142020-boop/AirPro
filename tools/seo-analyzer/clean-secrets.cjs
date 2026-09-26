const fs = require('fs');
const files = [
    'tools/seo-analyzer/Ads-Analyzer.js',
    'tools/seo-analyzer/Ads-Server.cjs',
    'tools/seo-analyzer/Extract-Keywords.cjs',
    'tools/seo-analyzer/Mass-Extractor.cjs'
];
for (const file of files) {
    if (fs.existsSync(file)) {
        let c = fs.readFileSync(file, 'utf8');
        c = c.replace(/client_id:\s*'[^']+'/g, "client_id: 'YOUR_CLIENT_ID'");
        c = c.replace(/client_secret:\s*'[^']+'/g, "client_secret: 'YOUR_CLIENT_SECRET'");
        c = c.replace(/developer_token:\s*'[^']+'/g, "developer_token: 'YOUR_DEVELOPER_TOKEN'");
        c = c.replace(/customer_id:\s*'[^']+'/g, "customer_id: 'YOUR_CUSTOMER_ID'");
        c = c.replace(/refresh_token:\s*'[^']+'/g, "refresh_token: 'YOUR_REFRESH_TOKEN'");
        fs.writeFileSync(file, c, 'utf8');
        console.log('Cleaned ' + file);
    }
}
