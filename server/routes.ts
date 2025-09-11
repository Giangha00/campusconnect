import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendRegistrationEmail } from "./email-config";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  console.log('Registering API routes...');

  // Test endpoint
  app.get('/api/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ message: 'API is working!' });
  });

  // API endpoint to send registration confirmation email
  app.post('/api/send-registration-email', async (req, res) => {
    try {
      const { to, name, eventName, ticket } = req.body;

      // Validate required fields
      if (!to || !name || !eventName || !ticket) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc: to, name, eventName, ticket'
        });
      }

      // Send email
      const result = await sendRegistrationEmail(to, name, eventName, ticket);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error in send-registration-email endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi gửi email'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
