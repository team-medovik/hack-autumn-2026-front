import type { AdminUserResponse } from '@/shared/api';

/**
 * Учётки сотрудников: /admin/users (страница «Настройки → Пользователи», только для ADMIN).
 * DTO — из openapi/openapi.yaml (src/shared/api/generated). В dev отдаётся MSW
 * (src/app/mocks/users). Даты — ISO 8601.
 *
 * Пароль новой учётки генерирует сервер и отдаёт один раз — в ответе на создание.
 */
export type { CreatedUserResponse, CreateUserRequest } from '@/shared/api';

export type User = AdminUserResponse;

/** ADMIN — Администратор, EMPLOYEE — Пользователь (сотрудник без админки). */
export type UserRole = AdminUserResponse['role'];

/** DISABLED — учётка есть, но войти с ней нельзя. */
export type UserStatus = AdminUserResponse['status'];
