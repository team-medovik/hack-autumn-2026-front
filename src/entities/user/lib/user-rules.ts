import type { User, UserRole } from '../model/types';

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  EMPLOYEE: 'Пользователь',
};

/** Логины уникальны без учёта регистра: «Analyst» и «analyst» — одна учётка. */
export const isSameLogin = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Удалить можно любого, кроме себя. Остальные запреты (например, последний админ) — на сервере. */
export const canDeleteUser = (user: User, currentLogin: string | undefined) =>
  currentLogin === undefined || !isSameLogin(user.login, currentLogin);

const LOGIN_MIN = 3;
const LOGIN_MAX = 255;

/**
 * Что не так с логином (без пробелов по краям): только та граница, которую нарушили, —
 * «от 3 символов» или «до 255 символов». `null` — логин подходит.
 */
export const getLoginError = (login: string): string | null => {
  const { length } = login.trim();
  if (length < LOGIN_MIN) {
    return `Логин — от ${LOGIN_MIN} символов`;
  }
  return length > LOGIN_MAX ? `Логин — до ${LOGIN_MAX} символов` : null;
};
