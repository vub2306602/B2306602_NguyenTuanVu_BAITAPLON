import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Cấu hình Vite cho Frontend Độc Giả (Client - Cổng 5174)
export default defineConfig({
  cacheDir: 'node_modules/.vite-client',
  plugins: [
    vue(),
    {
      name: 'html-rewrite-client',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html' || (req.url && !req.url.includes('.') && !req.url.startsWith('/api') && !req.url.startsWith('/src') && !req.url.startsWith('/@'))) {
            req.url = '/client.html'
          }
          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@client': path.resolve(__dirname, './src/client'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },
  optimizeDeps: {
    include: ['axios', 'pinia', 'vue', 'vue-router']
  },
  server: {
    port: 5174,
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, 'client.html')
      }
    }
  }
})
