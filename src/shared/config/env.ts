import { z } from 'zod';

/**
 * Валидация переменных окружения в рантайме.
 * При запуске приложения выбрасывает ошибку, если обязательные переменные
 * отсутствуют или имеют неверный формат.
 * Новую переменную добавляйте сюда, в src/vite-env.d.ts и в .env.example.
 */
const envSchema = z.object({
  VITE_API_URL: z.string().min(1, 'VITE_API_URL обязателен'),
  VITE_API_TIMEOUT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 15_000)),
  VITE_ENABLE_DEVTOOLS: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Некорректные переменные окружения:\n', parsed.error.format());
  throw new Error('Некорректные переменные окружения. Смотрите .env.example для справки.');
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
  apiTimeout: parsed.data.VITE_API_TIMEOUT,
  /** DevTools TanStack Query и Zustand. По умолчанию включены в dev. */
  enableDevtools: parsed.data.VITE_ENABLE_DEVTOOLS ?? import.meta.env.DEV,
  /** MSW-моки в браузере. По умолчанию включены в dev. */
  enableMocks: parsed.data.VITE_ENABLE_MOCKS ?? import.meta.env.DEV,
} as const;
