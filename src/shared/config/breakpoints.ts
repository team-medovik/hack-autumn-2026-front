/**
 * Единый источник брейкпоинтов (mobile-first, px).
 *
 * Используется в двух местах:
 * - JS: `breakpoints` / `breakpointsDown` в `@/shared/lib/media-query`
 * - SCSS: vite.config.ts передаёт эти значения в `src/shared/styles/_breakpoints.scss`,
 *   поэтому миксины `up` / `down` / `between` доступны в любом .scss без импорта.
 *
 * Меняйте значения только здесь — CSS и JS переключаются на одних и тех же границах.
 * Файл не должен ничего импортировать: его читает vite.config.ts в Node-контексте.
 */
export const BREAKPOINTS = {
  xs: 480, // большие телефоны
  sm: 640, // маленькие планшеты
  md: 768, // планшеты
  lg: 1024, // ноутбуки
  xl: 1280, // десктоп
  '2xl': 1536, // широкий десктоп
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** SCSS-карта для `@use ... with ($breakpoints: ...)`: `('xs': 480px, ...)` */
export function toScssMap(bps: Record<string, number> = BREAKPOINTS): string {
  const entries = Object.entries(bps).map(([name, px]) => `'${name}': ${px}px`);
  return `(${entries.join(', ')})`;
}
