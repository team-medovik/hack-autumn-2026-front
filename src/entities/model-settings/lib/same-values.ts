import type { ModelSettingsValues } from '../model/types';

// Ключи сравниваем с обеих сторон: набор весов признаков задаёт сервер и может различаться
const isShallowEqual = <T extends object>(a: T, b: T) =>
  ([...new Set([...Object.keys(a), ...Object.keys(b)])] as (keyof T)[]).every(
    (key) => a[key] === b[key],
  );

/** Параметры совпадают — сохранять или сбрасывать нечего. */
export const isSameValues = (a: ModelSettingsValues, b: ModelSettingsValues) =>
  (Object.keys(a) as (keyof ModelSettingsValues)[]).every((group) =>
    isShallowEqual(a[group], b[group]),
  );
