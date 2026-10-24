import {
  MODEL_SETTINGS_LIMITS,
  SCORE_FACTORS,
  type FactorWeights,
} from '@/entities/model-settings';
import { FormSection } from '@/shared/ui/form-section';
import { SettingRow } from '@/shared/ui/setting-row';
import { SliderField } from '@/shared/ui/slider-field';

import { factorHint } from '../lib/factor-hint';

interface FactorWeightsSectionProps {
  weights: FactorWeights;
  saved: FactorWeights;
  defaults: FactorWeights;
  onChange: (patch: Partial<FactorWeights>) => void;
}

/** Веса признаков score: слайдер и поле на каждый признак. */
export const FactorWeightsSection = ({
  weights,
  saved,
  defaults,
  onChange,
}: FactorWeightsSectionProps) => (
  <FormSection
    title="Веса признаков"
    hint="Сколько баллов score даёт признак в полную силу. Score клиента — сумма вкладов признаков, но не больше 100"
  >
    <div>
      {SCORE_FACTORS.map(({ id, label, behavior }) => (
        <SettingRow
          key={id}
          title={label}
          hint={factorHint({
            behavior,
            value: weights[id],
            saved: saved[id],
            byDefault: defaults[id],
          })}
        >
          {({ titleId, hintId }) => (
            <SliderField
              {...MODEL_SETTINGS_LIMITS.factorWeight}
              value={weights[id]}
              savedValue={saved[id]}
              onValueChange={(weight) => onChange({ [id]: weight })}
              aria-labelledby={titleId}
              aria-describedby={hintId}
            />
          )}
        </SettingRow>
      ))}
    </div>
  </FormSection>
);
