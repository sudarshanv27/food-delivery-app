const fs = require("fs");

const file = "./server.js";
let content = fs.readFileSync(file, "utf8");

const target = 'const deliveryRoutes =\r\n    require("./routes/delivery.routes");';

const replacement = `const deliveryRoutes =
    require("./routes/delivery.routes");

const paymentRoutes =
    require("./routes/payment.routes");`;

if (!content.includes(target)) {
    console.log("? Target text not found. server.js was not changed.");
    process.exit(1);
}

content = content.replace(target, replacement);

fs.writeFileSync(file, content, "utf8");

console.log("? paymentRoutes import added successfully");
