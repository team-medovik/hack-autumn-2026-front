import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

// Наследуем vite.config.ts: алиасы, плагины, SCSS-миксины брейкпоинтов (additionalData)
export default defineConfig(async (configEnv) =>
  mergeConfig(await viteConfig(configEnv), {
    test: {
      // jsdom эмулирует браузерное окружение для компонентных тестов
      environment: 'jsdom',

      // Setup-файл запускается перед каждым тест-файлом (jest-dom матчеры + MSW-сервер)
      setupFiles: ['./src/tests/setup.ts'],

      // Глобалы Vitest (describe, it, expect и т.д.) доступны без импортов
      globals: true,

      // Обрабатываем CSS-модули и SCSS (предотвращает ошибки импорта)
      css: true,

      // E2E-тесты в tests/e2e запускает Playwright (npm run test:e2e), не Vitest
      exclude: [...configDefaults.exclude, 'tests/e2e/**'],

      // Переменные для src/shared/config/env.ts. Реальный API не вызывается — запросы ловит MSW
      env: {
        VITE_API_URL: 'http://localhost/api',
      },

      // Покрытие кода
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/tests/**',
          'src/**/*.d.ts',
          'src/**/__tests__/**',
          'src/app/main.tsx',
          'src/app/mocks/**',
          'src/vite-env.d.ts',
        ],
      },
    },
  }),
);
