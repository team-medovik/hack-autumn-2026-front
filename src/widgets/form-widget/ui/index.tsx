import { useId, type ComponentProps, type ReactNode } from 'react';

import { Logo } from '@/shared/ui/logo';
import { Panel } from '@/shared/ui/panel';
import { Text } from '@/shared/ui/text';

import './form-widget.scss';

interface FormWidgetProps extends Omit<ComponentProps<'form'>, 'title' | 'children'> {
  /** Заголовок панели (Heading 2). */
  title: ReactNode;
  /** Подзаголовок под заголовком (Caption, вторичный цвет). */
  description?: ReactNode;
  /** Поля формы — колонка с отступом 12px. */
  children: ReactNode;
  /** Кнопки под полями — колонка с отступом 12px. */
  actions: ReactNode;
}

/**
 * Экран-форма по макету «Вход»: панель по центру страницы,
 * сверху заголовок, поля и кнопки, снизу логотип и подпись команды.
 * Сам является `<form>` — `onSubmit` и прочие атрибуты формы передаются напрямую.
 *
 * @example
 * <FormWidget
 *   title="вход в админ-панéль"
 *   description="введите логин и пароль"
 *   onSubmit={handleSubmit(onSubmit)}
 *   actions={<Button type="submit" variant="primary" fullWidth>Продолжить</Button>}
 * >
 *   <Input label="Логин" {...register('email')} />
 * </FormWidget>
 */
export const FormWidget = ({
  title,
  description,
  children,
  actions,
  ...formProps
}: FormWidgetProps) => {
  const titleId = useId();

  return (
    <div className="form-widget">
      <Panel asChild className="form-widget__panel">
        <form noValidate aria-labelledby={titleId} {...formProps}>
          <div className="form-widget__body">
            <div className="form-widget__head">
              <Text variant="heading-2" color="main" id={titleId} className="form-widget__title">
                {title}
              </Text>
              {description && (
                <Text variant="caption" color="secondary">
                  {description}
                </Text>
              )}
            </div>

            <div className="form-widget__fields">{children}</div>
            <div className="form-widget__actions">{actions}</div>
          </div>

          <footer className="form-widget__footer">
            <Logo />
            <Text variant="caption" color="secondary" align="right">
              Разработано командой
              <br />
              «Дикий Медовик»
            </Text>
          </footer>
        </form>
      </Panel>
    </div>
  );
};
