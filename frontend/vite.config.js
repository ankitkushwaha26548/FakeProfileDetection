import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    plugins: [tailwindcss(), react()],
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: false,
      proxy: !isProd
        ? {
            '/api': {
              target: 'http://localhost:3000',
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    preview: {
      port: 5000,
      strictPort: false,
    },
  }
})
