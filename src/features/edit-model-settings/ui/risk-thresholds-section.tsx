import { useId } from 'react';

import {
  countClientsByLevel,
  getRiskRanges,
  MODEL_SETTINGS_LIMITS,
  type RiskThresholds,
} from '@/entities/model-settings';
import { Field } from '@/shared/ui/field';
import { FormSection } from '@/shared/ui/form-section';
import { NumberInput } from '@/shared/ui/number-input';
import { RISK_LEVEL_LABELS } from '@/shared/ui/risk-level';
import { RiskScale } from '@/shared/ui/risk-scale';
import { Text } from '@/shared/ui/text';

import { SETTING_HELP, withDefault } from '../lib/setting-texts';

import './risk-thresholds-section.scss';

interface RiskThresholdsSectionProps {
  thresholds: RiskThresholds;
  saved: RiskThresholds;
  defaults: RiskThresholds;
  /** Распределение клиентов по баллам — для счётчиков на шкале. */
  scoreHistogram: readonly number[];
  /** Высокий порог не больше среднего — ошибка под полями, шкала — по сохранённым порогам. */
  isValid: boolean;
  onChange: (patch: Partial<RiskThresholds>) => void;
}

/** Пороги уровней риска и шкала: сколько клиентов попадёт в каждый уровень. */
export const RiskThresholdsSection = ({
  thresholds,
  saved,
  defaults,
  scoreHistogram,
  isValid,
  onChange,
}: RiskThresholdsSectionProps) => {
  const errorId = useId();
  const scaleThresholds = isValid ? thresholds : saved;
  const counts = countClientsByLevel(scoreHistogram, scaleThresholds);

  return (
    <FormSection
      title="Уровни риска"
      description="Пороги уровней риска. Высокий должен быть больше среднего"
    >
      <div className="risk-thresholds__fields">
        <Field label="Средний от" help={withDefault(SETTING_HELP.medium, defaults.medium)}>
          {({ id, describedBy }) => (
            <NumberInput
              {...MODEL_SETTINGS_LIMITS.riskThreshold}
              id={id}
              aria-describedby={describedBy}
              value={thresholds.medium}
              changed={thresholds.medium !== saved.medium}
              onValueChange={(medium) => onChange({ medium })}
            />
          )}
        </Field>
        <Field label="Высокий от" help={withDefault(SETTING_HELP.high, defaults.high)}>
          {({ id, describedBy }) => (
            <NumberInput
              {...MODEL_SETTINGS_LIMITS.riskThreshold}
              id={id}
              aria-describedby={isValid ? describedBy : `${errorId} ${describedBy}`}
              value={thresholds.high}
              changed={thresholds.high !== saved.high}
              error={!isValid}
              onValueChange={(high) => onChange({ high })}
            />
          )}
        </Field>
      </div>

      {!isValid && (
        <Text id={errorId} variant="caption" color="danger" role="alert">
          Порог высокого должен быть больше порога среднего ({thresholds.medium})
        </Text>
      )}

      <RiskScale
        aria-label="Клиенты по уровням риска"
        segments={getRiskRanges(scaleThresholds).map(({ level, from, to, span }) => ({
          level,
          weight: span,
          label: `${RISK_LEVEL_LABELS[level]} ${from}–${to}`,
          note: `${counts[level]} кл.`,
        }))}
      />
    </FormSection>
  );
};
