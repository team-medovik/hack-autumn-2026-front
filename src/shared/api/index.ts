export { api, setAccessTokenGetter } from './axios';
export { isClientError, isNotFoundError } from './errors';

// Сгенерировано orval (src/shared/api/auth) — реэкспорт здесь, а не index.ts внутри папки:
// orval с clean: true пересоздаёт папку и удалил бы его.
export * from './auth/endpoints';
export type * from './auth/model';
