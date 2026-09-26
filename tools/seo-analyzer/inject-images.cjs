const fs = require('fs');
const path = require('path');

const servicesDir = 'c:/Users/i7/Desktop/AirPro_Website/src/pages/services';

const seoData = {
    'built-in-hood.astro': {
        img: 'tarkib-shafat-built-in-hood-misr.jpg',
        alt: 'تركيب شفاط بلت ان مخفي في المطبخ بأفضل جودة'
    },
    'home-hood.astro': {
        img: 'taasis-shafat-matbakh-fillah.jpg',
        alt: 'تأسيس شفاط المطبخ للفلل والشقق وعمل فتحات الكور'
    },
    'restaurants-hood.astro': {
        img: 'tasnee-w-tarkib-madahen-mataem.jpg',
        alt: 'تصنيع وتركيب مداخن المطاعم وهود ستانلس ستيل'
    },
    'toshiba-hoods.astro': {
        img: 'fani-tarkib-shafat-toshiba-masr.jpg',
        alt: 'فني تركيب وصيانة شفاطات توشيبا للحمامات والمطابخ'
    },
    'bathroom-fans.astro': {
        img: 'tarkib-shafatat-hamamat-markaziya.jpg',
        alt: 'تركيب شفاطات حمامات مركزية وسقفية بدون صوت'
    },
    'industrial-blowers.astro': {
        img: 'blawerat-shafat-sena3y-masani3.jpg',
        alt: 'تركيب بلاورات صناعية ومراوح طرد مركزي للمصانع والمطاعم'
    },
    'flat-hood.astro': {
        img: 'tarkib-shafat-mosatah-bdon-madkhana.jpg',
        alt: 'تركيب شفاط مسطح بدون مدخنة للمطابخ المودرن'
    },
    'pyramid-hood.astro': {
        img: 'tarkib-shafat-haramy-matbakh.jpg',
        alt: 'تركيب شفاط هرمي كلاسيكي للمطابخ وتمديد المواسير'
    },
    'central-exhaust.astro': {
        img: 'andhemat-tahweya-w-shafat-markazy.jpg',
        alt: 'تصميم وتركيب أنظمة شفاط مركزي للفلل والمطاعم'
    },
    'maintenance.astro': {
        img: 'siyanat-w-tanzeef-madahen-mataem.jpg',
        alt: 'صيانة مداخن المطاعم واستخراج شهادات الدفاع المدني'
    }
};

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.astro'));

for (const file of files) {
    if (seoData[file]) {
        const filePath = path.join(servicesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('tarkib-shafat') || content.includes('images/services')) {
            console.log('Skipping ' + file + ' (already has image)');
            continue;
        }

        const imgBlock = `
	<!-- SEO Optimized Placeholder Image -->
	<div class="section reveal" style="margin-top: -30px; margin-bottom: 50px; padding: 0 20px;">
		<div style="max-width: 900px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid var(--glass-border); position: relative; background: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 400px;">
			<!-- This is the placeholder img tag -->
			<img src="/images/services/${seoData[file].img}" alt="${seoData[file].alt}" title="${seoData[file].alt}" style="width: 100%; max-height: 450px; object-fit: cover; display: block;" />
			<div style="position: absolute; color: #64748b; font-size: 1.2rem; font-weight: 700;">صورة: ${seoData[file].alt}</div>
		</div>
	</div>
`;

        content = content.replace('</section>', '</section>\n' + imgBlock);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added image to ' + file);
    }
}
