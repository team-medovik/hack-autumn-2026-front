import check20 from '../assets/check-20.svg';
import check from '../assets/check.svg';
import chevronDown from '../assets/chevron-down.svg';
import chevronLeft from '../assets/chevron-left.svg';
import chevronRight from '../assets/chevron-right.svg';
import close from '../assets/close.svg';
import home from '../assets/home.svg';
import info32 from '../assets/info-32.svg';
import info from '../assets/info.svg';
import lightning from '../assets/lightning.svg';
import loading from '../assets/loading.svg';
import refresh20 from '../assets/refresh-20.svg';
import refresh from '../assets/refresh.svg';
import settings from '../assets/settings.svg';
import sortAsc from '../assets/sort-asc.svg';
import sortDesc from '../assets/sort-desc.svg';
import sort from '../assets/sort.svg';
import table from '../assets/table.svg';
import trash from '../assets/trash.svg';
import upload from '../assets/upload.svg';

/**
 * Иконки дизайн-системы. Ключ — имя слоя в Figma.
 * Нативный размер — 24×24; `sort*` — 16×16 (Icon / сортировка), `*-20` — 20×20 (Плашка обновления),
 * `*-32` — 32×32 (сообщения в таблице).
 */
export const ICONS = {
  check,
  'check-20': check20,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'chevron-right': chevronRight,
  close,
  home,
  info,
  'info-32': info32,
  lightning,
  loading,
  refresh,
  'refresh-20': refresh20,
  settings,
  sort,
  'sort-asc': sortAsc,
  'sort-desc': sortDesc,
  table,
  trash,
  upload,
} as const;

export type IconName = keyof typeof ICONS;
