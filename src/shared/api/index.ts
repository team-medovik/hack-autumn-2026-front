export { api, isPublicAuthUrl, setAccessTokenGetter } from './axios';
export { getErrorData, isClientError, isConflictError, isNotFoundError } from './errors';

// Сгенерировано orval из openapi/openapi.yaml (src/shared/api/generated) — реэкспорт здесь,
// а не index.ts внутри папки: orval с clean: true пересоздаёт папку и удалил бы его.
export * from './generated/endpoints';
export type * from './generated/model';
// Перечисление нужно и значением — проверить, что пришло из потока событий
export { RealtimeEntity } from './generated/model';
