import { MODEL_SETTINGS_LIMITS, type FinanceSettings } from '@/entities/model-settings';
import { FormSection } from '@/shared/ui/form-section';
import { SettingRow } from '@/shared/ui/setting-row';
import { SliderField } from '@/shared/ui/slider-field';
import { Switch } from '@/shared/ui/switch';

interface FinanceSectionProps {
  finance: FinanceSettings;
  saved: FinanceSettings;
  onChange: (patch: Partial<FinanceSettings>) => void;
}

/** Какие деньги клиента доступны для продления и как баланс влияет на потерю. */
export const FinanceSection = ({ finance, saved, onChange }: FinanceSectionProps) => (
  <FormSection
    title="Финансы"
    hint="Какие деньги на счёте клиента считаются доступными для продления и насколько баланс уменьшает потерю"
  >
    <div>
      <SettingRow
        title="Считать бонусы доступными деньгами"
        hint="только если бонусы клиента разблокированы"
      >
        {({ titleId, hintId }) => (
          <Switch
            checked={finance.bonusesAsMoney}
            onCheckedChange={(bonusesAsMoney) => onChange({ bonusesAsMoney })}
            aria-labelledby={titleId}
            aria-describedby={hintId}
          />
        )}
      </SettingRow>

      <SettingRow
        title="Считать реферальный баланс доступными деньгами"
        hint="автопродление с него не списывает"
      >
        {({ titleId, hintId }) => (
          <Switch
            checked={finance.referralBalanceAsMoney}
            onCheckedChange={(referralBalanceAsMoney) => onChange({ referralBalanceAsMoney })}
            aria-labelledby={titleId}
            aria-describedby={hintId}
          />
        )}
      </SettingRow>

      <SettingRow
        title="Учёт баланса в потере, k"
        hint={
          <>
            0 — при достаточном балансе потерь нет
            <br />1 — баланс не важен
          </>
        }
      >
        {({ titleId, hintId }) => (
          <SliderField
            {...MODEL_SETTINGS_LIMITS.balanceLossFactor}
            value={finance.balanceLossFactor}
            savedValue={saved.balanceLossFactor}
            onValueChange={(balanceLossFactor) => onChange({ balanceLossFactor })}
            aria-labelledby={titleId}
            aria-describedby={hintId}
          />
        )}
      </SettingRow>
    </div>
  </FormSection>
);
