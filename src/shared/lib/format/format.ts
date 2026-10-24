const LOCALE = 'ru-RU';

const moneyFormat = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormats = new Map<number, Intl.NumberFormat>();

const getNumberFormat = (maximumFractionDigits: number) => {
  let format = numberFormats.get(maximumFractionDigits);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE, { maximumFractionDigits });
    numberFormats.set(maximumFractionDigits, format);
  }
  return format;
};

const percentFormat = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 0,
});

const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });

const dayMonthFormat = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit' });

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** 1296.9 → «1 296,90 €» (разделители — неразрывные пробелы). */
export const formatMoney = (value: number) => moneyFormat.format(value);

/** 94.2 → «94,2», 100 → «100». Доли — с нужной точностью: formatNumber(0.942, 3) → «0,942». */
export const formatNumber = (value: number, maximumFractionDigits = 1) =>
  getNumberFormat(maximumFractionDigits).format(value);

/** Доля 0–1 → «35 %» (с неразрывным пробелом). */
export const formatPercent = (share: number) => percentFormat.format(share);

/** ISO-дата → «22:10» в часовом поясе пользователя. */
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));

/** ISO-дата → «23.10.2026, 18:00» в часовом поясе пользователя. */
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));

const DECIMAL = /^-?\d+([.,]\d+)?$/;

/**
 * Число из ввода пользователя: «0,5» и «0.5» → 0.5, пробелы по краям не важны.
 * Пустая строка, «1e3», «12abc» — `null`.
 */
export const parseDecimal = (text: string) => {
  const trimmed = text.trim();
  return DECIMAL.test(trimmed) ? Number(trimmed.replace(',', '.')) : null;
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Дата без времени («2026-08-31») — локальная полночь. `new Date('2026-08-31')` дал бы
 * полночь UTC, и западнее Гринвича день съехал бы на предыдущий.
 */
const parseDate = (iso: string) => {
  const match = DATE_ONLY.exec(iso);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(iso);
};

/** ISO-дата или дата-время → «31.08». */
export const formatDayMonth = (iso: string) => dayMonthFormat.format(parseDate(iso));

/** Формы слова для 1, 2–4 и 5+: `['клиент', 'клиента', 'клиентов']`. */
export type PluralForms = readonly [one: string, few: string, many: string];

const pluralRules = new Intl.PluralRules(LOCALE);

/** Слово в нужной форме: pluralize(3, CLIENT_FORMS) → «клиента». */
export const pluralize = (count: number, [one, few, many]: PluralForms) => {
  const rule = pluralRules.select(count);
  if (rule === 'one') {
    return one;
  }
  return rule === 'few' ? few : many;
};

/** Число со словом: formatCount(16, CLIENT_FORMS) → «16 клиентов». */
export const formatCount = (count: number, forms: PluralForms) =>
  `${formatNumber(count)} ${pluralize(count, forms)}`;
