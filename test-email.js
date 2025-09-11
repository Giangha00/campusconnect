const nodemailer = require("nodemailer");
require("dotenv").config();

// Test email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  try {
    console.log("Testing email configuration...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "***configured***" : "NOT SET"
    );

    // Verify connection
    await transporter.verify();
    console.log("✅ Email configuration is valid!");

    // Send test email
    const info = await transporter.sendMail({
      from: `"Campus Connect Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "Test Email from Campus Connect",
      html: "<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>",
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email test failed:");
    console.error("Error:", error.message);

    if (error.message.includes("Invalid login")) {
      console.log("\n💡 Possible solutions:");
      console.log("1. Check your EMAIL_USER and EMAIL_PASS in .env file");
      console.log(
        "2. Make sure you have enabled 2-Factor Authentication on Gmail"
      );
      console.log("3. Use App Password instead of regular Gmail password");
      console.log(
        '4. Check if "Less secure app access" is enabled (not recommended)'
      );
    }
  }
}

testEmail();
