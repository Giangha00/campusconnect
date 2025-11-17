import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // ✅ Tối ưu build với terser
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Xóa console.log trong production
        drop_debugger: true,
      },
    },
    // ✅ Code splitting để tối ưu bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Tách vendor libraries
          "react-vendor": ["react", "react-dom", "wouter"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
          ],
          "utils-vendor": ["date-fns", "zod", "dompurify"],
        },
        // ✅ Tối ưu chunk naming
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // ✅ Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // ✅ Không tạo source maps trong production để giảm file size
    sourcemap: false,
  },
  // ✅ Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "wouter",
      "@tanstack/react-query",
    ],
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    host: "localhost",
    port: 3000,
  },
});
