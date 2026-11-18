const fs = require('fs');

const file = './server.js';
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

// Remove lines 870 through 1315 (1-based line numbers).
const startLine = 870;
const endLine = 1315;

lines.splice(startLine - 1, endLine - startLine + 1);

fs.writeFileSync(file, lines.join('\n'));

console.log(`Removed Admin block: lines ${startLine}-${endLine}`);
