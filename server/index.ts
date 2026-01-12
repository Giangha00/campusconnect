import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ✅ Tối ưu body parser - chỉ parse khi cần
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ✅ Compression middleware (nếu có thể cài thêm)
// import compression from 'compression';
// app.use(compression());

// Security headers middleware
app.use((req, res, next) => {
  // Content-Security-Policy: Security headers for controlling resource loading
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval needed for Vite HMR in dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow Google Fonts stylesheets
    "img-src 'self' data: https: http:", // Allow images from any HTTPS/HTTP source
    "font-src 'self' data: https://fonts.gstatic.com", // Allow Google Fonts files
    "connect-src 'self' ws: wss: http://localhost:8080", // WebSocket for Vite HMR + Spring Boot API
    "frame-src https://www.google.com https://maps.google.com", // Allow Google Maps iframe
    "object-src 'none'", // Prevent object/embed tags
    "base-uri 'self'", // Restrict base tag
    "form-action 'self'", // Restrict form submissions
    "frame-ancestors 'none'", // Prevent clickjacking
    "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
  ].join("; ");

  res.setHeader("Content-Security-Policy", cspHeader);

  // X-XSS-Protection: Legacy browser XSS filter
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // X-Content-Type-Options: Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-Frame-Options: Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Referrer-Policy: Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
});

// Optimized logging middleware - only log slow requests or errors
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Only log API routes, and only if slow (>100ms) or error status
    if (path.startsWith("/api") && (duration > 100 || res.statusCode >= 400)) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (res.statusCode >= 400 && capturedJsonResponse) {
        // Only include response body for errors
        const errorMsg = typeof capturedJsonResponse === 'object' 
          ? capturedJsonResponse.message || capturedJsonResponse.error 
          : String(capturedJsonResponse);
        if (errorMsg) {
          logLine += ` :: ${errorMsg}`;
        }
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "127.0.0.1", () => {
    log(`serving on http://127.0.0.1:${port}`);
  });
})();
