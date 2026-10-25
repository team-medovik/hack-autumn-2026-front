import { Text } from '@/shared/ui/text';

/** Вместо кнопок сохранения — у тех, кому менять расчёт нельзя (макет «… (только просмотр)»). */
export const ReadOnlyNotice = () => (
  <div className="model-settings-form__notice">
    <Text variant="body" color="main">
      Только просмотр
    </Text>
    <Text variant="caption" color="secondary">
      Изменять настройки расчёта может администратор
    </Text>
  </div>
);
