/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import sitemap from 'vite-plugin-sitemap'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:3000'

  return {
    plugins: [
      react(),
      sitemap({
        hostname: 'https://www.munisanjuansac.com',
        dynamicRoutes: [
          '/',
          '/news',
          '/portal/login',
          '/portal/register',
        ],
      }),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Plataforma Municipal',
          short_name: 'Municipal',
          description: 'Portal de servicios municipales — San Juan Sacatepequez',
          start_url: '/portal',
          display: 'standalone',
          background_color: '#050a41',
          theme_color: '#1696ff',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined
            }

            if (id.includes('antd')) {
              return 'antd-vendor'
            }

            if (id.includes('rc-table')) {
              return 'rc-table-vendor'
            }

            if (id.includes('rc-field-form')) {
              return 'rc-form-vendor'
            }

            if (id.includes('react-router')) {
              return 'router-vendor'
            }

            if (id.includes('axios')) {
              return 'http-vendor'
            }

            return 'vendor'
          },
        },
      },
    },
    server: {
      host: true,
      port: 5174,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4174,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }
})
