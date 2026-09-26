const fs = require('fs');
const servicesStr = fs.readFileSync('c:/Users/i7/Desktop/AirPro_Website/src/pages/services.astro', 'utf8');
const indexStr = fs.readFileSync('c:/Users/i7/Desktop/AirPro_Website/src/pages/index.astro', 'utf8');

const servicesGridStart = servicesStr.indexOf('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px;">');
const servicesGridEnd = servicesStr.indexOf('</section>', servicesGridStart);
const gridHtml = servicesStr.substring(servicesGridStart, servicesGridEnd).trim();

const indexGridStart = indexStr.indexOf('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">');
const indexGridEnd = indexStr.indexOf('</section>', indexGridStart);

const newIndexStr = indexStr.substring(0, indexGridStart) + gridHtml + '\n\t</section>' + indexStr.substring(indexGridEnd + 10);

fs.writeFileSync('c:/Users/i7/Desktop/AirPro_Website/src/pages/index.astro', newIndexStr, 'utf8');
console.log("Successfully updated index.astro grid.");
