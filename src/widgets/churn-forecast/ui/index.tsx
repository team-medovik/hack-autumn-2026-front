import { useId } from 'react';

import type { ChurnForecast as ChurnForecastData } from '@/entities/dashboard';
import { SERVICE_FORMS } from '@/shared/config';
import { formatCount } from '@/shared/lib/format';
import { Card, CardHeader } from '@/shared/ui/card';
import { ChartLegend, ColumnChart, type ChartLegendItem } from '@/shared/ui/column-chart';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton, SkeletonText } from '@/shared/ui/skeleton';
import { Text } from '@/shared/ui/text';

import { toChartBars } from '../lib/to-chart-bars';

const LEGEND: ChartLegendItem[] = [
  { label: 'факт', variant: 'fact' },
  { label: 'прогноз на неделю', variant: 'accent' },
  { label: 'дальше', variant: 'outline' },
];

interface ChurnForecastProps {
  /** `undefined` — данные загружаются. */
  data?: ChurnForecastData;
  className?: string;
}

/** Факт удалений и прогноз непродлений по неделям + сколько услуг под риском сейчас. */
export const ChurnForecast = ({ data, className }: ChurnForecastProps) => {
  const titleId = useId();

  const renderBody = () => {
    if (!data) {
      return <SkeletonText />;
    }
    if (data.weeks.length === 0) {
      return (
        <EmptyState
          title="График появится после второго снимка"
          description="Отток считается по разнице снимков"
        />
      );
    }

    const { bars, todayIndex } = toChartBars(data.weeks);

    return (
      <>
        <ColumnChart
          aria-label="Отток услуг по неделям"
          bars={bars}
          divider={
            todayIndex === undefined ? undefined : { beforeIndex: todayIndex, label: 'сегодня' }
          }
        />
        <ChartLegend items={LEGEND} />
      </>
    );
  };

  return (
    <Card className={className} aria-labelledby={titleId} aria-busy={!data}>
      <CardHeader
        titleId={titleId}
        title="Отток услуг по неделям"
        hint="Слева — сколько услуг удалили по факту, справа — сколько, по прогнозу, не продлят"
        description="Факт удалений и прогноз непродлений, услуг в неделю"
        aside={
          <>
            {data ? (
              <Text as="span" variant="label" color="main">
                {formatCount(data.atRiskServices, SERVICE_FORMS)}
              </Text>
            ) : (
              <Skeleton width={66} height={16} />
            )}
            <Text as="span" variant="caption-2" color="tertiary">
              под риском сейчас
            </Text>
          </>
        }
      />
      {renderBody()}
    </Card>
  );
};
