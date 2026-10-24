import { formatNumber } from '@/shared/lib/format';

/** Знаков после запятой в подписях: k меняется шагом 0,05. */
const DIGITS = 2;

/** «… По умолчанию 70» — хвост подсказки со значением по умолчанию. */
export const withDefault = (description: string, byDefault: number) =>
  `${description} По умолчанию ${formatNumber(byDefault, DIGITS)}`;

/** «было 70» под названием — только у изменённого значения. */
export const wasNote = (value: number, saved: number) =>
  value === saved ? undefined : `было ${formatNumber(saved, DIGITS)}`;

/** Подсказки параметров, кроме весов признаков (те — в SCORE_FACTORS). Из гайдлайна «?». */
export const SETTING_HELP = {
  medium: 'Риск от этого значения и выше считается средним.',
  high: 'Риск от этого значения и выше считается высоким. Должен быть больше порога среднего.',
  bonusesAsMoney: 'Если бонусы клиента разблокированы, они считаются деньгами на продление',
  referralBalanceAsMoney:
    'Реферальный баланс можно вывести или перевести на основной. Автопродление с него не списывает',
  balanceLossFactor: 'Насколько деньги на счёте снижают ожидаемую потерю.',
  horizonDays: 'Модель смотрит на услуги, которые закончатся в ближайшие N дней.',
} as const;
