import { describe, expect, it } from 'vitest';

import {
  formatCount,
  formatDate,
  formatDateTime,
  formatDateTimeUtc,
  formatDayMonth,
  formatMoney,
  formatNumber,
  formatPercent,
  parseDateTimeUtc,
  parseDecimal,
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

  it('округляет до заданной точности', () => {
    expect(formatNumber(0.942, 3)).toBe('0,942');
    expect(formatNumber(0.3455, 2)).toBe('0,35');
    expect(formatNumber(0.5, 2)).toBe('0,5');
  });
});

describe('formatPercent', () => {
  it('переводит долю в целые проценты', () => {
    expect(plain(formatPercent(0.3455))).toBe('35 %');
    expect(plain(formatPercent(0))).toBe('0 %');
  });
});

describe('formatDateTime', () => {
  it('показывает дату и время в часовом поясе пользователя', () => {
    expect(formatDateTime(new Date(2026, 9, 23, 18, 0).toISOString())).toBe('23.10.2026, 18:00');
  });
});

describe('parseDecimal', () => {
  it('понимает и запятую, и точку', () => {
    expect(parseDecimal('0,5')).toBe(0.5);
    expect(parseDecimal(' 0.25 ')).toBe(0.25);
    expect(parseDecimal('70')).toBe(70);
  });

  it('не принимает пустой и мусорный ввод', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('12abc')).toBeNull();
    expect(parseDecimal('1e3')).toBeNull();
    expect(parseDecimal(',5')).toBeNull();
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

describe('formatDate', () => {
  it('показывает день, месяц и год', () => {
    expect(formatDate('2026-10-20')).toBe('20.10.2026');
    expect(formatDate(new Date(2026, 9, 22, 23, 30).toISOString())).toBe('22.10.2026');
  });
});

describe('formatDateTimeUtc / parseDateTimeUtc', () => {
  it('показывает время по UTC', () => {
    expect(formatDateTimeUtc('2026-10-19T15:00:00.000Z')).toBe('19.10.2026, 15:00');
  });

  it('разбирает ввод в ISO по UTC', () => {
    expect(parseDateTimeUtc('19.10.2026, 15:00')).toBe('2026-10-19T15:00:00.000Z');
    expect(parseDateTimeUtc(' 1.2.2026 9:05 ')).toBe('2026-02-01T09:05:00.000Z');
  });

  it('отклоняет несуществующую дату и чужой формат', () => {
    expect(parseDateTimeUtc('31.02.2026, 15:00')).toBeNull();
    expect(parseDateTimeUtc('19.10.2026, 25:00')).toBeNull();
    expect(parseDateTimeUtc('2026-10-19 15:00')).toBeNull();
  });
});
