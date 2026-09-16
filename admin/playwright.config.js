import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Isolated E2E environment: backend-admin on 5055 against the crackers-billing-e2e
// DB, frontend dev server on 5174. Both are started automatically if not already
// running (see backend-admin/.env for the isolated DB/port config).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm start',
      cwd: path.resolve(__dirname, '../backend-admin'),
      url: 'http://localhost:5055/',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npx vite --port 5174 --strictPort',
      cwd: __dirname,
      url: 'http://localhost:5174/',
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/admin.json' },
      dependencies: ['setup'],
    },
  ],
});
