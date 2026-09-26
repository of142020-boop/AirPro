const fs = require('fs');
const files = [
	'c:/Users/i7/Desktop/AirPro_Website/src/pages/index.astro', 
	'c:/Users/i7/Desktop/AirPro_Website/src/pages/services.astro'
];
const replacements = {
    '🏠': '<i class="fa-solid fa-house"></i>',
    '🏭': '<i class="fa-solid fa-industry"></i>',
    '🔧': '<i class="fa-solid fa-wrench"></i>',
    '🧑‍🍳': '<i class="fa-solid fa-fire-burner"></i>',
    '🚿': '<i class="fa-solid fa-shower"></i>',
    '⭐': '<i class="fa-regular fa-star"></i>',
    '🔲': '<i class="fa-regular fa-square"></i>',
    '🔺': '<i class="fa-solid fa-caret-up"></i>',
    '🏢': '<i class="fa-regular fa-building"></i>',
    '⚙️': '<i class="fa-solid fa-fan"></i>'
};

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [emoji, icon] of Object.entries(replacements)) {
        content = content.split(emoji).join(icon);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
}
