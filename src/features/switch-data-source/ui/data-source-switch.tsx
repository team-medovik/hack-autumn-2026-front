import type { DataSourceKind } from '@/entities/data-source';
import { ToggleGroup, type ToggleGroupItem } from '@/shared/ui/toggle-group';

import { useSwitchDataSource } from '../model/use-switch-data-source';

const ITEMS: readonly Omit<ToggleGroupItem<DataSourceKind>, 'disabled'>[] = [
  { value: 'snapshot', label: 'JSON-снимок' },
  { value: 'simulation', label: 'Живая симуляция' },
];

interface DataSourceSwitchProps {
  /** По чему панель считается сейчас. */
  value: DataSourceKind;
}

/**
 * «JSON-снимок / Живая симуляция» (слой «Выбор» блока «Источник данных»): по чему считаются
 * клиенты, риски и дашборд. Пока сервер переключает — кнопки недоступны.
 */
export const DataSourceSwitch = ({ value }: DataSourceSwitchProps) => {
  const { mutate, isPending } = useSwitchDataSource();

  return (
    <ToggleGroup
      aria-label="Источник данных панели"
      value={value}
      onValueChange={(mode) => mutate(mode)}
      items={ITEMS.map((item) => ({ ...item, disabled: isPending }))}
    />
  );
};
