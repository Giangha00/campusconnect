import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
};

// Create transporter
export const transporter = nodemailer.createTransport(emailConfig);

// Function to load HTML template and replace placeholders
export function renderTemplate(templateName: string, replacements: Record<string, string>): string {
  try {
    const templatePath = path.join(__dirname, 'sendmail-demo', 'template', templateName);
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    for (const key in replacements) {
      template = template.replace(
        new RegExp(`{{${key}}}`, 'g'),
        replacements[key]
      );
    }
    
    return template;
  } catch (error) {
    console.error('Error loading template:', error);
    return '';
  }
}

// Function to send registration confirmation email
export async function sendRegistrationEmail(
  to: string,
  name: string,
  eventName: string,
  ticket: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Render template with data
    const htmlContent = renderTemplate('success.html', {
      name,
      eventName,
      ticket,
      date: new Date().toLocaleString('vi-VN'),
      supportEmail: emailConfig.auth.user,
    });

    // Send email
    await transporter.sendMail({
      from: `"Campus Connect" <${emailConfig.auth.user}>`,
      to,
      subject: `Xác nhận đăng ký: ${eventName}`,
      html: htmlContent,
    });

    return { success: true, message: 'Email đã gửi thành công!' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: `Lỗi gửi email: ${error}` };
  }
}
