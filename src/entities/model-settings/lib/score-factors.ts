import type { ScoreFactorId } from '../model/types';

export interface ScoreFactorInfo {
  id: ScoreFactorId;
  label: string;
  /** Как признак набирает силу — начало подсказки под названием. */
  behavior: string;
}

/** Признаки score в порядке экрана настроек. */
export const SCORE_FACTORS: readonly ScoreFactorInfo[] = [
  { id: 'awaitingPayment', label: 'Ожидает оплаты', behavior: 'всегда в полную силу' },
  {
    id: 'expiringWithoutAutoRenewal',
    label: 'Скоро истекает без автопродления',
    behavior: 'сильнее, чем ближе окончание',
  },
  {
    id: 'insufficientFunds',
    label: 'Не хватает средств на продление',
    behavior: 'сильнее, чем больше нехватка',
  },
  {
    id: 'awaitingPaymentWithoutFunds',
    label: 'Ожидает оплаты без средств',
    behavior: 'сильнее, чем больше нехватка',
  },
  { id: 'disabledByClient', label: 'Выключена клиентом', behavior: 'всегда в полную силу' },
  {
    id: 'bonusesExceedMoney',
    label: 'Бонусов больше, чем реальных денег',
    behavior: 'сильнее при большем перевесе',
  },
];
