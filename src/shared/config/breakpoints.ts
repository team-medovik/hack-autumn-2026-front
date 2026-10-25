/**
 * Единый источник брейкпоинтов (mobile-first, px) — коллекция Breakpoint из Figma.
 *
 * | Figma mode      | Диапазон     | Ключ         |
 * | --------------- | ------------ | ------------ |
 * | Mobile          | 330–427      | — (база, без медиа-запроса) |
 * | Tablet          | 428–1279     | `tablet`     |
 * | Desktop S 1280  | 1280–1439    | `desktop-s`  |
 * | Desktop M 1440  | 1440–1599    | `desktop-m`  |
 * | Desktop L 1600  | 1600–1919    | `desktop-l`  |
 * | Desktop XL 1920 | 1920+        | `desktop-xl` |
 *
 * vite.config.ts передаёт эти значения в `src/shared/styles/_breakpoints.scss`,
 * поэтому миксины `up` / `down` / `between` доступны в любом .scss без импорта.
 *
 * Файл не должен ничего импортировать: его читает vite.config.ts в Node-контексте.
 */
export const BREAKPOINTS = {
  tablet: 428,
  'desktop-s': 1280,
  'desktop-m': 1440,
  'desktop-l': 1600,
  'desktop-xl': 1920,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** SCSS-карта для `@use ... with ($breakpoints: ...)`: `('tablet': 428px, ...)` */
export function toScssMap(bps: Record<string, number> = BREAKPOINTS): string {
  const entries = Object.entries(bps).map(([name, px]) => `'${name}': ${px}px`);
  return `(${entries.join(', ')})`;
}
