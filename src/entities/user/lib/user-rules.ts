import type { User, UserRole } from '../model/types';

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Администратор',
  user: 'Пользователь',
};

/** Логины уникальны без учёта регистра: «Analyst» и «analyst» — одна учётка. */
export const isSameLogin = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Удалить можно созданного в панели и не себя: учётку из конфигурации меняют только на сервере. */
export const canDeleteUser = (user: User, currentLogin: string | undefined) =>
  user.source === 'panel' && (currentLogin === undefined || !isSameLogin(user.login, currentLogin));
