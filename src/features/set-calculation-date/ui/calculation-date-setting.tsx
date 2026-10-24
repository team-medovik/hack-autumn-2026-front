import { useCalculationDate, type CalculationDateMode } from '@/entities/calculation-date';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { StateMessage } from '@/shared/ui/state-message';
import { ToggleGroup, type ToggleGroupItem } from '@/shared/ui/toggle-group';

import { FixedAtField } from './fixed-at-field';
import { useSaveCalculationDate } from '../model/use-save-calculation-date';

import './calculation-date-setting.scss';

const MODE_ITEMS: readonly ToggleGroupItem<CalculationDateMode>[] = [
  { value: 'current', label: 'Текущая' },
  { value: 'fixed', label: 'Зафиксировать' },
];

/** Момент для «Зафиксировать», если раньше не фиксировали: текущий час по UTC. */
const currentHourUtc = () => {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now.toISOString();
};

/**
 * «Дата расчёта»: считать риски на сегодня или на зафиксированный момент (демо, тестовые данные).
 * Сохраняется сразу — отдельной кнопки в макете нет.
 */
export const CalculationDateSetting = () => {
  const { data, isError, isFetching, refetch } = useCalculationDate();
  const { mutate: save, isPending } = useSaveCalculationDate();

  if (!data) {
    return isError ? (
      <StateMessage
        role="alert"
        title="Не удалось загрузить дату расчёта"
        description="Сервер не ответил. Попробуйте ещё раз"
        action={
          <Button variant="secondary" active loading={isFetching} onClick={() => void refetch()}>
            Повторить
          </Button>
        }
      />
    ) : (
      <Skeleton width={300} height={56} />
    );
  }

  const changeMode = (mode: CalculationDateMode) =>
    save({ mode, fixedAt: mode === 'fixed' ? (data.fixedAt ?? currentHourUtc()) : data.fixedAt });

  return (
    <>
      <ToggleGroup
        aria-label="Дата расчёта"
        items={MODE_ITEMS}
        value={data.mode}
        onValueChange={changeMode}
      />
      {data.mode === 'fixed' && data.fixedAt && (
        <FixedAtField
          key={data.fixedAt}
          value={data.fixedAt}
          disabled={isPending}
          onCommit={(fixedAt) => save({ mode: 'fixed', fixedAt })}
        />
      )}
    </>
  );
};
