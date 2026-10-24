import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

import './settings-actions.scss';

interface SettingsActionsProps {
  canSave: boolean;
  canDiscard: boolean;
  canReset: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onReset: () => void;
}

/** Колонка действий: сохранить, отменить правки, сбросить по умолчанию (с подтверждением). */
export const SettingsActions = ({
  canSave,
  canDiscard,
  canReset,
  isSaving,
  onSave,
  onDiscard,
  onReset,
}: SettingsActionsProps) => (
  <div className="settings-actions">
    <Button variant="primary" fullWidth loading={isSaving} disabled={!canSave} onClick={onSave}>
      Сохранить
    </Button>
    <Button variant="secondary" fullWidth disabled={!canDiscard} onClick={onDiscard}>
      Отменить
    </Button>
    <Dialog
      title="Сбросить настройки по умолчанию?"
      description="Веса, пороги и остальные параметры вернутся к исходным значениям. Риски и потери пересчитаются."
      confirmLabel="Сбросить"
      onConfirm={onReset}
      trigger={
        <Button variant="secondary" fullWidth disabled={!canReset}>
          Сбросить по умолчанию
        </Button>
      }
    />
  </div>
);
