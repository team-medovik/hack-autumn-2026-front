import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Button } from '../../button';

import './toggle-group.scss';

export interface ToggleGroupItem<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

interface ToggleGroupProps<T extends string> {
  items: readonly ToggleGroupItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Подпись группы для скринридера, например «Уровень риска». */
  'aria-label': string;
  className?: string;
}

/**
 * Группа взаимоисключающих кнопок (Вторичная кнопка Figma): выбранная — в состоянии «Активное».
 *
 * @example
 * <ToggleGroup
 *   aria-label="Уровень риска"
 *   value={level}
 *   onValueChange={setLevel}
 *   items={[{ value: 'all', label: 'Все · 42' }, { value: 'high', label: 'Высокий · 13' }]}
 * />
 */
export const ToggleGroup = <T extends string>({
  items,
  value,
  onValueChange,
  'aria-label': ariaLabel,
  className,
}: ToggleGroupProps<T>) => (
  <div role="group" aria-label={ariaLabel} className={clsx('toggle-group', className)}>
    {items.map((item) => {
      const isSelected = item.value === value;

      return (
        <Button
          key={item.value}
          variant="secondary"
          active={isSelected}
          aria-pressed={isSelected}
          disabled={item.disabled}
          onClick={() => {
            if (!isSelected) {
              onValueChange(item.value);
            }
          }}
        >
          {item.label}
        </Button>
      );
    })}
  </div>
);
