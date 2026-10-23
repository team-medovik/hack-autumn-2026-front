import { useEffect, useState } from 'react';

import { BREAKPOINTS, type Breakpoint } from '@/shared/config';

/**
 * Отслеживает соответствие CSS media query и реагирует на изменения.
 *
 * @example
 * const isTablet = useMediaQuery(breakpoints.md);     // >= 768px
 * const isMobile = useMediaQuery(breakpointsDown.md); // < 768px
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

const mapBreakpoints = (toQuery: (px: number) => string) =>
  Object.fromEntries(
    Object.entries(BREAKPOINTS).map(([name, px]) => [name, toQuery(px)]),
  ) as Record<Breakpoint, string>;

/**
 * Пресеты брейкпоинтов (mobile-first, min-width). То же, что `@include up(...)` в SCSS.
 * Значения — в `@/shared/config/breakpoints`.
 *
 * @example
 * const isTablet = useMediaQuery(breakpoints.md);   // >= 768px
 */
export const breakpoints = mapBreakpoints((px) => `(min-width: ${px}px)`);

/**
 * Обратные пресеты (max-width). То же, что `@include down(...)` в SCSS.
 *
 * @example
 * const isMobile = useMediaQuery(breakpointsDown.md); // < 768px
 */
export const breakpointsDown = mapBreakpoints((px) => `(max-width: ${px - 0.02}px)`);
