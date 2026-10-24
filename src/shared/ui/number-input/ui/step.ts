/** Знаков после запятой у шага: 1 → 0, 0.05 → 2. */
export const stepDecimals = (step: number) => String(step).split('.')[1]?.length ?? 0;

/** Ближайшее к `value` значение сетки `min + k × step`, без хвостов вида 0.30000000000000004. */
export const snapToStep = (value: number, min: number, step: number) =>
  Number((min + Math.round((value - min) / step) * step).toFixed(stepDecimals(step)));

/** Значение в диапазоне [min, max] и на сетке шага. */
export const isAllowed = (value: number, min: number, max: number, step: number) =>
  value >= min && value <= max && snapToStep(value, min, step) === value;

/** Прижать к диапазону и сетке — так поле исправляет ввод при потере фокуса. */
export const normalize = (value: number, min: number, max: number, step: number) =>
  snapToStep(Math.min(max, Math.max(min, value)), min, step);
