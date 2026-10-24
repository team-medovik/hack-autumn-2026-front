import type { ScoreFactorId } from '../model/types';

export interface ScoreFactorInfo {
  id: ScoreFactorId;
  label: string;
  /** Что значит признак — текст подсказки «?» без значения по умолчанию. */
  description: string;
}

/** Признаки score в порядке экрана настроек. Тексты — из гайдлайна «Тексты подсказок „?“». */
export const SCORE_FACTORS: readonly ScoreFactorInfo[] = [
  {
    id: 'awaitingPayment',
    label: 'Ожидает оплаты',
    description: 'Срок услуги истёк, платформа ждёт оплату 5 дней и потом удаляет услугу.',
  },
  {
    id: 'expiringWithoutAutoRenewal',
    label: 'Скоро истекает без автопродления',
    description:
      'Услуга скоро закончится, а автопродление выключено. Чем ближе окончание, тем сильнее признак.',
  },
  {
    id: 'insufficientFunds',
    label: 'Не хватает средств на продление',
    description:
      'Денег на счёте меньше, чем нужно на продления в горизонте прогноза. Чем больше нехватка, тем сильнее.',
  },
  {
    id: 'awaitingPaymentWithoutFunds',
    label: 'Ожидает оплаты без средств',
    description: 'Услуга ждёт оплату, а денег на счёте не хватает. Добавляется к «Ожидает оплаты».',
  },
  {
    id: 'disabledByClient',
    label: 'Выключена клиентом',
    description: 'Клиент выключил сервер, но продолжает платить: возможно, услуга ему не нужна.',
  },
  {
    id: 'bonusesExceedMoney',
    label: 'Бонусов больше, чем реальных денег',
    description:
      'Клиент держится на бонусах, а не на своих деньгах. Чем больше перевес, тем сильнее.',
  },
];
