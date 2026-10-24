import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Text } from '../../text';

import './breakdown.scss';

interface BreakdownProps {
  /** Подпись блока Caption цвета text/tertiary: «Формула», «Потеря по услугам». */
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Плашка расчёта (блоки окна «Как посчитана потеря» в Figma): подпись, под ней строки
 * `<BreakdownRow>`, разделитель `<BreakdownDivider>` перед итогом или произвольный текст.
 *
 * @example
 * <Breakdown label="Потеря по услугам">
 *   <BreakdownRow label="service-0017" hint="9,90 € × 0,942 × (0,5 + 0,5 × 0,35)" value="6,27 €" accentValue />
 *   <BreakdownDivider />
 *   <BreakdownRow label="Итого в месяц" value="6,77 €" accent />
 * </Breakdown>
 */
export const Breakdown = ({ label, children, className }: BreakdownProps) => (
  <section className={clsx('breakdown', className)}>
    <Text variant="caption" color="tertiary">
      {label}
    </Text>
    {children}
  </section>
);

interface BreakdownRowProps {
  label: ReactNode;
  /** Расчёт под названием Caption цвета text/secondary: «(9,90 − 6,48) / 9,90». */
  hint?: ReactNode;
  value: ReactNode;
  /** Итоговая строка: название и значение — Body Bold. */
  accent?: boolean;
  /** Только значение — Body Bold (суммы по услугам). */
  accentValue?: boolean;
  /** Значение-пояснение вместо числа («заблокированы») — цветом text/tertiary. */
  mutedValue?: boolean;
}

/** Строка расчёта: название (и расчёт под ним) слева, значение справа. */
export const BreakdownRow = ({
  label,
  hint,
  value,
  accent = false,
  accentValue = false,
  mutedValue = false,
}: BreakdownRowProps) => (
  <div className="breakdown__row">
    <div className="breakdown__name">
      <Text variant={accent ? 'body-accent' : 'body'} color="main">
        {label}
      </Text>
      {hint && (
        <Text variant="caption" color="secondary">
          {hint}
        </Text>
      )}
    </div>
    <Text
      variant={accent || accentValue ? 'body-accent' : 'body'}
      color={mutedValue ? 'tertiary' : 'main'}
      align="right"
      className="breakdown__value"
    >
      {value}
    </Text>
  </div>
);

/** Линия border/divider перед итоговой строкой. */
export const BreakdownDivider = () => <hr className="breakdown__divider" />;
