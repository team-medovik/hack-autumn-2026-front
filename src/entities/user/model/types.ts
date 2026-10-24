/**
 * Контракт /users — учётки админ-панели (страница «Настройки → Пользователи»).
 * Пока бэкенда нет, отдаётся MSW (src/app/mocks/users). Даты — ISO 8601.
 */

/** admin — Администратор (из конфигурации сервера), user — Пользователь (создан в панели). */
export type UserRole = 'admin' | 'user';

/**
 * Откуда учётка: config — задана в конфигурации сервера, удалить из панели нельзя;
 * panel — создана администратором в панели.
 */
export type UserSource = 'config' | 'panel';

export interface User {
  /** Уникален без учёта регистра. Он же — идентификатор в URL. */
  login: string;
  role: UserRole;
  source: UserSource;
  /** Когда создан в панели. `null` — учётка из конфигурации. */
  createdAt: string | null;
  /** Логин того, кто создал. `null` — учётка из конфигурации. */
  createdBy: string | null;
}

export interface CreateUserRequest {
  login: string;
  /** Пароль задаёт администратор; сервер хранит только хэш и больше его не отдаёт. */
  password: string;
}
