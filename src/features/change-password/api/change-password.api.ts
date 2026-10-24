import { changePassword as requestChangePassword, getErrorData } from '@/shared/api';
import type { ChangePasswordRequest } from '@/shared/api';

/** Код ошибки 400, если текущий пароль не подошёл. */
const INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD';

/**
 * Смена своего пароля. Текущая сессия остаётся, остальные сессии сервер сбрасывает.
 * 400 `INVALID_CURRENT_PASSWORD` — текущий пароль неверный; 422 — новый не по правилам.
 */
export const changePassword = (request: ChangePasswordRequest): Promise<void> =>
  requestChangePassword(request);

export const isInvalidCurrentPassword = (error: unknown) => {
  const data = getErrorData(error);
  return typeof data === 'object' && data !== null && 'error' in data
    ? data.error === INVALID_CURRENT_PASSWORD
    : false;
};
