import { formatPercent } from '@/shared/lib/format';

import type { ClientService } from '../model/card-types';

/**
 * predicted — у услуги есть вероятность от ML; unavailable — живая услуга, но модель её не оценила
 * («Нет прогноза»); not-applicable — у услуги нет оценки, продлевать нечего («Нет оценки»).
 */
export type RenewalForecastState = 'predicted' | 'unavailable' | 'not-applicable';

export interface RenewalForecastView {
  state: RenewalForecastState;
  /** «68 %» — только у predicted. */
  value: string | null;
  /** Пояснение для подсказки «?». */
  hint: string;
}

/**
 * Причину, почему прогноза нет, контракт не отдаёт — объясняем, когда модель вообще оценивает
 * услугу. Пометку о синтетических данных контракт требует сохранять рядом с вероятностью.
 */
const HINTS: Record<RenewalForecastState, string> = {
  predicted:
    'Вероятность, что услугу не продлят и не заменят оплаченной в течение 5 суток после срока оплаты. Оценка ML-модели на синтетических данных, а не балл риска',
  unavailable:
    'Модель оценивает услуги со сроком оплаты в ближайшие 7 суток и полной историей событий. Для этой услуги прогноза нет — риск посчитан по правилам',
  'not-applicable': 'Услугу не продлевают — модель её не оценивает',
};

/** Крайние значения не округляем до «0 %» и «100 %»: модель так не утверждает. */
const MIN_SHOWN = 0.01;
const MAX_SHOWN = 0.99;

/** 0.68 → «68 %», 0 и 0.003 → «< 1 %», 0.996 → «> 99 %». */
export const formatLossProbability = (probability: number) => {
  if (probability < MIN_SHOWN) {
    return `<\u00a0${formatPercent(MIN_SHOWN)}`;
  }
  if (probability > MAX_SHOWN) {
    return `>\u00a0${formatPercent(MAX_SHOWN)}`;
  }
  return formatPercent(probability);
};

const getState = ({
  lossProbability,
  score,
}: Pick<ClientService, 'lossProbability' | 'score'>): RenewalForecastState => {
  if (lossProbability !== null) {
    return 'predicted';
  }
  return score === null ? 'not-applicable' : 'unavailable';
};

/** Что показать в плашке прогноза непродления и в подсказке к ней. */
export const describeRenewalForecast = (
  service: Pick<ClientService, 'lossProbability' | 'score'>,
): RenewalForecastView => {
  const state = getState(service);
  return {
    state,
    value: service.lossProbability === null ? null : formatLossProbability(service.lossProbability),
    hint: HINTS[state],
  };
};
