import { MODEL_SETTINGS_LIMITS, type ForecastSettings } from '@/entities/model-settings';
import { Field } from '@/shared/ui/field';
import { FormSection } from '@/shared/ui/form-section';
import { NumberInput } from '@/shared/ui/number-input';

import './forecast-section.scss';

interface ForecastSectionProps {
  forecast: ForecastSettings;
  saved: ForecastSettings;
  onChange: (patch: Partial<ForecastSettings>) => void;
}

/** Горизонт и частота пересчёта прогноза оттока. */
export const ForecastSection = ({ forecast, saved, onChange }: ForecastSectionProps) => (
  <FormSection title="Прогноз">
    <div className="forecast-section__fields">
      <Field label="Горизонт, дней" layout="stacked">
        <NumberInput
          {...MODEL_SETTINGS_LIMITS.horizonDays}
          value={forecast.horizonDays}
          changed={forecast.horizonDays !== saved.horizonDays}
          onValueChange={(horizonDays) => onChange({ horizonDays })}
        />
      </Field>
      <Field label="Пересчёт прогноза, мин" layout="stacked">
        <NumberInput
          {...MODEL_SETTINGS_LIMITS.recalculationIntervalMinutes}
          value={forecast.recalculationIntervalMinutes}
          changed={forecast.recalculationIntervalMinutes !== saved.recalculationIntervalMinutes}
          onValueChange={(recalculationIntervalMinutes) =>
            onChange({ recalculationIntervalMinutes })
          }
        />
      </Field>
    </div>
  </FormSection>
);
