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
 * Фоновый декор: две пунктирные орбиты вокруг панели медленно вращаются навстречу друг другу,
 * по внешней ползёт точка-спутник — как кольца вокруг глобуса на aeza.net.
 */
const FormWidgetOrbits = () => (
  <svg className="form-widget__orbits" viewBox="0 0 800 800" fill="none" aria-hidden>
    <g className="form-widget__orbit form-widget__orbit--outer">
      <circle cx="400" cy="400" r="380" />
      <circle className="form-widget__satellite" cx="400" cy="20" r="6" />
    </g>
    <g className="form-widget__orbit form-widget__orbit--inner">
      <circle cx="400" cy="400" r="300" />
    </g>
  </svg>
);

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
      <FormWidgetOrbits />
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
