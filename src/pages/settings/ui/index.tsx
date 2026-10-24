import { useState } from 'react';

import { useModelSettings, type ModelSettings } from '@/entities/model-settings';
import { useIsAdmin } from '@/entities/session';
import { formatDateTime } from '@/shared/lib/format';
import { useTimedFlag } from '@/shared/lib/timed-flag';
import { Button } from '@/shared/ui/button';
import { StatusScreen } from '@/shared/ui/status-screen';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/tabs';
import { UpdateBadge } from '@/shared/ui/update-badge';
import { ModelSettingsForm, ModelSettingsFormSkeleton } from '@/widgets/model-settings-form';
import { OtherSettings } from '@/widgets/other-settings';
import { UsersSettings } from '@/widgets/users-settings';

import './settings-page.scss';

type SettingsTab = 'model' | 'users' | 'other';

/** Сколько висит «Сохранено, пересчёт выполнен», прежде чем плашка покажет новую версию. */
const SAVED_BADGE_MS = 4000;

/** «23.10.2026, 18:00, analyst» */
const formatUpdate = ({ updatedAt, updatedBy }: ModelSettings) =>
  `${formatDateTime(updatedAt)}, ${updatedBy}`;

/**
 * Настройки по макетам «Настройки — модель / пользователи / другое (…)»: вкладки,
 * на «Модели» — плашка последнего обновления и параметры модели риска (черновик живёт и при
 * переключении вкладок), на «Пользователях» — учётки сотрудников (только администратору),
 * на «Другом» — тема, дата расчёта и аккаунт.
 */
export const SettingsPage = () => {
  const { data, isError, isFetching, refetch } = useModelSettings();
  const [tab, setTab] = useState<SettingsTab>('model');
  const [isJustSaved, flashSaved] = useTimedFlag(SAVED_BADGE_MS);
  const isAdmin = useIsAdmin();

  if (!data && isError) {
    return (
      <StatusScreen
        role="alert"
        title="Не удалось загрузить настройки"
        description="Сервер не ответил. Проверьте соединение и попробуйте ещё раз"
        action={
          <Button variant="primary" loading={isFetching} onClick={() => void refetch()}>
            Повторить
          </Button>
        }
      />
    );
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="settings-page">
      <h1 className="visually-hidden">Настройки</h1>

      <div className="settings-page__head">
        <TabList aria-label="Разделы настроек">
          <Tab value="model">Модель</Tab>
          {isAdmin && <Tab value="users">Пользователи</Tab>}
          <Tab value="other">Другое</Tab>
        </TabList>
        {tab === 'model' && data && (
          <UpdateBadge status={isJustSaved ? 'saved' : 'updated'} updatedAt={formatUpdate(data)} />
        )}
      </div>

      <TabPanel value="model" keepMounted>
        {data ? (
          <ModelSettingsForm key={data.version} settings={data} onSaved={flashSaved} />
        ) : (
          <ModelSettingsFormSkeleton />
        )}
      </TabPanel>
      {isAdmin && (
        <TabPanel value="users" keepMounted>
          <UsersSettings />
        </TabPanel>
      )}
      <TabPanel value="other">
        <OtherSettings />
      </TabPanel>
    </Tabs>
  );
};
