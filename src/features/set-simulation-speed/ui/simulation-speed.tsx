import type { Simulation, TimeScale } from '@/entities/simulation';
import { Text } from '@/shared/ui/text';
import { ToggleGroup } from '@/shared/ui/toggle-group';

import { useSetSimulationSpeed } from '../model/use-set-simulation-speed';

import './simulation-speed.scss';

interface SimulationSpeedProps {
  simulation: Pick<Simulation, 'runId' | 'timeScale' | 'supportedTimeScales'>;
}

/**
 * «Скорость ×1 / ×10 / ×60» (слой «Скорость» в Figma). Пока сервер сохраняет — кнопки недоступны,
 * нажатой показываем выбранную. Скорость старого запуска не из пресетов — не нажата ни одна.
 */
export const SimulationSpeed = ({
  simulation: { runId, timeScale, supportedTimeScales },
}: SimulationSpeedProps) => {
  const { mutate, isPending, variables } = useSetSimulationSpeed();
  const shown = isPending && variables ? variables.timeScale : timeScale;

  return (
    <div className="simulation-speed">
      <Text variant="caption" color="secondary" aria-hidden>
        Скорость
      </Text>
      <ToggleGroup
        aria-label="Скорость симуляции"
        value={String(shown)}
        onValueChange={(value) => mutate({ runId, timeScale: Number(value) as TimeScale })}
        items={supportedTimeScales.map((scale) => ({
          value: String(scale),
          label: `×${scale}`,
          disabled: isPending,
        }))}
      />
    </div>
  );
};
