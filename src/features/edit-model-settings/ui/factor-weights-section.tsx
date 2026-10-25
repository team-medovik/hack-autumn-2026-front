import {
  MODEL_SETTINGS_LIMITS,
  type FactorWeights,
  type FeatureDefinition,
} from '@/entities/model-settings';
import { FormSection } from '@/shared/ui/form-section';
import { SettingRow } from '@/shared/ui/setting-row';
import { SliderField } from '@/shared/ui/slider-field';

import { wasNote, withDefault } from '../lib/setting-texts';

interface FactorWeightsSectionProps {
  /** Каталог признаков с сервера — порядок, названия и подсказки строк. */
  features: FeatureDefinition[];
  weights: FactorWeights;
  saved: FactorWeights;
  defaults: FactorWeights;
  onChange: (patch: FactorWeights) => void;
  /** Только просмотр: значения видны, менять нельзя. */
  disabled?: boolean;
}

/**
 * Веса признаков score: слайдер и поле на каждый признак из каталога, у названия — «?».
 * Признак без веса в настройках не показываем — редактировать нечего.
 */
export const FactorWeightsSection = ({
  features,
  weights,
  saved,
  defaults,
  onChange,
  disabled,
}: FactorWeightsSectionProps) => (
  <FormSection
    title="Веса признаков"
    hint="Сколько баллов score даёт признак в полную силу. Score клиента — сумма вкладов признаков, но не больше 100"
  >
    <div>
      {features
        .filter(({ key }) => weights[key] !== undefined)
        .map(({ key, label, description }) => (
          <SettingRow
            key={key}
            title={label}
            help={
              defaults[key] === undefined ? description : withDefault(description, defaults[key])
            }
            note={wasNote(weights[key], saved[key] ?? weights[key])}
          >
            {({ titleId, describedBy }) => (
              <SliderField
                {...MODEL_SETTINGS_LIMITS.factorWeight}
                value={weights[key]}
                savedValue={saved[key] ?? weights[key]}
                onValueChange={(weight) => onChange({ [key]: weight })}
                disabled={disabled}
                aria-labelledby={titleId}
                aria-describedby={describedBy}
              />
            )}
          </SettingRow>
        ))}
    </div>
  </FormSection>
);
