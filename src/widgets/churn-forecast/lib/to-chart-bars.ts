import type { ChurnWeek } from '@/entities/dashboard';
import { SERVICE_FORMS } from '@/shared/config';
import { formatCount, formatDayMonth } from '@/shared/lib/format';
import type { ColumnChartBar, ColumnVariant } from '@/shared/ui/column-chart';

/** Подписи под осью — через неделю, иначе не помещаются. */
const LABEL_EVERY = 2;

const VARIANT_DESCRIPTION: Record<ColumnVariant, string> = {
  fact: 'факт',
  accent: 'прогноз на неделю',
  outline: 'прогноз',
};

/**
 * Недели → столбцы графика: факт серым, ближайшая неделя прогноза — акцентом со значением,
 * дальнейший прогноз — пунктиром. `todayIndex` — где начинается прогноз (для линии «сегодня»).
 */
export const toChartBars = (weeks: readonly ChurnWeek[]) => {
  const todayIndex = weeks.findIndex(({ kind }) => kind === 'forecast');

  const bars = weeks.map((week, index): ColumnChartBar => {
    const variant: ColumnVariant =
      week.kind === 'fact' ? 'fact' : index === todayIndex ? 'accent' : 'outline';
    const date = formatDayMonth(week.weekStart);

    return {
      id: week.weekStart,
      value: week.services,
      variant,
      axisLabel: index % LABEL_EVERY === 0 ? date : undefined,
      valueLabel: variant === 'accent' ? week.services : undefined,
      description: `Неделя ${date} — ${formatCount(week.services, SERVICE_FORMS)}, ${VARIANT_DESCRIPTION[variant]}`,
    };
  });

  return { bars, todayIndex: todayIndex === -1 ? undefined : todayIndex };
};
