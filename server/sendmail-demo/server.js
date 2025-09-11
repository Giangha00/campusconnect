const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(express.json());

// Config Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm load HTML template và thay thế placeholder
function renderTemplate(filePath, replacements) {
  let template = fs.readFileSync(filePath, "utf-8");
  for (const key in replacements) {
    template = template.replace(
      new RegExp(`{{${key}}}`, "g"),
      replacements[key]
    );
  }
  return template;
}

// API gửi mail
app.post("/send-email", async (req, res) => {
  const { to, name, eventName, ticket } = req.body;

  // Render template với dữ liệu
  const htmlContent = renderTemplate("templates/success.html", {
    name,
    eventName,
    ticket,
    date: new Date().toLocaleString("vi-VN"),
    supportEmail: process.env.EMAIL_USER,
  });

  try {
    await transporter.sendMail({
      from: `"Event Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Xác nhận đăng ký: ${eventName}`,
      html: htmlContent,
    });

    res.json({ success: true, message: "Email đã gửi thành công!" });
  } catch (error) {
    console.error("Error gửi mail:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Run server
app.listen(3000, () => {
  console.log("✅ Server chạy tại http://localhost:3000");
});
