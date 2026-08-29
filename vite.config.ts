import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        secure: false,
      },
      '/php-backend': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/php-backend/, '')
      }
    },
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react({
      // Enable React Fast Refresh only in development
      fastRefresh: mode === 'development',
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  build: {
    modulePreload: false,
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'router-vendor': ['react-router-dom'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-toast',
      'react-hook-form',
      'zod',
      'date-fns',
      'recharts'
    ],
    exclude: ['@tanstack/react-query']
  },
  esbuild: {
    // Remove console.log in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Force production JSX runtime in Vite builds
    jsx: 'automatic',
    jsxImportSource: 'react',
    jsxDev: mode !== 'production' ? true : false,
  }
}));
