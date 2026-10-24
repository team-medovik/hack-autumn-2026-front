import { countClients, type ClientLevelFilter } from '@/entities/client';
import { formatNumber } from '@/shared/lib/format';
import { RISK_LEVEL_LABELS, RISK_LEVELS } from '@/shared/ui/risk-level';
import type { RiskLevel } from '@/shared/ui/risk-score';
import { ToggleGroup, type ToggleGroupItem } from '@/shared/ui/toggle-group';

interface LevelFilterProps {
  value: ClientLevelFilter;
  onChange: (level: ClientLevelFilter) => void;
  /** Клиентов по уровням. `undefined` — ещё загружаются: подписи без счётчиков. */
  counts?: Record<RiskLevel, number>;
  className?: string;
}

const withCount = (label: string, count: number | undefined) =>
  count === undefined ? label : `${label} · ${formatNumber(count)}`;

/** Фильтр по уровню риска: «Все · 42», «Высокий · 13»… Пустые уровни недоступны. */
export const LevelFilter = ({ value, onChange, counts, className }: LevelFilterProps) => {
  const items: ToggleGroupItem<ClientLevelFilter>[] = [
    { value: 'all', label: withCount('Все', counts && countClients(counts)) },
    ...RISK_LEVELS.map((level) => ({
      value: level,
      label: withCount(RISK_LEVEL_LABELS[level], counts?.[level]),
      disabled: counts?.[level] === 0,
    })),
  ];

  return (
    <ToggleGroup
      aria-label="Уровень риска"
      items={items}
      value={value}
      onValueChange={onChange}
      className={className}
    />
  );
};
