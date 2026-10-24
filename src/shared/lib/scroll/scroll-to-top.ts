/**
 * Прокрутить окно в начало. `smooth` — плавно, если пользователь не просил меньше анимаций.
 *
 * @example
 * scrollToTop('smooth'); // после смены страницы таблицы — пользователь был внизу, у пагинации
 */
export const scrollToTop = (behavior: 'instant' | 'smooth' = 'instant') => {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'instant' : behavior });
};
