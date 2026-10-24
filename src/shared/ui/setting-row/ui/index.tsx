import { clsx } from 'clsx';
import { useId, type ReactNode } from 'react';

import { Text } from '../../text';

import './setting-row.scss';

/** id подписей строки — для `aria-labelledby` / `aria-describedby` контрола. */
export interface SettingRowIds {
  titleId: string;
  /** Есть, только если передана подсказка. */
  hintId?: string;
}

interface SettingRowProps {
  title: ReactNode;
  /** Подсказка под названием Caption 2: «всегда в полную силу / по умолчанию 70». */
  hint?: ReactNode;
  /** Контрол справа: `SliderField`, `Switch`… Получает id подписей строки. */
  children: (ids: SettingRowIds) => ReactNode;
  className?: string;
}

/**
 * Строка настройки (Настройки / признак): название с подсказкой слева, контрол справа.
 *
 * @example
 * <SettingRow title="Ожидает оплаты" hint="по умолчанию 70">
 *   {({ titleId, hintId }) => (
 *     <SliderField value={weight} onValueChange={setWeight} aria-labelledby={titleId} aria-describedby={hintId} />
 *   )}
 * </SettingRow>
 */
export const SettingRow = ({ title, hint, children, className }: SettingRowProps) => {
  const id = useId();
  const ids: SettingRowIds = { titleId: `${id}-title`, hintId: hint ? `${id}-hint` : undefined };

  return (
    <div className={clsx('setting-row', className)}>
      <div className="setting-row__description">
        <Text id={ids.titleId} variant="body" color="main">
          {title}
        </Text>
        {hint && (
          <Text id={ids.hintId} variant="caption-2" color="tertiary">
            {hint}
          </Text>
        )}
      </div>

      {children(ids)}
    </div>
  );
};
