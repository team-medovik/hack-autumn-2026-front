import type { ModelSettingsValues } from '../model/types';

const isShallowEqual = <T extends object>(a: T, b: T) =>
  (Object.keys(a) as (keyof T)[]).every((key) => a[key] === b[key]);

/** Параметры совпадают — сохранять или сбрасывать нечего. */
export const isSameValues = (a: ModelSettingsValues, b: ModelSettingsValues) =>
  (Object.keys(a) as (keyof ModelSettingsValues)[]).every((group) =>
    isShallowEqual(a[group], b[group]),
  );
