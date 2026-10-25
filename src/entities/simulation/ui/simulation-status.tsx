import { StatusLabel } from '@/shared/ui/status-label';

import { WORKER_STATES } from '../lib/worker-state';
import type { WorkerState } from '../model/types';

interface SimulationStatusProps {
  workerState: WorkerState;
}

/** «● Симуляция · работает» — состояние генератора живой симуляции (слой «Статус симуляции»). */
export const SimulationStatus = ({ workerState }: SimulationStatusProps) => {
  const { label, tone } = WORKER_STATES[workerState];
  return <StatusLabel tone={tone}>Симуляция · {label}</StatusLabel>;
};
