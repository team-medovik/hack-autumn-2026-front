import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '@/app/mocks/server';

// В jsdom нет ResizeObserver, а Radix Slider меряет им ручку — размеры в тестах не важны
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Запускаем MSW-сервер перед всеми тестами
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Сбрасываем хэндлеры после каждого теста (предотвращает утечку между тестами)
afterEach(() => server.resetHandlers());

// Останавливаем сервер после всех тестов
afterAll(() => server.close());
