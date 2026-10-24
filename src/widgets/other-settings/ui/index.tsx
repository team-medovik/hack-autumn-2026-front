import { useId, type ReactNode } from 'react';

import { useSessionUser } from '@/entities/session';
import { LogoutButton } from '@/features/auth';
import { ChangePasswordButton } from '@/features/change-password';
import { CalculationDateSetting } from '@/features/set-calculation-date';
import { ThemeSwitch } from '@/features/switch-theme';
import { AsideLayout } from '@/shared/ui/aside-layout';
import { Card, CardHeader } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';

import './other-settings.scss';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Блок настроек: заголовок, затем содержимое через 16px. */
const SettingsCard = ({ title, description, children }: SettingsCardProps) => {
  const titleId = useId();

  return (
    <Card aria-labelledby={titleId} className="other-settings__card">
      <CardHeader titleId={titleId} title={title} description={description} />
      {children}
    </Card>
  );
};

/**
 * Вкладка «Другое» по макетам «Настройки — другое (…)»: тема, дата расчёта и аккаунт.
 * Правая колонка в макете пустая — блоки той же ширины, что на соседних вкладках.
 */
export const OtherSettings = () => {
  // В сессии логин лежит в поле email — так его называет API авторизации
  const login = useSessionUser()?.email;

  return (
    <AsideLayout>
      <SettingsCard title="Тема">
        <ThemeSwitch />
        <Text variant="caption-2" color="tertiary">
          Сохраняется для этого браузера
        </Text>
      </SettingsCard>

      <SettingsCard title="Дата расчёта" description="Для демо и проверки на тестовых данных">
        <CalculationDateSetting />
      </SettingsCard>

      <SettingsCard title="Аккаунт">
        {login && (
          <Text variant="body" color="main">
            {login} (вы)
          </Text>
        )}
        <div className="other-settings__actions">
          <ChangePasswordButton />
          <LogoutButton active />
        </div>
      </SettingsCard>
    </AsideLayout>
  );
};
