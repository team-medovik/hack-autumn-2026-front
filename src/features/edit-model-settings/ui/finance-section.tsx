import { MODEL_SETTINGS_LIMITS, type FinanceSettings } from '@/entities/model-settings';
import { FormSection } from '@/shared/ui/form-section';
import { SettingRow } from '@/shared/ui/setting-row';
import { SliderField } from '@/shared/ui/slider-field';
import { Switch } from '@/shared/ui/switch';

import { SETTING_HELP, wasNote, withDefault } from '../lib/setting-texts';

interface FinanceSectionProps {
  finance: FinanceSettings;
  saved: FinanceSettings;
  defaults: FinanceSettings;
  onChange: (patch: Partial<FinanceSettings>) => void;
  /** Только просмотр: значения видны, менять нельзя. */
  disabled?: boolean;
}

/** Какие деньги клиента доступны для продления и как баланс влияет на потерю. */
export const FinanceSection = ({
  finance,
  saved,
  defaults,
  onChange,
  disabled,
}: FinanceSectionProps) => (
  <FormSection
    title="Финансы"
    hint="Какие деньги на счёте клиента считаются доступными для продления и насколько баланс уменьшает потерю"
  >
    <div>
      <SettingRow title="Считать бонусы доступными деньгами" help={SETTING_HELP.bonusesAsMoney}>
        {({ titleId, describedBy }) => (
          <Switch
            checked={finance.bonusesAsMoney}
            onCheckedChange={(bonusesAsMoney) => onChange({ bonusesAsMoney })}
            disabled={disabled}
            aria-labelledby={titleId}
            aria-describedby={describedBy}
          />
        )}
      </SettingRow>

      <SettingRow
        title="Считать реферальный баланс доступными деньгами"
        help={SETTING_HELP.referralBalanceAsMoney}
      >
        {({ titleId, describedBy }) => (
          <Switch
            checked={finance.referralBalanceAsMoney}
            onCheckedChange={(referralBalanceAsMoney) => onChange({ referralBalanceAsMoney })}
            disabled={disabled}
            aria-labelledby={titleId}
            aria-describedby={describedBy}
          />
        )}
      </SettingRow>

      <SettingRow
        title="Учёт баланса в потере, k"
        help={withDefault(SETTING_HELP.balanceLossFactor, defaults.balanceLossFactor)}
        note={wasNote(finance.balanceLossFactor, saved.balanceLossFactor)}
      >
        {({ titleId, describedBy }) => (
          <SliderField
            {...MODEL_SETTINGS_LIMITS.balanceLossFactor}
            value={finance.balanceLossFactor}
            savedValue={saved.balanceLossFactor}
            onValueChange={(balanceLossFactor) => onChange({ balanceLossFactor })}
            disabled={disabled}
            aria-labelledby={titleId}
            aria-describedby={describedBy}
          />
        )}
      </SettingRow>
    </div>
  </FormSection>
);
