import type { DashboardData } from '@/entities/dashboard';
import { ChurnForecast } from '@/widgets/churn-forecast';
import { LossOverview } from '@/widgets/loss-overview';
import { LossReasons } from '@/widgets/loss-reasons';
import { RiskQueue } from '@/widgets/risk-queue';
import { TopRisk } from '@/widgets/top-risk';

interface DashboardGridProps {
  /** `undefined` — первая загрузка: каждый виджет показывает свой скелетон. */
  data?: DashboardData;
}

/** Сетка главной по макету «Дом»: сводка, затем две пары карточек. */
export const DashboardGrid = ({ data }: DashboardGridProps) => (
  <div className="home-page">
    <h1 className="visually-hidden">Сводка по рискам оттока</h1>

    <LossOverview data={data} />

    <div className="home-page__row home-page__row--focus">
      <TopRisk data={data?.topRisk} />
      <RiskQueue data={data?.riskQueue} selectedId={data?.topRisk?.id} />
    </div>

    <div className="home-page__row home-page__row--trends">
      <LossReasons data={data?.lossReasons} />
      <ChurnForecast data={data?.churn} />
    </div>
  </div>
);
