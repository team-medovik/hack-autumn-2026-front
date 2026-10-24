import { clsx } from 'clsx';
import { useId, type ReactNode } from 'react';

import { CardHeader } from '../../card';

import './form-section.scss';

interface FormSectionProps {
  title: ReactNode;
  /** Пояснение к иконке «info» рядом с заголовком. */
  hint?: ReactNode;
  /** Подзаголовок Caption 2: «Пороги уровней риска. Высокий должен быть больше среднего». */
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Группа полей формы на панели (блоки страницы «Настройки»): заголовок, затем поля через 16px.
 * Секция подписана своим заголовком.
 *
 * @example
 * <FormSection title="Финансы" hint="Какие деньги считаются доступными">
 *   <SettingRow …>…</SettingRow>
 * </FormSection>
 */
export const FormSection = ({
  title,
  hint,
  description,
  children,
  className,
}: FormSectionProps) => {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={clsx('form-section', className)}>
      <CardHeader titleId={titleId} title={title} hint={hint} description={description} />
      {children}
    </section>
  );
};
