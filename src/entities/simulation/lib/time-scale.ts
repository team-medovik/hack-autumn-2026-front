import { formatNumber } from '@/shared/lib/format';

/** Скорость словами, как в макете: ×60 → «1 минута = 1 час» (минута реальная — час виртуальный). */
const PRESET_TEXTS: Record<number, string> = {
  1: 'реальное время',
  10: '1 минута = 10 минут',
  60: '1 минута = 1 час',
};

/** Пресет — словами, нестандартная скорость старого запуска — множителем: «×2,5». */
export const formatTimeScale = (timeScale: number) =>
  PRESET_TEXTS[timeScale] ?? `×${formatNumber(timeScale)}`;
