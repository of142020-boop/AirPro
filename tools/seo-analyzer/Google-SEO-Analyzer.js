const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('================================================');
console.log('    أداة إير برو لتحليل الكلمات المفتاحية (Google API)   ');
console.log('================================================\n');

function askKeyword() {
    rl.question('👉 أدخل الكلمة التي تريد تحليلها (أو اكتب "خروج" للإغلاق): ', (query) => {
        if (query.trim() === 'خروج') {
            console.log('👋 وداعاً!');
            rl.close();
            return;
        }

        if (query.trim() === '') {
            askKeyword();
            return;
        }

        console.log(`\n⏳ جاري البحث في جوجل عن: "${query}"...\n`);

        const url = 'https://suggestqueries.google.com/complete/search?client=chrome&hl=ar&gl=eg&q=' + encodeURIComponent(query);

        https.get(url, (res) => {
            res.setEncoding('utf8');
            let data = '';
            
            res.on('data', chunk => data += chunk);
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const suggestions = parsed[1] || [];
                    
                    if (suggestions.length === 0) {
                        console.log('❌ لم يتم العثور على اقتراحات لهذه الكلمة.');
                    } else {
                        console.log('✅ الكلمات التي يبحث عنها الناس أيضاً:\n');
                        suggestions.forEach((s, index) => {
                            console.log(`  ${index + 1}. ${s}`);
                        });
                    }
                } catch (e) {
                    console.log('❌ حدث خطأ في قراءة البيانات من جوجل.');
                }
                
                console.log('\n------------------------------------------------\n');
                askKeyword();
            });
        }).on('error', (err) => {
            console.log('❌ خطأ في الاتصال بالإنترنت: ' + err.message);
            console.log('\n------------------------------------------------\n');
            askKeyword();
        });
    });
}

askKeyword();
