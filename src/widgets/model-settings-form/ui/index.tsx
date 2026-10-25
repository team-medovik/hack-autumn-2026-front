import type { ModelSettings } from '@/entities/model-settings';
import {
  ConflictDialog,
  FactorWeightsSection,
  FinanceSection,
  ForecastSection,
  RiskThresholdsSection,
  SettingsActions,
  UnsavedChangesGuard,
  useModelSettingsEditor,
} from '@/features/edit-model-settings';
import { AsideLayout } from '@/shared/ui/aside-layout';

import { ReadOnlyNotice } from './read-only-notice';

import './model-settings-form.scss';

interface ModelSettingsFormProps {
  /** Передавайте с `key={settings.version}`: новая версия — чистый черновик. */
  settings: ModelSettings;
  /** Сохранение прошло, риски пересчитаны — показать «Сохранено». */
  onSaved?: () => void;
  /** Только просмотр: параметры недоступны, вместо кнопок — пояснение, кто может менять. */
  readOnly?: boolean;
}

/**
 * Вкладка «Модель» по макетам «Настройки — модель (…)»: параметры слева, действия справа.
 * Ошибки ввода, сброс, уход без сохранения и чужая версия — диалогами поверх.
 */
export const ModelSettingsForm = ({
  settings,
  onSaved,
  readOnly = false,
}: ModelSettingsFormProps) => {
  const editor = useModelSettingsEditor(settings, { onSaved });
  const { draft, update } = editor;
  const { values: saved, defaults } = settings;

  return (
    <>
      <AsideLayout
        stickyAside
        asideLabel={readOnly ? 'Только просмотр' : 'Сохранение настроек'}
        aside={
          readOnly ? (
            <ReadOnlyNotice />
          ) : (
            <SettingsActions
              canSave={editor.canSave}
              canDiscard={editor.canDiscard}
              canReset={editor.canReset}
              isSaving={editor.isSaving}
              onSave={editor.save}
              onDiscard={editor.discard}
              onReset={editor.resetToDefaults}
            />
          )
        }
      >
        <FactorWeightsSection
          features={settings.featureDefinitions}
          weights={draft.factorWeights}
          saved={saved.factorWeights}
          defaults={defaults.factorWeights}
          onChange={(patch) => update('factorWeights', patch)}
          disabled={readOnly}
        />
        <RiskThresholdsSection
          thresholds={draft.riskThresholds}
          saved={saved.riskThresholds}
          defaults={defaults.riskThresholds}
          scoreHistogram={settings.scoreHistogram}
          isValid={editor.isThresholdsValid}
          onChange={(patch) => update('riskThresholds', patch)}
          disabled={readOnly}
        />
        <FinanceSection
          finance={draft.finance}
          saved={saved.finance}
          defaults={defaults.finance}
          onChange={(patch) => update('finance', patch)}
          disabled={readOnly}
        />
        <ForecastSection
          forecast={draft.forecast}
          saved={saved.forecast}
          defaults={defaults.forecast}
          onChange={(patch) => update('forecast', patch)}
          disabled={readOnly}
        />
      </AsideLayout>

      <ConflictDialog
        conflict={editor.conflict}
        onLoadLatest={editor.loadLatest}
        onOverwrite={editor.overwrite}
        onDismiss={editor.dismissConflict}
      />
      <UnsavedChangesGuard when={editor.isDirty} />
    </>
  );
};
