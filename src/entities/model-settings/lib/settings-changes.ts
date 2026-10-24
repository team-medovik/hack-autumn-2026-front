import type { ModelSettingsChanges, ModelSettingsValues } from '../model/types';

/** Поля группы, которые отличаются от исходных. Пусто — группа не менялась. */
const changedFields = <T extends object>(base: T, next: T): Partial<T> =>
  Object.fromEntries(
    (Object.keys(next) as (keyof T)[])
      .filter((key) => next[key] !== base[key])
      .map((key) => [key, next[key]]),
  ) as Partial<T>;

/**
 * Тело PATCH /model/settings: только изменённые группы и поля — сервер накладывает их на свою
 * версию. `null` — отличий нет, отправлять нечего.
 */
export const getSettingsChanges = (
  base: ModelSettingsValues,
  next: ModelSettingsValues,
): ModelSettingsChanges | null => {
  const changes = Object.fromEntries(
    (Object.keys(next) as (keyof ModelSettingsValues)[])
      .map((group) => [group, changedFields(base[group], next[group])] as const)
      .filter(([, fields]) => Object.keys(fields).length > 0),
  ) as ModelSettingsChanges;

  return Object.keys(changes).length > 0 ? changes : null;
};
