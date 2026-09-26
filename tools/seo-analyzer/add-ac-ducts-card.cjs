const fs = require('fs');

const files = [
	'c:/Users/i7/Desktop/AirPro_Website/src/pages/index.astro', 
	'c:/Users/i7/Desktop/AirPro_Website/src/pages/services.astro'
];

const cardHtml = `
			<!-- Service 11: AC Ducts -->
			<div class="glass-card reveal" style="padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
				<div>
					<div style="width: 80px; height: 80px; background: rgba(249, 115, 22, 0.1); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 20px;">
						<i class="fa-solid fa-wind"></i>
					</div>
					<h2 style="font-size: 1.8rem; color: var(--primary-dark); margin-bottom: 15px;">دكت التكييف المركزي</h2>
					<p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
						تصنيع وتركيب دكت التكييف المركزي والمخفي للفلل والمستشفيات بأفضل صاج مجلفن ومعزول مطابق للمواصفات.
					</p>
				</div>
				<a href="/services/ac-ducts" class="btn" style="background: rgba(249, 115, 22, 0.1); color: var(--primary); padding: 12px 30px; font-weight: 600; text-decoration: none; border-radius: 8px;">التفاصيل والخدمات</a>
			</div>
`;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // The grid is closed right before:
    // 	</section>
    // 
    // 	<!-- Call to Action Section -->
    
    // We can split by `		</div>\n	</section>\n\n	<!-- Call to Action`
    
    let parts = content.split('		</div>\n	</section>\n\n	<!-- Call to Action');
    if (parts.length === 2) {
        let newContent = parts[0] + cardHtml + '		</div>\n	</section>\n\n	<!-- Call to Action' + parts[1];
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Added AC Ducts card to ' + file);
    } else {
        console.log('Could not find split point in ' + file);
    }
}
