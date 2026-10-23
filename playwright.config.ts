import { defineConfig, devices } from '@playwright/test';

/**
 * Конфиг Playwright E2E.
 * Документация: https://playwright.dev/docs/test-configuration
 *
 * Первый запуск: npx playwright install  (скачивает браузеры)
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    // Собираем trace при первом повторе — удобно для отладки в CI
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // Раскомментировать для мобильных viewport-ов:
    // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],

  // Поднимаем dev-сервер перед запуском e2e-тестов
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
