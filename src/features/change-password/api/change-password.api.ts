import { api, getErrorData } from '@/shared/api';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Код ошибки 400, если текущий пароль не подошёл. */
const INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD';

/**
 * Смена своего пароля. Текущая сессия остаётся, остальные сессии сервер сбрасывает.
 * 400 `INVALID_CURRENT_PASSWORD` — текущий пароль неверный; 422 — новый не по правилам.
 */
export const changePassword = (request: ChangePasswordRequest): Promise<void> =>
  api.post('/api/v1/account/password', request).then(() => undefined);

export const isInvalidCurrentPassword = (error: unknown) => {
  const data = getErrorData(error);
  return typeof data === 'object' && data !== null && 'error' in data
    ? data.error === INVALID_CURRENT_PASSWORD
    : false;
};
