import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import './aside-layout.scss';

interface AsideLayoutProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Основная колонка: блоки друг под другом через 24px. */
  children: ReactNode;
  /** Колонка справа, 320px: действия, форма создания. Без неё место остаётся пустым, как в макете. */
  aside?: ReactNode;
  /** Подпись колонки справа — она рендерится как `<aside>`. */
  asideLabel?: string;
  /** Колонка справа не уезжает при прокрутке длинной основной колонки. */
  stickyAside?: boolean;
}

/**
 * Колонки страницы «Настройки»: основная тянется, справа — 320px, между ними 24px.
 * На узких экранах колонка справа уходит вниз во всю ширину.
 *
 * @example
 * <AsideLayout aside={<SettingsActions … />} asideLabel="Сохранение настроек" stickyAside>
 *   <FactorWeightsSection … />
 * </AsideLayout>
 */
export const AsideLayout = ({
  children,
  aside,
  asideLabel,
  stickyAside = false,
  className,
  ...props
}: AsideLayoutProps) => (
  <div className={clsx('aside-layout', className)} {...props}>
    <div className="aside-layout__main">{children}</div>
    {aside === undefined ? (
      <div className="aside-layout__aside" aria-hidden />
    ) : (
      <aside
        aria-label={asideLabel}
        className={clsx('aside-layout__aside', { 'aside-layout__aside--sticky': stickyAside })}
      >
        {aside}
      </aside>
    )}
  </div>
);
