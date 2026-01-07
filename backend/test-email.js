const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("Testing email configuration...");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD
    ? "***" + process.env.EMAIL_PASSWORD.slice(-4)
    : "NOT SET"
);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
  debug: true, // Enable debug output
  logger: true, // Enable logging
});

console.log("\n🔍 Verifying connection...\n");

transporter
  .verify()
  .then(() => {
    console.log("\n✅ SUCCESS! Email server connection works!\n");
    console.log("Now testing actual email send...\n");

    return transporter.sendMail({
      from: process.env.EMAIL_FROM || "MoneyMata <noreply@moneymata.com>",
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "Test Email from MoneyMata",
      html: "<h1>Success!</h1><p>If you receive this, email is working correctly.</p>",
    });
  })
  .then((info) => {
    console.log("\n✅ EMAIL SENT SUCCESSFULLY!");
    console.log("Message ID:", info.messageId);
    console.log("\nCheck your inbox at:", process.env.EMAIL_USER);
  })
  .catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    console.error("\nFull error:", err);
    console.error("\n📋 Troubleshooting tips:");
    console.error(
      "1. Check if port",
      process.env.EMAIL_PORT,
      "is open (try telnet smtp.gmail.com",
      process.env.EMAIL_PORT + ")"
    );
    console.error("2. Verify App Password has no spaces");
    console.error("3. Check if antivirus/firewall is blocking Node.js");
    console.error("4. Try different port (587 or 465)");
    console.error("5. Disable VPN if active");
  });
