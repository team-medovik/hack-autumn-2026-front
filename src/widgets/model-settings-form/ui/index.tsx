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

import './model-settings-form.scss';

interface ModelSettingsFormProps {
  /** Передавайте с `key={settings.version}`: новая версия — чистый черновик. */
  settings: ModelSettings;
  /** Сохранение прошло, риски пересчитаны — показать «Сохранено». */
  onSaved?: () => void;
}

/**
 * Вкладка «Модель» по макетам «Настройки — модель (…)»: параметры слева, действия справа.
 * Ошибки ввода, сброс, уход без сохранения и чужая версия — диалогами поверх.
 */
export const ModelSettingsForm = ({ settings, onSaved }: ModelSettingsFormProps) => {
  const editor = useModelSettingsEditor(settings, { onSaved });
  const { draft, update } = editor;
  const { values: saved, defaults } = settings;

  return (
    <div className="model-settings-form">
      <div className="model-settings-form__params">
        <FactorWeightsSection
          weights={draft.factorWeights}
          saved={saved.factorWeights}
          defaults={defaults.factorWeights}
          onChange={(patch) => update('factorWeights', patch)}
        />
        <RiskThresholdsSection
          thresholds={draft.riskThresholds}
          saved={saved.riskThresholds}
          scoreHistogram={settings.scoreHistogram}
          isValid={editor.isThresholdsValid}
          onChange={(patch) => update('riskThresholds', patch)}
        />
        <FinanceSection
          finance={draft.finance}
          saved={saved.finance}
          onChange={(patch) => update('finance', patch)}
        />
        <ForecastSection
          forecast={draft.forecast}
          saved={saved.forecast}
          onChange={(patch) => update('forecast', patch)}
        />
      </div>

      <aside className="model-settings-form__aside" aria-label="Сохранение настроек">
        <SettingsActions
          canSave={editor.canSave}
          canDiscard={editor.canDiscard}
          canReset={editor.canReset}
          isSaving={editor.isSaving}
          onSave={editor.save}
          onDiscard={editor.discard}
          onReset={editor.resetToDefaults}
        />
      </aside>

      <ConflictDialog
        conflict={editor.conflict}
        onLoadLatest={editor.loadLatest}
        onOverwrite={editor.overwrite}
        onDismiss={editor.dismissConflict}
      />
      <UnsavedChangesGuard when={editor.isDirty} />
    </div>
  );
};
