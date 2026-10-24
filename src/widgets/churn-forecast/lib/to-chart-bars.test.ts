import { describe, expect, it } from 'vitest';

import type { ChurnWeek } from '@/entities/dashboard';

import { toChartBars } from './to-chart-bars';

const week = (day: number, kind: ChurnWeek['kind'], services: number): ChurnWeek => ({
  weekStart: `2026-10-${String(day).padStart(2, '0')}`,
  kind,
  services,
});

describe('toChartBars', () => {
  const weeks = [
    week(5, 'fact', 8),
    week(12, 'fact', 11),
    week(19, 'forecast', 18),
    week(26, 'forecast', 5),
  ];

  it('факт — серый, ближайший прогноз — акцент со значением, дальше — пунктир', () => {
    const { bars } = toChartBars(weeks);

    expect(bars.map(({ variant }) => variant)).toEqual(['fact', 'fact', 'accent', 'outline']);
    expect(bars.map(({ valueLabel }) => valueLabel)).toEqual([undefined, undefined, 18, undefined]);
  });

  it('подписывает ось через неделю и описывает каждый столбец', () => {
    const { bars } = toChartBars(weeks);

    expect(bars.map(({ axisLabel }) => axisLabel)).toEqual([
      '05.10',
      undefined,
      '19.10',
      undefined,
    ]);
    expect(bars[2].description).toBe('Неделя 19.10 — 18 услуг, прогноз на неделю');
  });

  it('линия «сегодня» — перед первой неделей прогноза, без прогноза её нет', () => {
    expect(toChartBars(weeks).todayIndex).toBe(2);
    expect(toChartBars(weeks.slice(0, 2)).todayIndex).toBeUndefined();
  });
});
