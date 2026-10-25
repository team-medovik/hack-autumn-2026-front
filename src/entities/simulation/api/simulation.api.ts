import { getSimulationState, setSimulationSpeed } from '@/shared/api';

import type { Simulation, SpeedRequest } from '../model/types';

export const simulationApi = {
  /** 503 — генератор выключен или недоступен. */
  state: (): Promise<Simulation> => getSimulationState(),

  /**
   * Ответ — состояние с сохранённой скоростью, она применится со следующего шага генератора.
   * 409 — `runId` устарел (симуляцию перезапустили): перечитать состояние.
   */
  setSpeed: (request: SpeedRequest): Promise<Simulation> => setSimulationSpeed(request),
};
