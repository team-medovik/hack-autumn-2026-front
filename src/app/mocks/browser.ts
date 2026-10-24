import { setupWorker } from 'msw/browser';

import { authHandlers } from './auth-handlers';
import { handlers } from './handlers';

/**
 * MSW Service Worker для браузера. Запускается в main.tsx, если включён env.enableMocks
 * (по умолчанию — в dev). Файл воркера: public/mockServiceWorker.js (`npx msw init public`).
 * Auth-моки с состоянием — только в браузере: тесты подменяют ответы через server.use.
 */
export const worker = setupWorker(...authHandlers, ...handlers);
