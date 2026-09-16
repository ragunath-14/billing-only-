import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // e2e/ holds Playwright specs, which use an incompatible test() API —
    // keep them out of vitest's run.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
