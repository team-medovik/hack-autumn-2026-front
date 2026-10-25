import { useQuery } from '@tanstack/react-query';

import { simulationApi } from './simulation.api';

/** Виртуальное время идёт быстро (×60 — минута в секунду), поэтому спрашиваем чаще остальных данных. */
const SIMULATION_REFETCH_MS = 5000;

export const simulationKeys = {
  all: ['simulation'] as const,
} as const;

interface UseSimulationOptions {
  /** Эндпоинт только для ADMIN и имеет смысл, только пока риски считаются по симуляции. */
  enabled: boolean;
}

/** Состояние генератора: статус, виртуальное время и скорость. GET часы не двигает. */
export const useSimulation = ({ enabled }: UseSimulationOptions) =>
  useQuery({
    queryKey: simulationKeys.all,
    queryFn: simulationApi.state,
    enabled,
    refetchInterval: SIMULATION_REFETCH_MS,
  });
