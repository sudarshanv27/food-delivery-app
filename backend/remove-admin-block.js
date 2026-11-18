const fs = require('fs');

const file = './server.js';
let content = fs.readFileSync(file, 'utf8');

const startMarker =
`// ============================================================
// ======================= ADMIN APIs ==========================
// ============================================================`;

const endMarker =
`// ============================================================
// ================= ERROR HANDLING ============================
// ============================================================`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1) {
    console.log('Admin API block not found.');
    process.exit(1);
}

if (endIndex === -1) {
    console.log('Admin API block end marker not found.');
    process.exit(1);
}

content =
    content.slice(0, startIndex) +
    content.slice(endIndex);

fs.writeFileSync(file, content);

console.log('Duplicate Admin API block removed successfully.');
