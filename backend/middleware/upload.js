// backend/middleware/upload.js

const multer = require("multer");

const path = require("path");

const fs = require("fs");

// ================= MENU UPLOAD PATH =================
const menuUploadPath =
    path.join(
        __dirname,
        "../uploads/menu"
    );

// ================= CREATE FOLDER =================
if (
    !fs.existsSync(
        menuUploadPath
    )
) {
    fs.mkdirSync(
        menuUploadPath,
        {
            recursive: true,
        }
    );
}

// ================= STORAGE =================
const storage =
    multer.diskStorage({
        destination: (
            req,
            file,
            cb
        ) => {
            cb(
                null,
                menuUploadPath
            );
        },

        filename: (
            req,
            file,
            cb
        ) => {
            const uniqueName = `${Date.now()}-${file.originalname}`;

            cb(null, uniqueName);
        },
    });

// ================= FILE FILTER =================
const fileFilter = (
    req,
    file,
    cb
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only image files are allowed"
            ),
            false
        );
    }
};

// ================= MULTER =================
const upload = multer({
    storage,

    fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024,
    },
});

module.exports = upload;