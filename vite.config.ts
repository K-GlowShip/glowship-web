import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // CI에는 .env가 없어서, API 주소를 읽는 모듈(shared/config/env)을 불러오는 테스트가 깨진다. 테스트에서는 값만 채운다.
    env: { VITE_API_BASE_URL: 'http://localhost:8000' },
  },
})
