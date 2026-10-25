import { useSimulation, WORKER_STATES } from '@/entities/simulation';
import { Card } from '@/shared/ui/card';
import { StatusLabel } from '@/shared/ui/status-label';
import { Text } from '@/shared/ui/text';

/**
 * Блок «Источник данных» вместо текущего снимка, когда риски считаются по живой симуляции
 * (макет «Импорт/экспорт снимка (живая симуляция)»). Цвет маркера — по состоянию генератора;
 * пока оно неизвестно — нейтральный. «Скачать текущие данные» контракт пока не умеет — кнопки нет.
 */
export const SimulationSource = () => {
  const { data: simulation } = useSimulation({ enabled: true });

  return (
    <Card aria-label="Источник данных" className="snapshot-manager__current">
      <div className="snapshot-manager__current-text">
        <Text variant="caption-2" color="tertiary">
          Источник данных
        </Text>
        <StatusLabel
          tone={simulation ? WORKER_STATES[simulation.workerState].tone : 'neutral'}
          size="l"
        >
          Живая симуляция
        </StatusLabel>
      </div>
    </Card>
  );
};
