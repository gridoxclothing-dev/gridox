import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    strictPort: false,
    allowedHosts: ["miles-email-chess-psychological.trycloudflare.com", "localhost"],
    hmr: {
      overlay: false,
    },

    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        xfwd: true,
      },
    }
  },

  plugins: [
    react(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false,
              },
            },
          },
          'sortAttrs',
          {
            name: 'addAttributesToSVGElement',
            params: {
              attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
            },
          },
        ],
      },
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: false,
        quality: 80,
      },
      avif: {
        lossless: false,
        quality: 70,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    target: "esnext",
    minify: "terser",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom", "react-helmet-async"],
          "vendor-icons": ["lucide-react"],
          "vendor-utils": ["@tanstack/react-query", "clsx", "tailwind-merge"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
