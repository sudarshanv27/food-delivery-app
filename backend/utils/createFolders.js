const fs = require("fs");
const path = require("path");

const folders = [
    "uploads",
    "uploads/menu",
    "uploads/restaurants",
    "uploads/users",
    "uploads/delivery",
    "uploads/temp"
];

const createFolders = () => {
    folders.forEach((folder) => {
        const folderPath = path.join(__dirname, "..", folder);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, {
                recursive: true,
            });
            console.log(`✅ Created folder: ${folder}`);
        }
    });

    console.log("📁 All upload folders are ready");
};

// Run immediately if called directly
if (require.main === module) {
    createFolders();
}

module.exports = createFolders;