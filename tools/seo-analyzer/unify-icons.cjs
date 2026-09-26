const fs = require('fs');
const files = [
	'c:/Users/i7/Desktop/AirPro_Website/src/pages/index.astro', 
	'c:/Users/i7/Desktop/AirPro_Website/src/pages/services.astro'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove all border-top: 4px solid ...; from glass-cards
    content = content.replace(/border-top:\s*4px\s*solid\s*[^;]+;/g, '');
    
    // Unify icon backgrounds and colors
    // We look for: background: rgba(...); color: ...;
    content = content.replace(/background:\s*rgba\([^)]+\);\s*color:\s*[^;]+;/g, 'background: rgba(249, 115, 22, 0.1); color: var(--primary);');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Unified ' + file);
}
