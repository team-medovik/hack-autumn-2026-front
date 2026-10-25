import * as z from 'zod/mini';

/** 'true' / 'false' → boolean, не задана → undefined (тогда действует значение по умолчанию). */
const optionalFlag = z.pipe(
  z.optional(z.enum(['true', 'false'])),
  z.transform((v) => (v === undefined ? undefined : v === 'true')),
);

/**
 * Валидация переменных окружения в рантайме.
 * При запуске приложения выбрасывает ошибку, если обязательные переменные
 * отсутствуют или имеют неверный формат.
 * Новую переменную добавляйте сюда, в src/vite-env.d.ts и в .env.example.
 * zod/mini, а не zod: для пары переменных полный zod слишком тяжёл для бандла.
 */
const envSchema = z.object({
  VITE_API_URL: z.string().check(z.minLength(1, 'VITE_API_URL обязателен')),
  VITE_API_TIMEOUT: z.pipe(
    z.optional(z.string()),
    z.transform((v) => (v ? Number(v) : 15_000)),
  ),
  VITE_ENABLE_DEVTOOLS: optionalFlag,
  VITE_ENABLE_MOCKS: optionalFlag,
});

const parsed = z.safeParse(envSchema, import.meta.env);

if (!parsed.success) {
  console.error('❌ Некорректные переменные окружения:\n', z.prettifyError(parsed.error));
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
