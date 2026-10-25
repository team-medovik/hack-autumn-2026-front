/// <reference types="vite/client" />

/**
 * Переменные окружения. В рантайме проверяются в src/shared/config/env.ts.
 * Новую переменную добавляйте сюда, в env.ts и в .env.example.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_ENABLE_DEVTOOLS?: 'true' | 'false';
  readonly VITE_ENABLE_MOCKS?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
