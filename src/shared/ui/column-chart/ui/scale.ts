const NICE_STEPS = [1, 2, 5, 10] as const;

/**
 * «Красивая» шкала от нуля: шаг из ряда 1·10ⁿ, 2·10ⁿ, 5·10ⁿ (не меньше 1 — значения целые),
 * ровно `tickCount` делений. getNiceScale(18) → { max: 20, ticks: [0, 5, 10, 15, 20] }.
 */
export const getNiceScale = (maxValue: number, tickCount = 4) => {
  const rawStep = Math.max(maxValue / tickCount, 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    (NICE_STEPS.find((nice) => nice * magnitude >= rawStep) ?? NICE_STEPS.at(-1)!) * magnitude;

  return {
    max: step * tickCount,
    ticks: Array.from({ length: tickCount + 1 }, (_, index) => step * index),
  };
};
