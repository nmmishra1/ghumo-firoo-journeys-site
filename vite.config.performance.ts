import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // Add bundle analyzer plugin for development
    process.env.ANALYZE && {
      name: 'bundle-analyzer',
      generateBundle(options, bundle) {
        const bundleInfo = Object.entries(bundle).map(([fileName, chunk]) => ({
          fileName,
          size: chunk.type === 'chunk' ? chunk.code.length : chunk.source.length,
          type: chunk.type,
        }));
        console.table(bundleInfo);
      },
    },
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          
          // Feature-specific chunks
          'pdf-utils': ['jspdf', 'html2canvas'],
          'charts': ['recharts'],
          'markdown': ['react-markdown', 'remark-gfm'],
          'date-utils': ['date-fns', 'react-day-picker'],
          
          // Package pages (lazy loaded)
          'package-pages': [
            './src/pages/packages/EuropeSwissCroatia',
            './src/pages/packages/KashmirParadise',
            './src/pages/packages/SeychellesEscape',
            './src/pages/packages/SingaporeMalaysia',
            './src/pages/packages/MauritiusBliss',
            './src/pages/packages/ThailandTropical',
          ],
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    
    // Optimize build settings
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: false,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@tanstack/react-query',
    ],
    exclude: [
      // Exclude heavy dependencies that should be lazy loaded
      'jspdf',
      'html2canvas',
      'recharts',
    ],
  },
  
  // Performance optimizations
  server: {
    hmr: {
      overlay: false,
    },
  },
  
  // CSS optimization
  css: {
    devSourcemap: false,
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        require('cssnano')({
          preset: 'default',
        }),
      ],
    },
  },
});