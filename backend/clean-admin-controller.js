const fs = require('fs');

const file = './controllers/admin.controller.js';
let content = fs.readFileSync(file, 'utf8');

const marker = "};const { hashPassword, generateRandomPassword } = require('../utils/hashPassword');";

const index = content.indexOf(marker);

if (index === -1) {
    console.log('Stray admin code marker not found.');
} else {
    content = content.slice(0, index + 2) + '\n';
    fs.writeFileSync(file, content);
    console.log('Stray admin code removed successfully.');
}
