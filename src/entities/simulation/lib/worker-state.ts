import type { StatusTone } from '@/shared/ui/status-label';

import type { WorkerState } from '../model/types';

/** Подпись после «Симуляция ·» и цвет маркера — по макету «Статус симуляции». */
export const WORKER_STATES: Record<WorkerState, { label: string; tone: StatusTone }> = {
  starting: { label: 'запускается', tone: 'warning' },
  running: { label: 'работает', tone: 'success' },
  paused: { label: 'пауза', tone: 'warning' },
  finished: { label: 'завершена', tone: 'neutral' },
  error: { label: 'ошибка', tone: 'danger' },
};
