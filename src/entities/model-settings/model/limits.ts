interface NumberLimits {
  min: number;
  max: number;
  step: number;
}

/** Допустимые значения числовых параметров — те же проверяет сервер. */
export const MODEL_SETTINGS_LIMITS = {
  factorWeight: { min: 0, max: 100, step: 1 },
  riskThreshold: { min: 1, max: 100, step: 1 },
  balanceLossFactor: { min: 0, max: 1, step: 0.05 },
  horizonDays: { min: 1, max: 30, step: 1 },
  recalculationIntervalMinutes: { min: 1, max: 60, step: 1 },
} as const satisfies Record<string, NumberLimits>;
