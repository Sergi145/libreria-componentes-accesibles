import { defineConfig, devices } from '@playwright/test';

/**
 * Tests end-to-end de accesibilidad contra Storybook.
 * Requiere Storybook levantado en http://localhost:6006
 * (arráncalo con `npm run dev` en otra terminal, o deja que Playwright
 * lo levante automáticamente con webServer, ver abajo).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --ci',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
