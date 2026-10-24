import type { RiskLevel } from '@/shared/ui/risk-score';

/** Всего клиентов в снимке по счётчикам уровней. 0 — снимков ещё не загружали. */
export const countClients = (levelCounts: Record<RiskLevel, number>) =>
  Object.values(levelCounts).reduce((sum, count) => sum + count, 0);
