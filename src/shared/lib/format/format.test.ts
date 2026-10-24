import { describe, expect, it } from 'vitest';

import {
  formatCount,
  formatDayMonth,
  formatMoney,
  formatNumber,
  pluralize,
  type PluralForms,
} from './format';

const CLIENTS: PluralForms = ['клиент', 'клиента', 'клиентов'];

// Intl разделяет группы и валюту неразрывными пробелами — нормализуем для читаемости
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('formatMoney', () => {
  it('форматирует евро с двумя знаками и группами разрядов', () => {
    expect(plain(formatMoney(1296.9))).toBe('1 296,90 €');
    expect(plain(formatMoney(0))).toBe('0,00 €');
  });
});

describe('formatNumber', () => {
  it('оставляет не больше одного знака после запятой', () => {
    expect(formatNumber(94.2)).toBe('94,2');
    expect(formatNumber(100)).toBe('100');
  });
});

describe('pluralize', () => {
  it.each([
    [1, 'клиент'],
    [3, 'клиента'],
    [16, 'клиентов'],
    [21, 'клиент'],
    [112, 'клиентов'],
  ])('%i → %s', (count, expected) => {
    expect(pluralize(count, CLIENTS)).toBe(expected);
  });

  it('formatCount склеивает число и слово', () => {
    expect(formatCount(9, CLIENTS)).toBe('9 клиентов');
  });
});

describe('formatDayMonth', () => {
  it('дату без времени берёт как локальную, без сдвига на день', () => {
    expect(formatDayMonth('2026-08-31')).toBe('31.08');
  });

  it('принимает и дату-время', () => {
    expect(formatDayMonth(new Date(2026, 9, 26, 12).toISOString())).toBe('26.10');
  });
});
