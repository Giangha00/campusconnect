import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react({
      // ✅ Tối ưu React plugin
      babel: {
        plugins: [],
      },
    }),
    // ✅ Chỉ load runtimeErrorOverlay khi cần (không phải production)
    ...(process.env.NODE_ENV !== "production" ? [runtimeErrorOverlay()] : []),
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
  // ✅ Tắt type checking trong Vite (IDE sẽ handle)
  // TypeScript checking sẽ được thực hiện bởi IDE, không cần Vite check
  esbuild: {
    // ✅ Tắt type checking để tăng tốc độ
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
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
      "axios",
    ],
    // ✅ Pre-bundle để tăng tốc độ
    force: false,
    // ✅ Cache để tăng tốc độ lần chạy tiếp theo
    entries: [
      "src/main.tsx", // ✅ Đã có root: client nên không cần prefix
    ],
    // ✅ Tối ưu pre-bundling
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    host: "localhost",
    port: 3000,
    // ✅ Tối ưu HMR
    hmr: {
      overlay: true,
    },
    // ✅ Tối ưu file watching - loại bỏ server directory
    watch: {
      usePolling: false,
      ignored: [
        '**/node_modules/**', 
        '**/dist/**', 
        '**/build/**',
        '../server/**', // ✅ Quan trọng: bỏ qua server directory
        '**/.git/**',
      ],
    },
  },
  // ✅ Tối ưu cho development
  ...(process.env.NODE_ENV === 'development' && {
    // ✅ Tối ưu cache
    cacheDir: path.resolve(import.meta.dirname, "node_modules/.vite"),
    // ✅ Tắt source maps trong dev để tăng tốc độ (có thể bật lại nếu cần debug)
    // sourcemap: false,
  }),
});
