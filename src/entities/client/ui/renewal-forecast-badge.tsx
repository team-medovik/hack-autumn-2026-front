import { Badge } from '@/shared/ui/badge';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import { Text } from '@/shared/ui/text';

import { describeRenewalForecast } from '../lib/renewal-forecast';
import type { ClientService } from '../model/card-types';

import './renewal-forecast-badge.scss';

const EMPTY_LABELS = { unavailable: 'Нет прогноза', 'not-applicable': 'Нет оценки' } as const;

interface RenewalForecastBadgeProps {
  service: Pick<ClientService, 'lossProbability' | 'score'>;
}

/**
 * Прогноз непродления услуги (слой «Прогноз непродления»): плашка с вероятностью от ML или
 * «Нет прогноза» / «Нет оценки», рядом «?» с пояснением.
 */
export const RenewalForecastBadge = ({ service }: RenewalForecastBadgeProps) => {
  const { state, value, hint } = describeRenewalForecast(service);

  return (
    <span className="renewal-forecast-badge">
      {state === 'predicted' ? (
        // Пробел между частями — для скринридера и копирования; на экране отступ даёт gap плашки
        <Badge>
          <Text as="span" variant="caption-3" color="inherit">
            Прогноз непродления
          </Text>{' '}
          {value}
        </Badge>
      ) : (
        <Badge tone="muted">{EMPTY_LABELS[state]}</Badge>
      )}
      <HintTooltip label={state === 'predicted' ? 'Что за прогноз' : 'Почему нет прогноза'}>
        {hint}
      </HintTooltip>
    </span>
  );
};
