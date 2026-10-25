import type {
  SimulationSpeedRequest,
  SimulationState,
  SimulationStateWorkerState,
} from '@/shared/api';

/**
 * Живая симуляция: GET /admin/simulation — состояние генератора напрямую (только ADMIN), PATCH
 * /admin/simulation/speed — скорость ×1/×10/×60. DTO — из openapi/openapi.yaml
 * (src/shared/api/generated). В dev отдаётся MSW (src/app/mocks/data-source).
 *
 * `timeScale` — виртуальных секунд за реальную: ×60 = минута симуляции за секунду. Пауза,
 * перезапуск, переключение источника и перемотка контрактом пока не поддерживаются.
 * 503 — генератор выключен или недоступен: прошлое состояние не выдаём за работающую симуляцию.
 */
export type Simulation = SimulationState;

export type WorkerState = SimulationStateWorkerState;

export type SpeedRequest = SimulationSpeedRequest;

/** Пресет скорости, который принимает сервер. */
export type TimeScale = SpeedRequest['timeScale'];
