import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailConfig = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
};

export const transporter = nodemailer.createTransport(emailConfig);

export function renderTemplate(
  templateName: string,
  replacements: Record<string, string>
): string {
  try {
    const templatePath = path.join(
      __dirname,
      "sendmail-demo",
      "template",
      templateName
    );
    let template = fs.readFileSync(templatePath, "utf-8");

    for (const key in replacements) {
      template = template.replace(
        new RegExp(`{{${key}}}`, "g"),
        replacements[key]
      );
    }

    return template;
  } catch (error) {
    console.error("Error loading template:", error);
    return "";
  }
}

export async function sendRegistrationEmail(
  to: string,
  name: string,
  eventName: string,
  ticket: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email configuration
    if (
      !emailConfig.auth.user ||
      emailConfig.auth.user === "your-email@gmail.com"
    ) {
      console.error("Email configuration is missing or not set");
      return {
        success: false,
        message:
          "Email service chưa được cấu hình. Vui lòng kiểm tra EMAIL_USER trong file .env",
      };
    }

    if (
      !emailConfig.auth.pass ||
      emailConfig.auth.pass === "your-app-password"
    ) {
      console.error("Email password is missing or not set");
      return {
        success: false,
        message:
          "Email password chưa được cấu hình. Vui lòng kiểm tra EMAIL_PASS trong file .env",
      };
    }

    const htmlContent = renderTemplate("success.html", {
      name,
      eventName,
      ticket,
      date: new Date().toLocaleString("vi-VN"),
      supportEmail: emailConfig.auth.user,
    });

    if (!htmlContent) {
      console.error("Failed to render email template");
      return {
        success: false,
        message: "Không thể tải email template",
      };
    }

    const info = await transporter.sendMail({
      from: `"Campus Connect" <${emailConfig.auth.user}>`,
      to,
      subject: `Xác nhận đăng ký: ${eventName}`,
      html: htmlContent,
    });

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to,
      eventName,
    });

    return { success: true, message: "Email đã gửi thành công!" };
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Lỗi gửi email: ${errorMessage}`,
    };
  }
}
