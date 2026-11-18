const fs = require("fs");

const file = "./server.js";
let content = fs.readFileSync(file, "utf8");

const target = `app.use(
    "/api/delivery",
    deliveryRoutes
);`;

const replacement = `app.use(
    "/api/delivery",
    deliveryRoutes
);

// ================= PAYMENTS =================

app.use(
    "/api/payments",
    paymentRoutes
);`;

if (!content.includes(target)) {
    console.log("? Delivery route block not found. server.js was not changed.");
    process.exit(1);
}

if (content.includes('"/api/payments"')) {
    console.log("?? Payment route already exists. server.js was not changed.");
    process.exit(0);
}

content = content.replace(target, replacement);

fs.writeFileSync(file, content, "utf8");

console.log("? Payment API route registered successfully");
