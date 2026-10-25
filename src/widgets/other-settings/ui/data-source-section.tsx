import {
  describeSyncError,
  getDataSourceKind,
  useDataSourceStatus,
  type DataSourceKind,
} from '@/entities/data-source';
import { formatTimeScale, SimulationStatus, useSimulation } from '@/entities/simulation';
import { SimulationSpeed } from '@/features/set-simulation-speed';
import { formatDateTime } from '@/shared/lib/format';
import { SkeletonText } from '@/shared/ui/skeleton';
import { Text } from '@/shared/ui/text';

const ErrorText = ({ children }: { children: string }) => (
  <Text variant="caption" color="danger" role="alert">
    {children}
  </Text>
);

/** Сноска под блоком: «остановит» — только пока панель считается по симуляции. */
const FOOTNOTES: Record<DataSourceKind, string> = {
  simulation: 'Данные генерируются синтетически. Загрузка снимка остановит симуляцию',
  snapshot: 'Данные симуляции синтетические',
};

/**
 * Содержимое блока «Источник данных» (макет «Настройки — другое (живая симуляция)»).
 * Генератор показываем всегда — GET /admin/simulation читает его напрямую, даже пока панель
 * считается по JSON-снимку: статус, виртуальное время и скорость. По чему считается панель —
 * отдельной строкой из GET /admin/generator/consumer. Генератор не ответил — пишем это,
 * а не прошлое состояние: контракт запрещает выдавать его за работающую симуляцию.
 * Переключать источник, ставить на паузу и перезапускать контракт пока не умеет — кнопок нет.
 */
export const DataSourceSection = () => {
  const { data: simulation, isPending } = useSimulation({ enabled: true });
  const { data: source } = useDataSourceStatus({ enabled: true });
  const sourceKind = source ? getDataSourceKind(source) : null;
  const syncError =
    sourceKind === 'simulation' && source?.progress ? describeSyncError(source.progress) : null;

  if (isPending) {
    return <SkeletonText lines={3} />;
  }

  return (
    <>
      <div className="other-settings__state">
        {simulation ? (
          <>
            <SimulationStatus workerState={simulation.workerState} />
            <Text variant="caption" color="secondary">
              Виртуальное время {formatDateTime(simulation.virtualTime)} ·{' '}
              {formatTimeScale(simulation.timeScale)}
            </Text>
          </>
        ) : (
          <ErrorText>Генератор не отвечает — состояние симуляции неизвестно</ErrorText>
        )}
        {sourceKind === 'snapshot' && (
          <Text variant="caption" color="secondary">
            Панель сейчас считается по JSON-снимку — симуляция идёт в фоне
          </Text>
        )}
        {syncError && <ErrorText>{syncError}</ErrorText>}
      </div>
      {simulation && <SimulationSpeed simulation={simulation} />}
      <Text variant="caption-2" color="tertiary">
        {FOOTNOTES[sourceKind ?? 'simulation']}
      </Text>
    </>
  );
};
