import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Cấu hình Vite cho Frontend Quản Trị (Admin - Cổng 5173)
export default defineConfig({
  cacheDir: 'node_modules/.vite-admin',
  plugins: [
    vue(),
    {
      name: 'html-rewrite-admin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html' || (req.url && !req.url.includes('.') && !req.url.startsWith('/api') && !req.url.startsWith('/src') && !req.url.startsWith('/@'))) {
            req.url = '/admin.html'
          }
          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@admin': path.resolve(__dirname, './src/admin'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },
  optimizeDeps: {
    include: ['chart.js', 'chart.js/auto', 'axios', 'pinia', 'vue', 'vue-router']
  },
  server: {
    port: 5173,
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist/admin',
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'admin.html')
      }
    }
  }
})
