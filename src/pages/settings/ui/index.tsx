import { useState } from 'react';

import { useModelSettings, type ModelSettings } from '@/entities/model-settings';
import { formatDateTime } from '@/shared/lib/format';
import { useTimedFlag } from '@/shared/lib/timed-flag';
import { Button } from '@/shared/ui/button';
import { StateMessage } from '@/shared/ui/state-message';
import { StatusScreen } from '@/shared/ui/status-screen';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/tabs';
import { UpdateBadge } from '@/shared/ui/update-badge';
import { ModelSettingsForm, ModelSettingsFormSkeleton } from '@/widgets/model-settings-form';

import './settings-page.scss';

type SettingsTab = 'model' | 'users' | 'other';

/** Сколько висит «Сохранено, пересчёт выполнен», прежде чем плашка покажет новую версию. */
const SAVED_BADGE_MS = 4000;

/** «23.10.2026, 18:00, analyst» */
const formatUpdate = ({ updatedAt, updatedBy }: ModelSettings) =>
  `${formatDateTime(updatedAt)}, ${updatedBy}`;

const SoonMessage = ({ title }: { title: string }) => (
  <StateMessage
    className="settings-page__soon"
    title={title}
    description="Раздел в разработке. Пока настраивается только модель риска."
  />
);

/**
 * Настройки по макетам «Настройки — модель (…)»: вкладки, плашка последнего обновления,
 * на вкладке «Модель» — параметры модели риска. Черновик модели живёт и при переключении вкладок.
 */
export const SettingsPage = () => {
  const { data, isError, isFetching, refetch } = useModelSettings();
  const [tab, setTab] = useState<SettingsTab>('model');
  const [isJustSaved, flashSaved] = useTimedFlag(SAVED_BADGE_MS);

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
          <Tab value="users">Пользователи</Tab>
          <Tab value="other">Другое</Tab>
        </TabList>
        {data && (
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
      <TabPanel value="users">
        <SoonMessage title="Пользователи" />
      </TabPanel>
      <TabPanel value="other">
        <SoonMessage title="Другие настройки" />
      </TabPanel>
    </Tabs>
  );
};
