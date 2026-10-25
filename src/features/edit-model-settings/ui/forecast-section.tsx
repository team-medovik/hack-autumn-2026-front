import { MODEL_SETTINGS_LIMITS, type ForecastSettings } from '@/entities/model-settings';
import { Field } from '@/shared/ui/field';
import { FormSection } from '@/shared/ui/form-section';
import { NumberInput } from '@/shared/ui/number-input';

import { SETTING_HELP } from '../lib/setting-texts';

interface ForecastSectionProps {
  forecast: ForecastSettings;
  saved: ForecastSettings;
  defaults: ForecastSettings;
  onChange: (patch: Partial<ForecastSettings>) => void;
  /** Только просмотр: значения видны, менять нельзя. */
  disabled?: boolean;
}

const { min, max } = MODEL_SETTINGS_LIMITS.horizonDays;

/**
 * Горизонт прогноза оттока. Интервал пересчёта в макете больше не редактируется — он остаётся
 * в контракте и сохраняется как был.
 */
export const ForecastSection = ({
  forecast,
  saved,
  defaults,
  onChange,
  disabled,
}: ForecastSectionProps) => (
  <FormSection title="Прогноз">
    <Field
      label="Горизонт, дней"
      layout="stacked"
      help={`${SETTING_HELP.horizonDays} От ${min} до ${max}, по умолчанию ${defaults.horizonDays}`}
    >
      {({ id, describedBy }) => (
        <NumberInput
          {...MODEL_SETTINGS_LIMITS.horizonDays}
          id={id}
          aria-describedby={describedBy}
          value={forecast.horizonDays}
          changed={forecast.horizonDays !== saved.horizonDays}
          onValueChange={(horizonDays) => onChange({ horizonDays })}
          disabled={disabled}
        />
      )}
    </Field>
  </FormSection>
);
