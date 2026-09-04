// frontend/scripts/fix-hook-imports.js
const fs = require('fs');
const path = require('path');

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace default imports with named imports
    content = content.replace(
        /import useAuth from ['"]\.\.\/hooks\/useAuth['"]/g,
        'import { useAuth } from \'../hooks/useAuth\''
    );
    content = content.replace(
        /import useTheme from ['"]\.\.\/hooks\/useTheme['"]/g,
        'import { useTheme } from \'../hooks/useTheme\''
    );
    content = content.replace(
        /import useCart from ['"]\.\.\/hooks\/useCart['"]/g,
        'import { useCart } from \'../hooks/useCart\''
    );
    content = content.replace(
        /import useOrder from ['"]\.\.\/hooks\/useOrder['"]/g,
        'import { useOrder } from \'../hooks/useOrder\''
    );
    content = content.replace(
        /import useRestaurant from ['"]\.\.\/hooks\/useRestaurant['"]/g,
        'import { useRestaurant } from \'../hooks/useRestaurant\''
    );
    content = content.replace(
        /import useSocket from ['"]\.\.\/hooks\/useSocket['"]/g,
        'import { useSocket } from \'../hooks/useSocket\''
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            // Skip node_modules directory
            if (file !== 'node_modules') {
                walk(filePath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            fixImports(filePath);
        }
    }
}

console.log('Starting to fix hook imports...');
walk('./src');
console.log('Done!');