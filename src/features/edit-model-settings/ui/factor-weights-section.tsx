import {
  MODEL_SETTINGS_LIMITS,
  SCORE_FACTORS,
  type FactorWeights,
} from '@/entities/model-settings';
import { FormSection } from '@/shared/ui/form-section';
import { SettingRow } from '@/shared/ui/setting-row';
import { SliderField } from '@/shared/ui/slider-field';

import { wasNote, withDefault } from '../lib/setting-texts';

interface FactorWeightsSectionProps {
  weights: FactorWeights;
  saved: FactorWeights;
  defaults: FactorWeights;
  onChange: (patch: Partial<FactorWeights>) => void;
}

/** Веса признаков score: слайдер и поле на каждый признак, у названия — «?». */
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
      {SCORE_FACTORS.map(({ id, label, description }) => (
        <SettingRow
          key={id}
          title={label}
          help={withDefault(description, defaults[id])}
          note={wasNote(weights[id], saved[id])}
        >
          {({ titleId, describedBy }) => (
            <SliderField
              {...MODEL_SETTINGS_LIMITS.factorWeight}
              value={weights[id]}
              savedValue={saved[id]}
              onValueChange={(weight) => onChange({ [id]: weight })}
              aria-labelledby={titleId}
              aria-describedby={describedBy}
            />
          )}
        </SettingRow>
      ))}
    </div>
  </FormSection>
);
